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
import Movie from './modal/movie';

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
    const [isMovie,setIsMovie] = useState(false);
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
            append_to_response: 'credits',
            language: 'pt-br'
        }
        const _result = async () => {
            setLoading(true);
            setError(true);
            setIsMovie(false);
            try {
                const _serie = await firebase.getSeries(`${name}`);
                if(_serie != null && Object.keys(_serie).length != 0){
                    for (let index = 1; index <= _serie.seasons; index++) {
                        params.append_to_response = `${params.append_to_response},season/${index}`;
                    }
                    const _rep = await axiosInstance.get(`tv/${_serie.id}`,{params});
                    let seasonsFormatedPt = [];
                    for (let index = 1; index <= _serie.seasons; index++) {
                        seasonsFormatedPt.push(..._rep.data[`season/${index}`].episodes)
                    }
                    let data = {};
                    let seasons = new Set(seasonsFormatedPt.map(item => item.season_number))
                    data.seasonsFormatedPt = seasonsFormatedPt;
                    data.serie = _serie;
                    data.seasons = Array.from(seasons);
                    const _hasHistory = hasHistory(name);
                    if(_hasHistory){
                        data.seasonCurrentPt = seasonsFormatedPt
                        .filter(_episode => _episode.season_number == _hasHistory.season)
                        .find((_item)=>_item.episode_number == _hasHistory.episode);
                    }else{
                        data.seasonCurrentPt = seasonsFormatedPt[0]
                    }
                    handleData(data);
                    setError(false);
                }else{
                    if(name){
                        const _rep = await axiosInstance.get(`movie/${name}`,{params});
                        if(_rep != null && Object.keys(_rep.data).length != 0){
                            let _data = data;
                            _data.seasonCurrentPt = _rep.data;
                            _data.seasonCurrent = _rep.data;
                            handleData(_data);
                            setIsMovie(true);
                            setError(false);
                        }
                    }
                    
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
                    {
                        isMovie ? <Movie history={history} seasonCurrentPt={data.seasonCurrentPt}></Movie>:
                        <>
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
                                        isWatched(data.seasonCurrentPt.season_number,data.seasonCurrentPt.episode_number) ?
                                            <SizedBox 
                                                flex='flex' 
                                                width='100%' 
                                                alignContent='center' 
                                                flexContent='flex-start'
                                                >
                                                <ProgressBar completed= {progressBar(data.seasonCurrentPt.season_number,data.seasonCurrentPt.episode_number)} />
                                                <Title color='#e8e8e8' size='1rem' weight='bold'>{`${format(
                                                        isWatched(data.seasonCurrentPt.season_number,data.seasonCurrentPt.episode_number).time
                                                )} de ${format(
                                                    isWatched(data.seasonCurrentPt.season_number,data.seasonCurrentPt.episode_number).duration
                                            )}`}</Title>
                                            </SizedBox>
                                        :
                                        <div></div>

                                    }
                                    <SizedBox height='1vh' />
                                    <ButtonGroup variant="contained"aria-label="contained primary button group">
                                        <Button onClick={()=>{
                                            history.push({pathname:`${name}/${data.seasonCurrentPt.season_number}x${data.seasonCurrentPt.episode_number}`})
                                        }}>
                                            <PlayArrowOutlinedIcon fontSize="default" />
                                            Assistir
                                        </Button>
                                    </ButtonGroup>
                                </SizedBox>

                            </ModalHero>
                            <ModalEpisodioAtual></ModalEpisodioAtual>
                            <ModalInfo>
                                <h3>{`T${data.seasonCurrentPt.season_number} E${data.seasonCurrentPt.episode_number}. ${data.seasonCurrentPt.name}`}</h3>
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
                                    data.seasonsFormatedPt.
                                    filter(_episode => _episode.season_number == data.seasonSelected)
                                    .map((_value)=>(
                                        <Link key={Math.random()} to={{pathname:`${name}/${_value.season_number}x${_value.episode_number}`}}
                                            className={`${isWatched(_value.season_number,_value.episode_number)?'isWatched':''}`}
                                        >
                                            <div>
                                                <img src={_value.still_path != null ? `https://www.themoviedb.org/t/p/original${_value.still_path}` : ImgNotFound} />
                                                {
                                                    isWatched(_value.season_number,_value.episode_number) ?
                                                        <EpisodeProgress value={progressBar(_value.season_number,_value.episode_number)} />
                                                    :
                                                    <div></div>

                                                }
                                            </div>
                                            <h4>{`${_value.episode_number}. ${_value.name}`}</h4>
                                            <SizedBox weight='bold' margin='1% 0'>
                                                <p>{_value.overview.length != 0 ? _value.overview: 'Descrição indisponível no momento.'}</p>
                                            </SizedBox>
                                        </Link>
                                    ))
                                }
                            </ModalEpisodes>
                        </>
                    }
                
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