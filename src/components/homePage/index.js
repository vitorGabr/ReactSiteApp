import React, {useEffect,useState,useRef} from 'react';
import firebase from '../../firebase';
import { Link } from 'react-router-dom';
import {Card, EpisodeProgress, Img, Title} from '../style';
import {HeroImage} from '../style';
import {SeriesBox} from '../style';
import {SizedBox} from '../style';
import {Main} from '../style';
import axiosInstance from '../../axios';
import {teste} from '../../axios';
import {BoxEpisodioAtual} from '../style';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import ReactStars from "react-rating-stars-component";
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@material-ui/icons/PlayCircleFilledWhiteOutlined';
import {MuiThemeProvider, createMuiTheme,withStyles } from "@material-ui/core/styles";
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import  {moviesByGenre,genre} from '../../axios';
import  ModalSerie from './modal';
import 'react-responsive-modal/styles.css';
import NotFound from '../404';
import Logo from '../../img/logo.png';
import chuck from '../../json';
import Menu from '../menu';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

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

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
  
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      // Add event listener
      window.addEventListener("resize", handleResize);
      
      // Call handler right away so state gets updated with initial window size
      handleResize();
      
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
  
    return windowSize;
  }

  const ColorButton = withStyles((theme) => ({
    root: {
      color: 'white',
    },
  }))(Button);

  const IconPlayButton = withStyles(() => ({
    root: {
      color: 'white',
      textTransform:'none'
    },
  }))(IconButton);

  const SeeMoreButton = withStyles(() => ({
    root: {
        color: 'white',
        textTransform:'none'
    },
  }))(Button);

