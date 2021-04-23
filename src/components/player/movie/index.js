import React,{ useState, useEffect} from 'react';
import NotFound from '../../404';
import {Link} from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import ReactPlayer from 'react-player';
import api from '../../../api';
import axiosInstance from '../../../axios';
import firebase from '../../../firebase'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { videoPlayer } from '../../../axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import { PlayerContentBtn, PlayerContent, PlayerBack, Title, PlayerInfoContent, SizedBox } from '../../style';

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

export default function PlayerMovie(props){

    const [state, setState] = useState({
        legen: false,
      });
    const [data,setData] = useState({seeking:true,duration:0});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);
    const [disable,setDisable] = useState(false);
    const [player,setPlayer] = useState();
    const [urlIndex,setUrlIndex] = useState(0);

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
            language: 'pt-br'
        }
        const _rep = await axiosInstance.get(`movie/${props.match.params.name}`,{params});
        if(_rep != null && Object.keys(_rep.data).length != 0){
            let _data = data;
            _data.movie = _rep.data;
            setData({..._data});
            getMovie(props.match.params.name,{...data,..._data})
        }else{
            throw 'err';
        }
    }

    function getMovie(id = props.match.params.name,_value){
        var _data = _value ?? data;
        const _url = id;
        _data.nextEpisodeAvaliable = false;
        _data.prevsEpisodeAvaliable = false;
        const _episode = `http://vps.receitasdolar.xyz/expires-1590/-f-i-l-m-e-s-/${_url}.mp4`;  
        _data.episode = _episode;
        setData({..._data});
        if(!data.seeking){
            saveInLocalStorage(id,0,100)
        }
    }

    function saveInLocalStorage(movie,playedSeconds,duration){
        let getHistory = {};
        let _jsonParsse = {};
        try {
            _jsonParsse = JSON.parse(localStorage.history);
            getHistory = _jsonParsse; 
        } catch(e) {
            getHistory = {};
        }
        const id = props.match.params.name;
        const _json = {
            'time':  playedSeconds,
            'duration':duration,
            'date': Date.now()
        };
        if(!_jsonParsse[id]){
            getHistory[id] = [_json];
            localStorage.setItem('history', JSON.stringify(getHistory));
        }else{
            let _movie = _jsonParsse[id][0];
            _movie.time = playedSeconds;
            _movie.duration = duration;
            _movie.date = Date.now();
            _jsonParsse[id] = [_movie];
            getHistory = _jsonParsse;
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
        if (!data.seeking) {
            saveInLocalStorage(
                data.movie.id,
                _data.playedSeconds,
                data.duration
            )
        }
    };
    
    function handleSeek(){
        var _data = data;
        if(isToseek()){
            let _jsonParsse;
            try {
                _jsonParsse = JSON.parse(localStorage.history);
            } catch(e) {
                _jsonParsse = [];
            }
            const _id = props.match.params.name;
            if(_jsonParsse[_id]){
                const _findHistory = _jsonParsse[_id][0];
                if(!(_findHistory.duration - _findHistory.time <= 50)){
                    player.seekTo(parseFloat(_findHistory.time))
                }
            }
        }
        _data.seeking = false;
        setData({..._data})
    }

    const ref = _player => {
        setPlayer(_player);
        
    }

    const tryOthersUrls = async () => {
        
        let _data = data;
        
        const _url = props.match.params.name;
        const _urls = [
            `https://vps.receitasdolar.xyz/expires-1590/-f-i-l-m-e-s-/${_url}-DUB-SD.mp4`,
            `https://vps.receitasdolar.xyz/expires-1590/-f-i-l-m-e-s-/${_url}-DUB-HD.mp4`,
            `https://vps.receitasdolar.xyz/expires-1590/-f-i-l-m-e-s-/${_url}-leg.mp4`,
        ];
        console.log(urlIndex)
        let _episode = _urls[urlIndex + 1];
        setUrlIndex(urlIndex + 1);
        if(urlIndex == 0){
            _episode = _urls[0];
        }else if(urlIndex >= _urls.length-1){
            setUrlIndex(_urls.length-1);
            const _result = await firebase.setExceptions(_data.movie.id);
            setError(true)
        }
        _data.episode = _episode;
        setData({..._data});
    }

    if(!loading){
        if(!error){
            console.log()
          return(
            <PlayerContent>
                <PlayerBack>
                    <Link to={`/${props.match.params.name}`}>
                        <span className="material-icons">
                            arrow_back
                        </span>
                        <Title weight='bold' size='1.2rem'>Voltar</Title>
                    </Link>
                </PlayerBack>
                <SizedBox margin='2vh 0'></SizedBox>
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
                            onError={(err)=>{
                                tryOthersUrls()
                            }}
                        />
                    </SizedBox>
                    <SizedBox width='46%' margin='0 2%'>
                        <SizedBox width='100%'>
                            <Title weight='bold'> {`${data.movie.title}`}</Title>
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