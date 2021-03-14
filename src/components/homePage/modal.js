import React, {forwardRef,useEffect,useState} from 'react';
import PropTypes from "prop-types";
import { Modal } from 'react-responsive-modal';
import {ModalHero, ModalInfo, ModalEpisodes, ModalEpisodioAtual} from '../style';
import NotFound from '../404';
import { Link } from 'react-router-dom';
import {MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import api from '../../api';
import axiosInstance from '../../axios';
import firebase from '../../firebase'
import 'react-responsive-modal/styles.css';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import Grid from '@material-ui/core/Grid';
import './styleModal.css';
import ProgressBar from './progressBar';

const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#b71c1c',
      },
      secondary: {
        main: '#b71c1c',
      },
    },
  });

const ModalSerie = ((
    {
        name,
        open,
        onCloseModal
    },

)=>{

    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);

    function handleData(_data){
        setData({...data,..._data})
    }

    function handleChange(event) {
        setData({...data,seasonSelected: event.target.value});
    }

    function isWatched(episode,currentSeason,currentEpisode){
        try {
            const history = JSON.parse(episode)
            return (history[name].filter(_item => _item.season == currentSeason)
                .find(_item => _item.episode == currentEpisode));
        } catch (error) {
            return false;
        }
    }

    function progressBar(episode,currentSeason,currentEpisode){
        const _epWatched = isWatched(episode,currentSeason,currentEpisode);
        let _progess = 0
        if(_epWatched){
            _progess = _epWatched ? ((_epWatched.time*100) / _epWatched.duration) : 0
        }

        return _progess;
    }

    function transformSeasonsInLanguagePt(_episode){
        return data.seasonsFormatedPt[data.seasonsFormated.indexOf(_episode)]
    }

    function hasHistory(_nameSerie){
        try {
            const history = JSON.parse(localStorage.history);
           return history[_nameSerie][history[_nameSerie].length-1];
        } catch (error) {
            return false;
        }
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
                
                sessionStorage.episodes = JSON.stringify(_episodes);
                sessionStorage.setItem(
                    'seasonsFormatedPt',
                    JSON.stringify(seasonsFormatedPt)
                )
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
                classNames={{
                    modal: 'customModal',
                }}
                >
                <ModalHero image={data.seasonCurrent.image.original}>
                    {
                        isWatched(localStorage.history,data.seasonCurrent.season,data.seasonCurrent.number) ?
                            <ProgressBar completed= {progressBar(localStorage.history,data.seasonCurrent.season,data.seasonCurrent.number)} />
                        :
                        <div></div>

                    }
                    <button>
                        <PlayArrowOutlinedIcon fontSize="default" />
                        Assistir
                    </button>
                </ModalHero>
                <ModalEpisodioAtual></ModalEpisodioAtual>
                <ModalInfo>
                    <h3>{`T${data.seasonCurrent.season} E${data.seasonCurrent.number}. ${data.seasonCurrentPt.name}`}</h3>
                    <p>{data.seasonCurrentPt.overview}</p>
                </ModalInfo>
                <ModalEpisodes>
                    <h2>Episodios</h2>
                    <hr></hr>
                    {
                        seasonsFormated.
                        filter(_episode => _episode.season == data.seasonSelected)
                        .map((_value)=>(
                            <Link key={Math.random()} to={{pathname:`${name}/${_value.season}x${_value.number}`}}
                                className={`${isWatched(localStorage.history,_value.season,_value.number)?'isWatched':''}`}
                            >
                                <div>
                                    <img src={_value.image.medium} />
                                    {
                                        isWatched(localStorage.history,_value.season,_value.number) ?
                                        <div
                                            className='episodeProgress'
                                            style={
                                                {
                                                    width: `${progressBar(localStorage.history,_value.season,_value.number)}%`
                                                }
                                            }>
                                        </div>
                                        :
                                        <div></div>

                                    }
                                </div>
                                <h4>{`${_value.number}. ${transformSeasonsInLanguagePt(_value).name}`}</h4>
                                <p>{transformSeasonsInLanguagePt(_value).overview}</p>
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
        <h1> Carregando </h1>
        </Modal>
    );
    

})

ModalSerie.propTypes = {
    onCloseModal: PropTypes.func,
};
export default ModalSerie;