export default function Homepage(props){

    const [open, setOpen] = useState(false);
    const [modalSerie, setModalSerie] = useState('');
    const onOpenModal = () => setOpen(true);
    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);

    useEffect(()=>{
        const _result = async () => {
            setLoading(true);
            try {
                let params = {
                    api_key: process.env.REACT_APP_API_KEY,
                    language: 'pt-br'
                };
                var _data = data;
                const allSeries = await firebase.getAllSeries();
                const exceptions = await firebase.getExceptions();
                const getGenres = await genre.get(``,{params});
                _data.genre = getGenres.data.genres.slice(0,5);
                changeHistoryKeys(allSeries);
                _data.movies = [];
                _data.history = getHistory();
                _data.historyFormated = [];
                _data.allSeries = allSeries;
                var genres = [];
                allSeries.map(_item => {
                    genres.push(..._item.genres)
                });
                genres = Array.from(new Set(genres));
                _data.genres = genres;
                let _paramsWithGenres = []
                genres.map(_gen => {
                    const _genre = _data.genre.find(_item => _item.name == _gen);
                    if(_genre){
                        _paramsWithGenres.push(_genre.id);
                    }
                });
                params.sort_by='popularity.desc';
                for (const _item of _data.genre) {
                    params.with_genres = _item.id;
                    const getMovies = await moviesByGenre.get(``,{params});
                    _data.movies.push(...getMovies.data.results);
                }
                const zeroPad = (num, places) => String(num).padStart(places, '0');
                var d = new Date();
                _data.movies = _data.movies.filter(_item => 
                    _item.release_date <= 
                    `${d.getFullYear()}-${zeroPad(d.getMonth(),2)}-${zeroPad(d.getDay(),2)}`);
                _data.movies = _data.movies.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
                _data.movies = _data.movies.filter(_item => {
                    if(!exceptions.find(_i => _i.id == _item.id)){
                        return _item;
                    }
                    return false;
                });
                const all = [..._data.movies,...allSeries];
                const randomSerie = all[Math.floor(Math.random() * all.length)];
                _data.randomSerie = randomSerie;
                let response = '';
                if(!randomSerie.genre_ids){
                    response = await axiosInstance.get(`tv/${randomSerie.id}`,{params});
                }else{
                    response = await axiosInstance.get(`movie/${randomSerie.id}`,{params});
                }
                _data.randomSerie = response.data;
                var sort = [];
                Object.keys(_data.history).map(_item => {
                    sort.push(hasHistory(_item));
                });
               
                var _test = Object.values(sort).sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });

                sort = _test;
                _data.historySort = []
                sort.map(_item => {
                    Object.entries(_data.history).map(_i => {
                        if(_i[1].filter(_val => _val == _item).length > 0){
                            _data.historySort.push([_i[0]]);
                        }
                    })
                });
                _data.historySort.forEach(_element => {
                    const findSerie = all.find(_item => _item.id == _element);
                    if(findSerie){
                        _data.historyFormated.push(findSerie);
                    }
                })
                if(props.match.params.name){
                    setModalSerie(props.match.params.name);
                    setOpen(true);
                }
                
                setData(_data);
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false);
            }
           
        }
        _result()
    },[])

    function getHistory(){
        try {
            const history = JSON.parse(localStorage.history)
           return history;
        } catch (error) {
            return {};
        }
    }

    function hasHistory(_nameSerie){
        try {
            const history = data.history;
            if(history[_nameSerie].length){
                const max = history[_nameSerie].reduce(function(prev, current) {
                    return (prev.date > current.date) ? prev : current
                }) 
               return max;
            }
            return history[_nameSerie];
        } catch (error) {
            return false;
        }
    }

    function changeHistoryKeys(_allSeries){
        const clone = (obj) => Object.assign({}, obj);
        const renameKey = (object, key, newKey) => {
            const clonedObj = clone(object);
            const targetKey = clonedObj[key];
            
            delete clonedObj[key];
            
            clonedObj[newKey] = targetKey;
                
            return clonedObj;
        };
        let history = getHistory();
        if(history && Object.keys(history).length != 0){
            Object.keys(history).map((_item) => {
                if(isNaN(_item)){
                    const _result = _allSeries.find(_series => _series.name == _item);
                    if(_result){
                        history = renameKey(history,_item,_result.id.toString());
                    }
                }
            });
            if(JSON.stringify(history) !== JSON.stringify(getHistory())){
                setData({...data,history: history});
                localStorage.history = JSON.stringify(history)
            }
        }
        
    }

    function progressBar(_id){
        let _progress = 0
        const _epWatched = hasHistory(_id);
        if(_epWatched){
            _progress = ((_epWatched.time*100) / (_epWatched.duration));
        }
        return _progress;
    }

    function filteByGenres(genres){
        var _series = [];
        data.allSeries.map(_item => {
            const findGenres = _item.genres.find(_value => _value == genres);
            if(findGenres){
                _series.push(_item)
            }
        })
        const id = data.genre.find(_gen => _gen.name == genres);
        if(id){
            _series.push(...data.movies.filter(_item => _item.genre_ids.includes(id.id)))
        }
        return _series;
    }

    const handleClose = ()=>{
        setOpen(false);
        props.history.push({pathname:`/`})
    }

    const handleGenreOtherPage = (_genre)=>{
        props.history.push({pathname:`/search/${_genre}`})
    }

    if(!loading){
        if(!error){
            return (
                <Main>
                    <Menu absolute={true}></Menu>
                    <HeroImage image={`https://www.themoviedb.org/t/p/original${ data.randomSerie.backdrop_path}`}>
                        <Link to='' onClick={()=>{
                                    setModalSerie(data.randomSerie.id);
                                    onOpenModal()
                                }}>
                            <SizedBox
                               flex='flex' 
                               
                               flexDirection='column'
                               flexContent='space-between' 
                               alignContent='center'
                               position='absolute' 
                            >
                                <Title
                                    size='2.8rem'
                                    weight='bold'
                                >{`${data.randomSerie.title??data.randomSerie.name}`}</Title>
                                <div>
                                    {
                                        data.randomSerie.genres.map(_item=>(
                                        <p key={Math.random()} className='genres'>{_item.name}</p>   
                                        ))  
                                    }
                                </div>
                                <ReactStars
                                    count={5}
                                    value={5/10 * data.randomSerie.vote_average}
                                    edit={false}
                                    size={24}
                                    isHalf={true}
                                    activeColor="red"
                                />
                                <p>
                                    {data.randomSerie.overview}
                                </p>
                                <MuiThemeProvider theme={theme}>
                                    <SizedBox height='1vh'/>
                                    <ButtonGroup disableElevation variant="contained" aria-label="contained primary button group">
                                        <Button onClick={()=>{
                                            setModalSerie(data.randomSerie.id);
                                            onOpenModal()
                                        }}>
                                            <PlayArrowOutlinedIcon fontSize="default" />
                                            Assistir
                                        </Button>
                                    </ButtonGroup>
                                </MuiThemeProvider>
                            </SizedBox>
                        </Link>
                    </HeroImage>
                    <BoxEpisodioAtual />
                    <SeriesBox>
                        {   
                            Object.keys(data.history).length !== 0 ?
                            <>
                                <Title weight='bold'>Assitido por você</Title>
                                <SizedBox width='100%' height='1vh'/>
                                <Swiper
                                slidesPerView='auto'
                                navigation
                                    >
                                    {
                                        data.historyFormated
                                        .map((_value)=>(
                                            <SwiperSlide key = {Math.random()} >
                                                <Link to={`${_value.id}`}>
                                                    <Card onClick={()=>{
                                                            props.history.push(`${_value.id}`)
                                                            setModalSerie(_value.id);
                                                            onOpenModal()
                                                        }}>
                                                        <img src={`https://www.themoviedb.org/t/p/w220_and_h330_face${_value.poster_path}`}></img>
                                                        {hasHistory(_value.id) ? 
                                                        <div>
                                                            <PlayCircleFilledWhiteOutlinedIcon/>
                                                            {
                                                                hasHistory(_value.id).season != null ?
                                                                <h4>{`T${hasHistory(_value.id).season} E${hasHistory(_value.id).episode}`}</h4>:
                                                                <></>
                                                            }
                                                            <SizedBox 
                                                                width='100%'
                                                                height='3px'
                                                                backgroundColor='#575757'
                                                            ></SizedBox>
                                                            <SizedBox 
                                                                width={`${progressBar(_value.id)}%`}
                                                                height='3px'
                                                                backgroundColor='red'
                                                            ></SizedBox>
                                                        </div> : <></>}
                                                    </Card>
                                                </Link>
                                            </SwiperSlide>
                                        ))
                                        }
                                    </Swiper>
                                    <SizedBox width='100%' height='20px'/>
                            </>
                            :<SizedBox></SizedBox>
                        }
                        
                        {
                            data.genre.map(_value => (
                                <div key = {Math.random()}>
                                    <SizedBox flex='flex' flexContent='space-between'>
                                        <Title weight='bold' >{_value.name}</Title>
                                        <SeeMoreButton 
                                            size="small"
                                            onClick={()=>handleGenreOtherPage(_value.id)}
                                        >
                                            <Title
                                                size='1.1rem'
                                            >ver mais</Title>
                                            <ArrowForwardIosIcon style={{ marginLeft: 3}}   fontSize="small"/>
                                        </SeeMoreButton>
                                        
                                    </SizedBox>
                                    <SizedBox width='100%' height='1vh'/>
                                    <Swiper
                                        slidesPerView='auto'
                                        navigation
                                    >
                                        {
                                            filteByGenres(_value.name).map(_item => (
                                                <SwiperSlide key = {Math.random()} >
                                                    <Link to={`${_item.id}`}>
                                                        <Card onClick={()=>{
                                                                props.history.push(`${_item.id}`)
                                                                setModalSerie(_item.id);
                                                                onOpenModal()
                                                            }}>
                                                            <img src={`https://www.themoviedb.org/t/p/w220_and_h330_face${_item.poster_path}`}></img>
                                                        </Card>
                                                    </Link>
                                                </SwiperSlide>
                                            ))
                                        }
                                    </Swiper>
                                    <SizedBox width='100%' height='5vh'/>
                                </div>
                            ))
                        }
                    </SeriesBox>
                    <ModalSerie 
                        open={open}
                        name={modalSerie}
                        history={props.history}
                        onCloseModal={handleClose}
                    >
                    </ModalSerie>
                </Main>
            );
        }
        return (
            <NotFound></NotFound>
        )
    }
    return (
        <SizedBox width='100%' height='100vh' flex='flex' flexContent='center' alignContent='center'>
            <Img Img={Logo} width='40vh' />
        </SizedBox>
    )
}