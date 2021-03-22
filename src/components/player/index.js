import React,{ useState, useEffect} from 'react';
import NotFound from '../404';
import {Link} from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ReactPlayer from 'react-player';
import api from '../../api';
import axiosInstance from '../../axios';
import firebase from '../../firebase'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { PlayerContentBtn, PlayerContent, PlayerBack, Title, PlayerInfoContent, SizedBox } from '../style';

const PurpleSwitch = withStyles({
    switchBase: {
      color: '#fc6060',
      '&$checked': {
        color: '#ff0303',
      },
      '&$checked + $track': {
        backgroundColor: 'red'
      },
    },
    checked: {},
    track: {},
  })(Switch);

  const UseStylesFacebook = withStyles({
    colorPrimary: {
        color: 'red',
    },
  })(CircularProgress);

export default function Player(props){

    const [state, setState] = useState({
        legen: false,
      });
    const [data,setData] = useState({seeking:true,duration:0});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);
    const [disable,setDisable] = useState(false);
    const [player,setPlayer] = useState();

    const handleChange = (event) => {
        localStorage.isLegen = event.target.checked;
        setState({legen: event.target.checked });
        const _data = data;
        if(event.target.checked){
            _data.episode = _data.episodes.episodesLegen[_data.indexOf];
            if(!(_data.episode || _data.episode.length != 0)){
                _data.episode = _data.episodes.episodesDub[_data.indexOf];
            }
        }else{
            _data.episode = _data.episodes.episodesDub[_data.indexOf];
        }
        setData({..._data})
    };


    useEffect(()=>{
        setLoading(true);
        
        const _response = async ()=>{
            try {
                await _result();
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false);
            }
        }
        _response()
        
      },[]);

    const _result = async () => {
        let params = {
            api_key: process.env.REACT_APP_API_KEY,
            append_to_response: '',
            language: 'pt-br'
        }
        const _serie = await firebase.getSeries(`${props.match.params.name}`);
        const _episodes = await firebase.getEpisodes(`${props.match.params.name}`);
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
            let _data = {};
            let seasons = new Set(response.data._embedded.episodes.map(item => item.season))
            let seasonsFormated = response.data._embedded.episodes;
            _data.seasonsFormatedPt = seasonsFormatedPt;
            _data.seasonsFormated = seasonsFormated;
            _data.seasons = Array.from(seasons);
            _data.serie = _serie;
            _data.episodes = _episodes;
            setData({..._data});
            getEpisode(props.match.params.episode,{...data,..._data});
        }else{
            throw 'error'
        }
    }

    function getEpisode(id = props.match.params.episode,_value){
        var _data = _value ?? data;
        const _url = id;
        const seasonsFormated =_data.seasonsFormatedPt;
        const length = _url.length;
        const episode = _url.substring(_url.indexOf('x')+1,length);
        const season = _url.substring(0,_url.indexOf('x'));
        
       if(episode && season){
            const _episode = seasonsFormated
                .filter(_ep => _ep.season_number == season)
                .find(_val => _val.episode_number == episode);
                if(_episode){
                    const indexOf = seasonsFormated.indexOf(_episode);
                    var isLegen = false;
                    try {
                        isLegen = JSON.parse(localStorage.isLegen);
                    } catch (error) {
                        
                    }
                    setDisable(false);
                    setState({legen:isLegen})
                    if(_data.episodes.episodesLegen){
                        _data.episode =_data.episodes.episodesLegen[indexOf];
                        if(!_data.episode){
                            setDisable(true);
                            setState({legen:false})
                            _data.episode = _data.episodes.episodesDub[indexOf];
                        }else if(!isLegen && _data.episode){
                            _data.episode = _data.episodes.episodesDub[indexOf];
                        }
                    }else{
                        setDisable(true);
                        setState({legen:false})
                        _data.episode = _data.episodes.episodesDub[indexOf];
                    }
                    _data.episodeComplete = _episode;
                    _data.currentEp = episode;
                    _data.currentSeason = season;
                    _data.indexOf = indexOf;
                    _data.nextEpisodeAvaliable = seasonsFormated[indexOf+1] != null ? true : false;
                    _data.prevsEpisodeAvaliable = seasonsFormated[indexOf-1] != null ? true : false;
                    if(_data.nextEpisodeAvaliable){
                        _data.nextEpisode = seasonsFormated[indexOf+1].season_number + 'x' + seasonsFormated[indexOf+1].episode_number;
                    }
                    if(_data.prevsEpisodeAvaliable){
                        _data.prevEpisode = seasonsFormated[indexOf-1].season_number + 'x' + seasonsFormated[indexOf-1].episode_number;
                    }
                    if(!data.seeking){
                        saveInLocalStorage(season,episode,0,100)
                    }
                    setData({..._data});
                }else{
                    throw 'error'
                  }
                
       }else{
        throw 'error'
      }
    }

    function saveInLocalStorage(season,episode,playedSeconds,duration){
        localStorage.setItem('episode',episode);
        localStorage.setItem('season',season);
        let getHistory = {};
        console.log('asdasd')
        let _jsonParsse = {};
        try {
            _jsonParsse = JSON.parse(localStorage.history);
            getHistory = _jsonParsse; 
        } catch(e) {
            getHistory = {};
        }
        const serieName = props.match.params.name;
        const _json = {[serieName]: {
            'episode': episode,
            'season':season,
            'time':  playedSeconds,
            'duration':duration,
            'date': Date.now()
        }};
        if(!_jsonParsse[serieName]){
            getHistory[Object.keys(_json)] = Object.values(_json);
            localStorage.setItem('history', JSON.stringify(getHistory));
        }else{
            var _jsonSeason = _json[serieName].season;
            var _jsonEpisode = _json[serieName].episode;
            if(!(_jsonParsse[serieName].filter(_item => _item.season == _jsonSeason)
                .find(_item => _item.episode == _jsonEpisode))){
            getHistory[Object.keys(_json)] =[...getHistory[Object.keys(_json)],...Object.values(_json)];
            }else{
            const _ep = _jsonParsse[serieName].filter(_item => _item.season == _jsonSeason)
                .find(_item => _item.episode == _jsonEpisode);
                const index = _jsonParsse[serieName].indexOf(_ep);
                _ep.time = playedSeconds;
                _ep.duration = duration;
                _ep.date = Date.now();
                _jsonParsse[serieName][index] = _ep;
                getHistory = _jsonParsse;
            }
            localStorage.setItem('history', JSON.stringify(getHistory))
        }
    }

    function handleDuration(duration){
        var _data = data;
        _data.duration = duration;
       setData({..._data});

    }

    function isToseek(){
        const {location} = props;
        if(location.query != undefined && !location.query.isToseek){
            return location.query.isToseek
        }
        return true;
    }

    function handleProgress(_data){
        if(_data.playedSeconds == data.duration){
            const _nextEp = data.nextEpisode;
            if(_nextEp){
                getEpisode(_nextEp)
                props.history.push({pathname: `${_nextEp}`, query: {isToseek: false}})
            }
        }
        if (!data.seeking) {
            saveInLocalStorage(
                data.currentSeason,
                data.currentEp,
                _data.playedSeconds,
                data.duration
            )
        }
    }
    
    function handleSeek(){
        var _data = data;
        if(isToseek()){
            console.log('asdasd')
            let _jsonParsse;
            try {
                _jsonParsse = JSON.parse(localStorage.history);
            } catch(e) {
                _jsonParsse = [];
            }
            const _serieName = props.match.params.name;
            if(_jsonParsse[_serieName]){
                const _findHistory = _jsonParsse[_serieName].filter(_item => _item.season == _data.episodeComplete.season_number)
                .find(_item => _item.episode == _data.episodeComplete.episode_number);
                if(_findHistory){
                    if(!(_findHistory.duration - _findHistory.time <= 50)){
                        player.seekTo(parseFloat(_findHistory.time))
                    }
                    
                    _data.seeking = false; 
                }else{
                    _data.seeking = false; 
                }
            }
        }
        _data.seeking = false;
        setData({..._data})
    }

    const ref = _player => {
        setPlayer(_player);
    }

    if(!loading){
        if(!error){
          return(
            <PlayerContent>
                <PlayerBack>
                    <Link to={`/${props.match.params.name}`}>
                        <span className="material-icons">
                            arrow_back
                        </span>
                    </Link>
                    <Title >Voltar</Title>
                </PlayerBack>
                <SizedBox margin='2% 0'></SizedBox>
                <PlayerInfoContent>
                    <SizedBox width='100%' flex='flex' flexContent='center' alignContent='center'>
                        <ReactPlayer
                            ref={ref}
                            playing
                            className='video'
                            onStart = {handleSeek}
                            controls={true}
                            width='98%'
                            height="450px"  
                            url={data.episode} 
                            onProgress={handleProgress}
                            onDuration={handleDuration}
                        />
                    </SizedBox>
                    <SizedBox width='100%' margin='2%' flex='flex' flexWrap='wrap'>
                        <SizedBox width='100%' margin='2% 0'>
                            <PlayerContentBtn>
                                <Link to={`${data.prevEpisode}`} onClick={()=>{
                                        getEpisode(data.prevEpisode)
                                    }} className={`${data.prevsEpisodeAvaliable ? '':'isDisable'}`}>
                                        <span className="material-icons">
                                            keyboard_arrow_left
                                        </span>
                                </Link>
                                <Link to={`${data.nextEpisode}`} onClick={()=>{
                                    getEpisode(data.nextEpisode)
                                    }} className={`${data.nextEpisodeAvaliable ? '':'isDisable'}`}>
                                        <span className="material-icons">
                                            keyboard_arrow_right
                                        </span>
                                </Link>
                            </PlayerContentBtn>
                        </SizedBox>
                        <SizedBox width='46%' margin='0 2%'>
                            <SizedBox width='100%'>
                                <Title weight='bold'> {`${data.episodeComplete.episode_number}. ${data.episodeComplete.name}`}</Title>
                            </SizedBox>
                            <SizedBox width='100%'>
                                <Title size='0.9rem'>{`${data.episodeComplete.season_number}º Temporada`}</Title>
                            </SizedBox>
                        </SizedBox>
                        <SizedBox width='50%' flex='flex' flexContent='flex-end'>
                            <FormControlLabel
                                    control={<PurpleSwitch disabled={disable} checked={state.legen} onChange={handleChange} name="legen" />}
                                    label="Legendado"
                                />
                        </SizedBox>
                    </SizedBox>
                
                </PlayerInfoContent>

            </PlayerContent>
          );
        }else{
          return(<NotFound></NotFound>)
        }
      }
      return(
        <SizedBox width='100%' height='100vh' flex='flex' alignContent='center' flexContent='center'>
            <UseStylesFacebook/>
        </SizedBox>
      );

}