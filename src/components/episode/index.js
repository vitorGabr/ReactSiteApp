import React, {Component} from 'react';
import { Link, Redirect, Route } from 'react-router-dom';
import ReactPlayer from 'react-player';
import json from '../../json';

import './style.css';

export default class Episode extends Component{

    constructor(props){
        super(props);
        this.state = {
            episode: 29939,
            currentEp:0,
            currentSeason:0,
            ep: '',
            duration: 0,
            id: this.props.match.params.id,
            nextEpisode: 0,
            episodeComplete:{},
            nextEpisodeAvaliable: true,
            prevsEpisodeAvaliable: false,
            prevsEpisode: 0,
            seeking: true,
            isUrl: true,
        }
        this.getEpisode = this.getEpisode.bind(this)
        this.saveInLocalStorage = this.saveInLocalStorage.bind(this)
        this.handleDuration = this.handleDuration.bind(this)
        this.handleProgress = this.handleProgress.bind(this)
        this.handleSeek = this.handleSeek.bind(this)
        this.isToseek = this.isToseek.bind(this)
    }

    componentDidMount(){
        this.getEpisode()
        console.log(sessionStorage)
        
    }

    getEpisode(id = this.props.match.params.id){
        let state = this.state;
        const seasonsFormated = JSON.parse(sessionStorage.getItem('seasonsFormatedPt'));
        state.id = id
        const length = state.id.length;
        const episode = state.id.substring(state.id.indexOf('x')+1,length);
        const season = state.id.substring(0,state.id.indexOf('x'));
        state.currentEp = episode;
        state.currentSeason = season;
        try {
            const teste = seasonsFormated
                    .filter(_ep => _ep.season_number == season)
                    .find(_val => _val.episode_number == episode);
            if(teste != null){
                const indexOf = seasonsFormated.indexOf(teste);
                state.episodeComplete = teste;
                state.nextEpisodeAvaliable = seasonsFormated[indexOf+1] != null ? true : false;
                state.prevsEpisodeAvaliable = seasonsFormated[indexOf-1] != null ? true : false;
                if(state.nextEpisodeAvaliable){
                    state.nextEpisode = seasonsFormated[indexOf+1].season_number + 'x' + seasonsFormated[indexOf+1].episode_number;
                }
                if(state.prevsEpisodeAvaliable){
                    state.prevEpisode = seasonsFormated[indexOf-1].season_number + 'x' + seasonsFormated[indexOf-1].episode_number;
                }
                //state.ep = json[indexOf];
                state.ep = JSON.parse(sessionStorage.episodes)[indexOf];
                if(!state.seeking){
                    this.saveInLocalStorage(season,episode,0,100)
                }
            }else{
                state.isUrl = false;
            }
        } catch (error) {
           state.isUrl = false; 
        }
        this.setState(state);
    }
    
    saveInLocalStorage(season,episode,playedSeconds,duration){
        localStorage.setItem('episode',episode);
        localStorage.setItem('season',season);
        let getHistory = [];
        let _jsonParsse = [];
        try {
            _jsonParsse = JSON.parse(localStorage.history);
            getHistory = _jsonParsse; 
        } catch(e) {
            getHistory = []
        }
        const _json = {'episode': episode,'season':season,'time': playedSeconds,'duration':duration};
        if(localStorage.history == null || localStorage.history.length == 0){
            getHistory.push(_json);
            localStorage.setItem('history', JSON.stringify(getHistory))
        }else{
            if(!(_jsonParsse.filter(_item => _item.season == _json.season)
                .find(_item => _item.episode == _json.episode))){
                getHistory.push(_json);
            }else{
                const _ep = _jsonParsse.filter(_item => _item.season == _json.season)
                .find(_item => _item.episode == _json.episode);
                _ep.time = playedSeconds;
                _ep.duration = duration;
                
                getHistory = _jsonParsse;
            }
            localStorage.setItem('history', JSON.stringify(getHistory))
        }
    }

    handleDuration = (duration) => {
        this.setState({ duration })
    }

    isToseek(){
        const {location} = this.props;
        if(location.query != undefined && !location.query.isToseek){
            return location.query.isToseek
        }
        return true;
    }

    handleProgress = state => {
        if(state.playedSeconds == this.state.duration){
            const _nextEp = this.state.nextEpisode;
            if(_nextEp){
                this.getEpisode(_nextEp)
                this.props.history.push({pathname: `/episodio/${_nextEp}`, query: {isToseek: false}})
            }
        }
        if (!this.state.seeking) {
            this.saveInLocalStorage(
                this.state.currentSeason,
                this.state.currentEp,
                state.playedSeconds,
                this.state.duration
            )
          this.setState(state)
        }
    }
    
    handleSeek(){
        if(this.isToseek()){
            let _jsonParsse;
            try {
                _jsonParsse = JSON.parse(localStorage.history);
                
            } catch(e) {
                _jsonParsse = []
            }
            const _findHitory = _jsonParsse.filter(_item => _item.season == this.state.episodeComplete.season_number)
                .find(_item => _item.episode == this.state.episodeComplete.episode_number);
            if(_findHitory){
                this.setState({seeking: false})
                if(!(_findHitory.duration - _findHitory.time <= 50)){
                    this.player.seekTo(parseFloat(_findHitory.time))
                }
            }else{
                this.setState({seeking: false})
            }
        }else{
            this.setState({seeking: false})
        }
        
    }

    ref = player => {
        this.player = player
    }

    render(){
        if(this.state.isUrl){
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
                                {`${this.state.episodeComplete.episode_number}. ${this.state.episodeComplete.name}`}
                            </h2>}
                            {<p id="episodeSeason">
                                {`${this.state.episodeComplete.season_number}º Temporada`}
                            </p>}
                        </div>
                    </div>
                    <div id="episodeContent">
                        <Link to={`${this.state.prevEpisode}`} onClick={()=>{
                            this.getEpisode(this.state.prevEpisode)
                        }} className={`${this.state.prevsEpisodeAvaliable ? '':'isDisable'} btn btnPrev`}>
                            <span className="material-icons">
                                keyboard_arrow_left
                            </span>
                        </Link>
                        <ReactPlayer
                            ref={this.ref}
                            playing
                            className='videoPlayer'
                            onStart = {this.handleSeek}
                            controls={true}
                            width='65%'
                            height="450px"  
                            url={this.state.ep} 
                            onProgress={this.handleProgress}
                            onDuration={this.handleDuration}
                        />
                        <Link to={`${this.state.nextEpisode}`} onClick={()=>{
                            this.getEpisode(this.state.nextEpisode)
                        }} className={`${this.state.nextEpisodeAvaliable ? '':'isDisable'} btn btnNext`}>
                            <span className="material-icons">
                                keyboard_arrow_right
                            </span>
                        </Link>
                    </div>
                </div>
                
            )
        }else{
            return(
                <Route render={props=>(
                    <Redirect to="/nao-econtrada" />
                )} />
            )
        }
        
    }
}