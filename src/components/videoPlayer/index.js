import React, { useState, useEffect,useRef} from "react";
import ReactPlayer from "react-player";
import { makeStyles, MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import {FullSize} from '../style';
import screenful from "screenfull";
import NotFound from '../404';
import Controls from "../episodes/controls";

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

const useStyles = makeStyles((theme) => ({
  playerWrapper: {
    width: "100%",
    height:'100%',
    position: "relative",
    backgroundColor:'#000'
  },
  controlsWrapper: {
    visibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topControls: {
    display: "flex",
    justifyContent: "flex-end",
    padding: theme.spacing(2),
  },
  middleControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomWrapper: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  bottomControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    margin: theme.spacing(1),
  },
  controlIcons: {
    color: "#777",
    fontSize: 50,
    transform: "scale(0.9)",
    "&:hover": {
      color: "#fff",
      transform: "scale(1)",
    },
  },
  bottomIcons: {
    color: "#999",
    "&:hover": {
      color: "#fff",
    },
  },
  volumeSlider: {
    width: 100,
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

let count = 0;

function Videoplayer(props) {

  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const classes = useStyles();
  const [showControls, setShowControls] = useState(false);
  // const [count, setCount] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [timeDisplayFormat, setTimeDisplayFormat] = React.useState("normal");
  const [bookmarks, setBookmarks] = useState([]);
  const [state, setData] = useState({
    pip: false,
    playing: true,
    controls: false,
    light: false,
    muted: false,
    played: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 0.5,
    loop: false,
    seeking: true,
  });

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const {
    playing,
    controls,
    light,

    muted,
    loop,
    playbackRate,
    pip,
    played,
    seeking,
    volume,
  } = state;

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
           var _data = state;
            const _episode = seasonsFormated
                .filter(_ep => _ep.season_number == season)
                .find(_val => _val.episode_number == episode);
                if(_episode){
                    const indexOf = seasonsFormated.indexOf(_episode);
                    _data.episode = JSON.parse(sessionStorage.episodes).episodesDub[indexOf];
                    _data.episodeComplete = _episode;
                    _data.currentEp = episode;
                    _data.currentSeason = season;
                    state.nextEpisodeAvaliable = seasonsFormated[indexOf+1] != null ? true : false;
                    state.prevsEpisodeAvaliable = seasonsFormated[indexOf-1] != null ? true : false;
                    if(state.nextEpisodeAvaliable){
                        state.nextEpisode = seasonsFormated[indexOf+1].season_number + 'x' + seasonsFormated[indexOf+1].episode_number;
                    }
                    if(state.prevsEpisodeAvaliable){
                        state.prevEpisode = seasonsFormated[indexOf-1].season_number + 'x' + seasonsFormated[indexOf-1].episode_number;
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
          getHistory[Object.keys(_json)] =[...getHistory[Object.keys(_json)],...Object.values(_json)];
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
  function handleSeek(){
      var _data = state;
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
                  if(!(_findHistory.duration - _findHistory.time <= 50)){
                    const _time = _findHistory.time / (state.duration / 100 );
                    handleSeekMouseUp('',_time)
                  }
              }
          }
      }
      _data.seeking = false;
      setData({..._data})
  }
  function isToseek(){
      const {location} = props;
      if(location.query != undefined && !location.query.isToseek){
          return location.query.isToseek
      }
      return true;
  }
  const handlePlayPause = () => {
    setData({ ...state, playing: !state.playing });
  };
  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
  };
  const handleFastForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
  };
  const handleProgress = (changeState) => {
    const _state = state;
    if (count > 3) {
      controlsRef.current.style.visibility = "hidden";
      count = 0;
    }
    if (controlsRef.current.style.visibility == "visible") {
      count += 1;
    }
    if (!state.seeking) {
      setData({ ..._state, ...changeState });
    }
    if(changeState.playedSeconds == state.duration){
      const _nextEp = state.nextEpisode;
      if(_nextEp){
          getEpisode(_nextEp)
          props.history.push({pathname: `${_nextEp}`, query: {isToseek: false}})
      }
    }
    if (!state.seeking) {
        saveInLocalStorage(
           state.currentSeason,
           state.currentEp,
           changeState.playedSeconds,
           state.duration
        )
   }

  };
  const handleSeekChange = (e, newValue) => {
    setData({ ...state, played: parseFloat(newValue / 100) });
  };
  const handleSeekMouseDown = (e) => {
    setData({ ...state, seeking: true });
  };
  const handleSeekMouseUp = (e, newValue) => {
    setData({ ...state, seeking: false });
    playerRef.current.seekTo(newValue / 100, "fraction");
  };

  const handleDuration = (duration) => {
    setData({ ...state, duration });
  };

  const handleVolumeSeekDown = (e, newValue) => {
    setData({ ...state, seeking: false, volume: parseFloat(newValue / 100) });
  };
  const handleVolumeChange = (e, newValue) => {
    setData({
      ...state,
      volume: parseFloat(newValue / 100),
      muted: newValue === 0 ? true : false,
    });
  };

  const toggleFullScreen = () => {
    screenful.toggle(playerContainerRef.current);
  };

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    count = 0;
  };

  const hanldeMouseLeave = () => {
    controlsRef.current.style.visibility = "hidden";
    count = 0;
  };

  const nextEp = () => {
    const _nextEp = state.nextEpisode;
    getEpisode(_nextEp);
    props.history.push({pathname: `${_nextEp}`, query: {isToseek: false}});
  };
  const prevEp = () => {
    const _prevEp = state.prevEpisode;
    getEpisode(_prevEp);
    props.history.push({pathname: `${state.prevEpisode}`, query: {isToseek: false}});
  };

  const handleDisplayFormat = () => {
    setTimeDisplayFormat(
      timeDisplayFormat == "normal" ? "remaining" : "normal"
    );
  };

  const handlePlaybackRate = (rate) => {
    setData({ ...state, playbackRate: rate });
  };

  const hanldeMute = () => {
    setData({ ...state, muted: !state.muted });
  };

  const currentTime =
    playerRef && playerRef.current
      ? playerRef.current.getCurrentTime()
      : "00:00";

  const duration =
    playerRef && playerRef.current ? playerRef.current.getDuration() : "00:00";
  const elapsedTime =
    timeDisplayFormat == "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`;

  const totalDuration = format(duration);

  if(!error){
    if(!loading){
      return (
        <MuiThemeProvider theme={theme}>
          <FullSize>
            <div
                onMouseMove={handleMouseMove}
                onMouseLeave={hanldeMouseLeave}
                ref={playerContainerRef}
                className={classes.playerWrapper}
              >
                <ReactPlayer
                  ref={playerRef}
                  width="100%"
                  height='100%'
                  url={state.episode} 
                  pip={pip}
                  onStart={handleSeek}
                  playing={playing}
                  controls={false}
                  light={light}
                  loop={loop}
                  playbackRate={playbackRate}
                  volume={volume}
                  onDuration={handleDuration}
                  onProgress={handleProgress}
                />
                <Controls
                  episode={state.episodeComplete}
                  ref={controlsRef}
                  onSeek={handleSeekChange}
                  onSeekMouseDown={handleSeekMouseDown}
                  onSeekMouseUp={handleSeekMouseUp}
                  onDuration={handleDuration}
                  onRewind={handleRewind}
                  onPlayPause={handlePlayPause}
                  onFastForward={handleFastForward}
                  playing={playing}
                  played={played}
                  elapsedTime={elapsedTime}
                  totalDuration={totalDuration}
                  onMute={hanldeMute}
                  nextEp={nextEp}
                  prevEp={prevEp}
                  muted={muted}
                  onVolumeChange={handleVolumeChange}
                  onVolumeSeekDown={handleVolumeSeekDown}
                  onChangeDispayFormat={handleDisplayFormat}
                  playbackRate={playbackRate}
                  onPlaybackRateChange={handlePlaybackRate}
                  onToggleFullScreen={toggleFullScreen}
                  volume={volume}
                />
              </div>
          </FullSize>
      
        </MuiThemeProvider>
      );
    }else{
      return(<div>asdasd</div>)
    }
  } return(
    <NotFound></NotFound>
  );
  
}

export default Videoplayer;