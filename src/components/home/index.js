import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-elastic-carousel'
import api from '../../api';
import axiosInstance from '../../axios';
import logo from '../../img/logo2.png';
import './style.css'

export default class Home extends Component{

    constructor(props){
        super(props);
        this.state = {
            seasons: [],
            seasonsFormated: [],
            seasonsFormatedPt: [],
            seasonSelected: 1,
            seasonCurrent: {},
            seasonCurrentPt: {},
            isLoaded: false,
            width: window.innerWidth
        }

        this.handleChange = this.handleChange.bind(this);
        this.isWatched = this.isWatched.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.progressBar = this.progressBar.bind(this);
        this.transformSeasonsInLanguagePt = this.transformSeasonsInLanguagePt.bind(this)
    }

    async componentDidMount(){
        let params = {
            api_key: process.env.REACT_APP_API_KEY,
            append_to_response: 'season/1,season/2,season/3,season/4,season/5,season/6,season/7,season/8,season/9,season/10',
            language: 'pt'
        }
        const _rep = await axiosInstance.get('/1668',{params});
        let seasonsFormatedPt = [];
        for (let index = 1; index <= 10; index++) {
            seasonsFormatedPt.push(..._rep.data[`season/${index}`].episodes)
            
        }
        let state = this.state;
        const response = await api.get('friends&embed=episodes');
        let seasons = new Set(response.data._embedded.episodes.map(item => item.season))
        let seasonsFormated = response.data._embedded.episodes;
        state.seasonsFormatedPt = seasonsFormatedPt;
        state.seasonsFormated = seasonsFormated;
        state.seasons = Array.from(seasons);
        if(localStorage.season != undefined && localStorage.episode != undefined){
            state.seasonCurrent = seasonsFormated
                .filter(_episode => _episode.season == localStorage.season)
                .find((_item)=>_item.number == localStorage.episode)
            state.seasonCurrentPt = seasonsFormatedPt
            .filter(_episode => _episode.season_number == localStorage.season)
            .find((_item)=>_item.episode_number == localStorage.episode)
        }else{
            state.seasonCurrent = seasonsFormated[0]
            state.seasonCurrentPt = seasonsFormatedPt[0]
        }
        state.isLoaded = true;
        if(sessionStorage.getItem('seasonsFormatedPt') == null){
            sessionStorage.setItem(
                'seasonsFormatedPt',
                JSON.stringify(seasonsFormatedPt)
            )
        }
        state.seasonCurrent.summary = state.seasonCurrent.summary.replace('<p>','').replace('</p>','');
        window.addEventListener('resize', this.handleResize)
        this.setState(state);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
    }

    handleChange(event) {
        this.setState({seasonSelected: event.target.value});
    }

    handleResize = () => this.setState({
        width: window.innerWidth
    });

    isWatched(episode,currentSeason,currentEpisode){
        try {
            const history = JSON.parse(episode)
            return (history.filter(_item => _item.season == currentSeason)
                .find(_item => _item.episode == currentEpisode));
        } catch (error) {
            return false;
        }
    }

    progressBar(episode,currentSeason,currentEpisode){
        const _epWatched = this.isWatched(episode,currentSeason,currentEpisode);
        let _progess = 0
        if(_epWatched){
            _progess = _epWatched ? ((_epWatched.time*100) / _epWatched.duration) : 0
        }

        return _progess;
    }

    ref = player => {
        this.player = player
    }

    transformSeasonsInLanguagePt(_episode){
        return this.state.seasonsFormatedPt[this.state.seasonsFormated.indexOf(_episode)]
    }

    render(){
        const {seasonsFormated,isLoaded} = this.state;
        if(isLoaded){
            return(
                <main>
                    <div id='logoFriends'>
                       <img src={`https://fontmeme.com/permalink/210223/15ed6c36d847a78fd15ef9790d365d80.png`}></img>
                    </div>
                    <Link id="episodioAtual"
                        style={{backgroundImage: `url(${this.state.seasonCurrent.image.original})`}}
                        to={`episodio/${this.state.seasonCurrent.season}x${this.state.seasonCurrent.number}`}
                    >
                        <h1>{`${this.state.seasonCurrent.number}. ${this.state.seasonCurrentPt.name}`}</h1>
                        <h5>{`${this.state.seasonCurrent.season}º Temporada`}</h5>
                        <p>{this.state.seasonCurrentPt.overview}</p>
                    </Link>
                    <div id="boxEpisodioAtual"></div>
                    <div id="boxEpisodios">
                        <select id="temporada"
                            value={this.state.seasonSelected}
                            onChange={this.handleChange}>
                            {
                                this.state.seasons
                                .map((_value)=>(
                                    <option
                                        value={_value}
                                        key={_value}
                                    >
                                        {`${_value}º Temporada`}
                                    </option>
                                ))
                            }
                        </select>

                        <section id="episodios">
                            {
                                this.state.width <= 600 ?
                                <div  className = 'episodesList'>
                                    {
                                        seasonsFormated.
                                        filter(_episode => _episode.season == this.state.seasonSelected)
                                        .map((_value)=>(
                                            <div key = {_value.name} className="episodioDiv">
                                                <Link to={{pathname:`episodio/${_value.season}x${_value.number}`}}
                                                    className={`episodio  ${this.isWatched(localStorage.history,_value.season,_value.number)?'isWatched':''}`}
                                                    style={{backgroundImage: `url(${_value.image.medium})`}}
                                                >
                                                    {
                                                        this.isWatched(localStorage.history,_value.season,_value.number) ?
                                                        <div
                                                            className='episodeProgress'
                                                            style={
                                                                {
                                                                    width: `${this.progressBar(localStorage.history,_value.season,_value.number)}%`
                                                                }
                                                            }>
                                                        </div>
                                                        :
                                                        <div></div>

                                                    }
                                                </Link>
                                                <h6>{`${_value.number}. ${_value.name}`}</h6>
                                                <p>{this.transformSeasonsInLanguagePt(_value).overview}</p>
                                            </div>
                                        ))
                                    }
                                </div> :
                                <Carousel
                                    className = 'episodesCarrousel'
                                    itemsToShow={this.state.width <= 992 ? 3 : 4}
                                    pagination={false}
                                    itemPadding={this.state.width ? [5, 5]:[10, 10]}
                                    >
                                    {
                                        seasonsFormated.
                                        filter(_episode => _episode.season == this.state.seasonSelected)
                                        .map((_value)=>(
                                            <div key = {_value.name} className="episodioDiv">
                                                <Link to={{pathname:`episodio/${_value.season}x${_value.number}`}}
                                                    className={`episodio  ${this.isWatched(localStorage.history,_value.season,_value.number)?'isWatched':''}`}
                                                    style={{backgroundImage: `url(${_value.image.medium})`}}
                                                >
                                                    {
                                                        this.isWatched(localStorage.history,_value.season,_value.number) ?
                                                        <div
                                                            className='episodeProgress'
                                                            style={
                                                                {
                                                                    width: `${this.progressBar(localStorage.history,_value.season,_value.number)}%`
                                                                }
                                                            }>
                                                        </div>
                                                        :
                                                        <div></div>

                                                    }
                                                </Link>
                                                <h6>{`${_value.number}. ${this.transformSeasonsInLanguagePt(_value).name}`}</h6>
                                                <p>{this.transformSeasonsInLanguagePt(_value).overview}</p>
                                            </div>
                                        ))
                                    }
                                </Carousel>
                            }

                        </section>
                    </div>
                </main>

            );
        }else{
            return(<div></div>)
        }

    }
}