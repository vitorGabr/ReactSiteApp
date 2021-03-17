import React, {useEffect,useState} from 'react';
import NotFound from '../404';
import { Link, Redirect, Route } from 'react-router-dom';
import ReactPlayer from 'react-player';

export default function Episodes(props){

    const [data,setData] = useState({seeking:true,duration:0});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);
    const [player,setPlayer] = useState();

    useEffect(()=>{
        setLoading(true);
        try {
            getEpisode();
        } catch (error) {
            setError(true);
        }finally{
            setLoading(false);
        }
        
      },[]);

    function getEpisode(id = props.match.params.episode){
        const _url = id;
        const seasonsFormated = JSON.parse(sessionStorage.getItem('seasonsFormatedPt'));
            const length = _url.length;
            const episode = _url.substring(_url.indexOf('x')+1,length);
            const season = _url.substring(0,_url.indexOf('x'));
           if(episode && season){
               var _data = data;
                const _episode = seasonsFormated
                    .filter(_ep => _ep.season_number == season)
                    .find(_val => _val.episode_number == episode);
                    if(_episode){
                        const indexOf = seasonsFormated.indexOf(_episode);
                        _data.episode = JSON.parse(sessionStorage.episodes).episodesDub[indexOf];
                        _data.episodeComplete = _episode;
                        _data.currentEp = episode;
                        _data.currentSeason = season;
                        _data.nextEpisodeAvaliable = seasonsFormated[indexOf+1] != null ? true : false;
                        _data.prevsEpisodeAvaliable = seasonsFormated[indexOf-1] != null ? true : false;
                        if(_data.nextEpisodeAvaliable){
                            _data.nextEpisode = seasonsFormated[indexOf+1].season_number + 'x' + seasonsFormated[indexOf+1].episode_number;
                        }
                        if(_data.prevsEpisodeAvaliable){
                            _data.prevEpisode = seasonsFormated[indexOf-1].season_number + 'x' + seasonsFormated[indexOf-1].episode_number;
                        }
                        if(!_data.seeking){
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
        let _jsonParsse = {};
        try {
            _jsonParsse = JSON.parse(localStorage.history);
            getHistory = _jsonParsse; 
        } catch(e) {
            getHistory = {};
        }
        const serieName = props.match.params.name;
        const _json = {[serieName]: {'episode': episode,'season':season,'time': playedSeconds,'duration':duration}};
        if(!_jsonParsse[serieName]){
            getHistory[Object.keys(_json)] = Object.values(_json);
            localStorage.setItem('history', JSON.stringify(getHistory));
        }else{
            var _jsonSeason = _json[serieName].season;
            var _jsonEpisode = _json[serieName].episode;
            if(!(_jsonParsse[serieName].filter(_item => _item.season == _jsonSeason)
                .find(_item => _item.episode == _jsonEpisode))){
                getHistory[Object.keys(_json)] = Object.values(_json);
            }else{
                const _ep = _jsonParsse[serieName].filter(_item => _item.season == _jsonSeason)
                .find(_item => _item.episode == _jsonEpisode);
                const index = _jsonParsse[serieName].indexOf(_ep);
                _ep.time = playedSeconds;
                _ep.duration = duration;
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
        console.log(_data.playedSeconds)
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
                    setData({seeking: false,..._data})
                    if(!(_findHistory.duration - _findHistory.time <= 50)){
                        player.seekTo(parseFloat(_findHistory.time))
                    }
                }else{
                    setData({seeking: false,..._data})
                }
            }
            
        }else{
            setData({seeking: false,..._data})
        }
        
    }

    const ref = _player => {
        setPlayer(_player);
    }

    if(!error){
        if(!loading){
          return(
            <div id='episodeByID'>
                    <div id="episodeInfo">
                        <Link to={`/`}>
                            <span className="material-icons">
                                arrow_back
                            </span>
                        </Link>
                        <div>
                            {<h2 id="episodeName">
                                {`${data.episodeComplete.episode_number}. ${data.episodeComplete.name}`}
                            </h2>}
                            {<p id="episodeSeason">
                                {`${data.episodeComplete.season_number}º Temporada`}
                            </p>}
                        </div>
                    </div>
                    <div id="episodeContent">
                        <Link to={`${data.prevEpisode}`} onClick={()=>{
                            getEpisode(data.prevEpisode)
                        }} className={`${data.prevsEpisodeAvaliable ? '':'isDisable'} btn btnPrev`}>
                            <span className="material-icons">
                                keyboard_arrow_left
                            </span>
                        </Link>
                        <ReactPlayer
                            ref={ref}
                            playing
                            className='videoPlayer'
                            onStart = {handleSeek}
                            controls={true}
                            width='65%'
                            height="450px"  
                            url={data.episode} 
                            onProgress={handleProgress}
                            onDuration={handleDuration}
                        />
                        <Link to={`${data.nextEpisode}`} onClick={()=>{
                            getEpisode(data.nextEpisode)
                        }} className={`${data.nextEpisodeAvaliable ? '':'isDisable'} btn btnNext`}>
                            <span className="material-icons">
                                keyboard_arrow_right
                            </span>
                        </Link>
                    </div>
                </div>
          );
        }else{
          return(<div>asdasd</div>)
        }
      }
      return(
        <NotFound></NotFound>
      );

}