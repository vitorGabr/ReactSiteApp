import React, {useEffect,usedata, useState} from 'react';
import NotFound from '../404';
import { Link } from 'react-router-dom';
import Carousel from 'react-elastic-carousel'
import api from '../../api';
import axiosInstance from '../../axios';
import firebase from '../../firebase'

export default function Serie(props){

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
          return (history.filter(_item => _item.season == currentSeason)
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

  useEffect(()=>{
    let params = {
      api_key: process.env.REACT_APP_API_KEY,
      append_to_response: '',
      language: 'pt-br'
    }
    const _result = async () => {
      setLoading(true);
      try {
        const _serie = await firebase.getSeries(`${props.match.params.name}`);
        const _episodes = await firebase.getEpisodes(`${props.match.params.name}`);
        if(_serie != null && _serie.length != 0){
          for (let index = 1; index <= _serie.seasons; index++) {
            params.append_to_response = `${params.append_to_response},season/${index}`;
          }
          const _rep = await axiosInstance.get('1418',{params});
          let seasonsFormatedPt = [];
          for (let index = 1; index <= _serie.seasons; index++) {
              seasonsFormatedPt.push(..._rep.data[`season/${index}`].episodes)
          }
          const response = await api.get(`${_serie.id.replaceAll('_','-')}&embed=episodes`);
          let data = {};
          let seasons = new Set(response.data._embedded.episodes.map(item => item.season))
          let seasonsFormated = response.data._embedded.episodes;
          data.seasonsFormatedPt = seasonsFormatedPt;
          data.seasonsFormated = seasonsFormated;
          data.seasons = Array.from(seasons);
          if(localStorage.season != undefined && localStorage.episode != undefined){
              data.seasonCurrent = seasonsFormated
                  .filter(_episode => _episode.season == localStorage.season)
                  .find((_item)=>_item.number == localStorage.episode)
              data.seasonCurrentPt = seasonsFormatedPt
              .filter(_episode => _episode.season_number == localStorage.season)
              .find((_item)=>_item.episode_number == localStorage.episode)
          }else{
              data.seasonCurrent = seasonsFormated[0]
              data.seasonCurrentPt = seasonsFormatedPt[0]
          }
          sessionStorage.episodes = JSON.stringify((Object.values(_episodes[0])));
          if(sessionStorage.getItem('seasonsFormatedPt') == null){
              sessionStorage.setItem(
                  'seasonsFormatedPt',
                  JSON.stringify(seasonsFormatedPt)
              )
          }
          data.seasonCurrent.summary = data.seasonCurrent.summary.replace('<p>','').replace('</p>','');
          handleData(data);
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
  },[]);

  if(!error){
    if(!loading){
      const {seasonsFormated} = data;
      return(
        <main>
            <div id='logoFriends'>
               <img src={`https://fontmeme.com/permalink/210223/15ed6c36d847a78fd15ef9790d365d80.png`}></img>
            </div>
            <Link id="episodioAtual"
                style={{backgroundImage: `url(${data.seasonCurrent.image.original})`}}
                to={`episodio/${data.seasonCurrent.season}x${data.seasonCurrent.number}`}
            >
                <h1>{`${data.seasonCurrent.number}. ${data.seasonCurrentPt.name}`}</h1>
                <h5>{`${data.seasonCurrent.season}º Temporada`}</h5>
                <p>{data.seasonCurrentPt.overview}</p>
            </Link>
            <div id="boxEpisodioAtual"></div>
            <div id="boxEpisodios">
                <select id="temporada"
                    value={data.seasonSelected}
                    onChange={handleChange}>
                    {
                        data.seasons
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
                        data.width <= 600 ?
                        <div  className = 'episodesList'>
                            {
                                seasonsFormated.
                                filter(_episode => _episode.season == data.seasonSelected)
                                .map((_value)=>(
                                    <div key = {_value.name} className="episodioDiv">
                                        <Link to={{pathname:`episodio/${_value.season}x${_value.number}`}}
                                            className={`episodio  ${isWatched(localStorage.history,_value.season,_value.number)?'isWatched':''}`}
                                            style={{backgroundImage: `url(${_value.image.medium})`}}
                                        >
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
                                        </Link>
                                        <h6>{`${_value.number}. ${_value.name}`}</h6>
                                        <p>{transformSeasonsInLanguagePt(_value).overview}</p>
                                    </div>
                                ))
                            }
                        </div> :
                        <Carousel
                            className = 'episodesCarrousel'
                            itemsToShow={data.width <= 992 ? 3 : 4}
                            pagination={false}
                            itemPadding={data.width ? [5, 5]:[10, 10]}
                            >
                            {
                                seasonsFormated.
                                filter(_episode => _episode.season == data.seasonSelected)
                                .map((_value)=>(
                                    <div key = {_value.name} className="episodioDiv">
                                        <Link to={{pathname:`episodio/${_value.season}x${_value.number}`}}
                                            className={`episodio  ${isWatched(localStorage.history,_value.season,_value.number)?'isWatched':''}`}
                                            style={{backgroundImage: `url(${_value.image.medium})`}}
                                        >
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
                                        </Link>
                                        <h6>{`${_value.number}. ${transformSeasonsInLanguagePt(_value).name}`}</h6>
                                        <p>{transformSeasonsInLanguagePt(_value).overview}</p>
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
      return(<div>asdasd</div>)
    }
  }
  return(
    <NotFound></NotFound>
  );
  
}