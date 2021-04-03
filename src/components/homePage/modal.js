import React, {useEffect,useState} from 'react';
import PropTypes from "prop-types";
import { Modal } from 'react-responsive-modal';
import {ModalHero, ModalInfo, ModalEpisodes, ModalEpisodioAtual, SizedBox, Title, Center, EpisodeProgress} from '../style';
import NotFound from '../404';
import { Link } from 'react-router-dom';
import api from '../../api';
import axiosInstance from '../../axios';
import firebase from '../../firebase'
import 'react-responsive-modal/styles.css';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import './styleModal.css';
import ProgressBar from './progressBar';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ImgNotFound from '../../img/not-found.png';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      color:'white;'
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    select: {
        color: 'white',
        '&:before': {
            borderColor: 'red',
        },
        '&:after': {
            borderColor: 'red',
        },
        '&:hover:not(.Mui-disabled):before': {
            borderColor: 'red',
        }
    },
    icon: {
        fill: 'white',
    },
  }));

const format = (seconds) => {
    if (isNaN(seconds)) {
      return `00:00`;
    }
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const ModalSerie = ((
    {
        name,
        open,
        history,
        onCloseModal
    },

)=>{

    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);
    const classes = useStyles();

    function handleData(_data){
        setData({...data,..._data})
    }

    function handleChange(event) {
        setData({...data,seasonSelected: event.target.value});
    }

    function isWatched(currentSeason,currentEpisode){
        try {
            const history = JSON.parse(localStorage.history)
            return (history[name].filter(_item => _item.season == currentSeason)
                .find(_item => _item.episode == currentEpisode));
        } catch (error) {
            return false;
        }
    }

    function progressBar(currentSeason,currentEpisode){
        const _epWatched = isWatched(currentSeason,currentEpisode);
        let _progess = 0
        if(_epWatched){
            _progess = _epWatched ? ((_epWatched.time*100) / _epWatched.duration) : 0
        }

        return _progess;
    }

    function transformSeasonsInLanguagePt(_episode){
        const _formatPt = data.seasonsFormatedPt[data.seasonsFormated.indexOf(_episode)]
        if(_formatPt.overview.length != 0){
            return _formatPt;
        }
        if(_episode.summary){
            _formatPt.overview = _episode.summary.replace('<p>','').replace('</p>','');
        }
        return _formatPt;
    }

    function hasHistory(_nameSerie){
        try {
            const history = JSON.parse(localStorage.history);
            const max = history[_nameSerie].reduce(function(prev, current) {
                return (prev.date > current.date) ? prev : current
            }) 
           return max;
        } catch (error) {
            return false;
        }
    }

    function checkIsEmpty(_item,_value){
        const indexOf = data.seasonsFormated.indexOf(_item);
        if(_value == null){
            return `https://www.themoviedb.org/t/p/original${data.seasonsFormatedPt[indexOf].still_path}`;
        }
        return _value.medium;
    }

    useEffect(()=>{
        let params = {
            api_key: process.env.REACT_APP_API_KEY,
            append_to_response: '',
            language: 'pt-br'
        }
        const _result = async () => {
            setLoading(true);
            setError(true);
            try {
                const _serie = await firebase.getSeries(`${name}`);
                const _episodes = await firebase.getEpisodes(`${name}`);
                if(_serie != null && _serie.length != 0){
                    for (let index = 1; index <= _serie.seasons; index++) {
                        params.append_to_response = `${params.append_to_response},season/${index}`;
                    }
                    const _rep = await axiosInstance.get(`${_serie.id}`,{params});
                    let seasonsFormatedPt = [];
                    for (let index = 1; index <= _serie.seasons; index++) {
                        seasonsFormatedPt.push(..._rep.data[`season/${index}`].episodes)
                    }
                    const response = await api.get(`${_serie.idMaze}?embed=episodes`);
                    let data = {};
                    let seasons = new Set(response.data._embedded.episodes.map(item => item.season))
                    let seasonsFormated = response.data._embedded.episodes;
                    data.seasonsFormatedPt = seasonsFormatedPt;
                    data.seasonsFormated = seasonsFormated;
                    data.seasons = Array.from(seasons);
                    data.serie = _serie;
                    const _hasHistory = hasHistory(name);
                    if(_hasHistory){
                        data.seasonCurrent = seasonsFormated
                            .filter(_episode => _episode.season == _hasHistory.season)
                            .find((_item)=>_item.number == _hasHistory.episode)
                        data.seasonCurrentPt = seasonsFormatedPt
                        .filter(_episode => _episode.season_number == _hasHistory.season)
                        .find((_item)=>_item.episode_number == _hasHistory.episode);
                    }else{
                        data.seasonCurrent = seasonsFormated[0]
                        data.seasonCurrentPt = seasonsFormatedPt[0]
                    }
                    data.seasonCurrent.summary = data.seasonCurrent.summary.replace('<p>','').replace('</p>','');
                    handleData(data);
                    setError(false);
                }else{
                    throw 'error'
                }
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false)
            }
        
        }
        _result();
    },[name]);

    if(!loading){
        if(!error){
          const {seasonsFormated} = data;
          
          return(
            <Modal 
                open={open} 
                onClose={onCloseModal} 
                closeOnEsc={true}
                onOverlayClick={()=>{
                    history.push({pathname:`/`})
                }}
                classNames={{
                    modal: 'customModal',
                }}
                >
                <ModalHero image={`https://www.themoviedb.org/t/p/original${data.seasonCurrentPt.still_path}`}>
                    <SizedBox 
                        flex='flex' 
                        flexDirection='column'
                        position= 'absolute'
                        alignContent='flex-start'
                        flexContent='center'
                        padding='0 2%'
                        >
                        <SizedBox width='30vh'>
                            <img src={data.serie.image.logo}></img>
                        </SizedBox>
                        {
                            isWatched(data.seasonCurrent.season,data.seasonCurrent.number) ?
                                <SizedBox 
                                    flex='flex' 
                                    width='100%' 
                                    alignContent='center' 
                                    flexContent='flex-start'
                                    >
                                    <ProgressBar completed= {progressBar(data.seasonCurrent.season,data.seasonCurrent.number)} />
                                    <Title color='#e8e8e8' size='1rem' weight='bold'>{`${format(
                                            isWatched(data.seasonCurrent.season,data.seasonCurrent.number).time
                                    )} de ${format(
                                        isWatched(data.seasonCurrent.season,data.seasonCurrent.number).duration
                                )}`}</Title>
                                </SizedBox>
                            :
                            <div></div>

                        }
                        <SizedBox height='1vh' />
                        <ButtonGroup variant="contained"aria-label="contained primary button group">
                            <Button onClick={()=>{
                                history.push({pathname:`${name}/${data.seasonCurrent.season}x${data.seasonCurrent.number}`})
                            }}>
                                <PlayArrowOutlinedIcon fontSize="default" />
                                Assistir
                            </Button>
                        </ButtonGroup>
                    </SizedBox>

                </ModalHero>
                <ModalEpisodioAtual></ModalEpisodioAtual>
                <ModalInfo>
                    <h3>{`T${data.seasonCurrent.season} E${data.seasonCurrent.number}. ${data.seasonCurrentPt.name}`}</h3>
                    <p>{data.seasonCurrentPt.overview}</p>
                </ModalInfo>
                <ModalEpisodes>
                    <SizedBox flex='flex' flexContent='space-between'>
                        <h2>Episodios</h2>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            inputProps={{
                                classes: {
                                    icon: classes.icon,
                                },
                            }}
                            className={classes.select}
                            value={data.seasonSelected}
                            onChange={handleChange}
                            >
                                {
                                    data.seasons
                                    .map((_value)=>(
                                        <MenuItem key={_value} value={_value}>{`${_value}º Temporada`}</MenuItem>
                                    ))
                                }
                            </Select>
                    </SizedBox>
                    <hr></hr>
                    {
                        seasonsFormated.
                        filter(_episode => _episode.season == data.seasonSelected)
                        .map((_value)=>(
                            <Link key={Math.random()} to={{pathname:`${name}/${_value.season}x${_value.number}`}}
                                className={`${isWatched(_value.season,_value.number)?'isWatched':''}`}
                            >
                                <div>
                                    <img src={_value.image != null ? checkIsEmpty(_value,_value.image) : ImgNotFound} />
                                    {
                                        isWatched(_value.season,_value.number) ?
                                            <EpisodeProgress value={progressBar(_value.season,_value.number)} />
                                        :
                                        <div></div>

                                    }
                                </div>
                                <h4>{`${_value.number}. ${transformSeasonsInLanguagePt(_value).name}`}</h4>
                                <SizedBox weight='bold' margin='1% 0'>
                                    <p>{transformSeasonsInLanguagePt(_value).overview}</p>
                                </SizedBox>
                            </Link>
                        ))
                    }
                </ModalEpisodes>
            </Modal>
        );
        }else{
            return(
                <Modal 
                    open={open} 
                    onClose={onCloseModal} 
                    closeOnEsc={true}
                    classNames={{
                        modal: 'customModal',
                    }}
                >
                    <NotFound></NotFound>
                </Modal>
            )
          }
    }
    return(
        <Modal 
            open={open} 
            onClose={onCloseModal} 
            closeOnEsc={true}
            classNames={{
                modal: 'customModal',
            }}
        >
            <SizedBox height='100vh'>
                <Center>
                    <Title>Carregando</Title>
                </Center>
            </SizedBox>
        </Modal>
    );
    

})

ModalSerie.propTypes = {
    onCloseModal: PropTypes.func,
};
export default ModalSerie;