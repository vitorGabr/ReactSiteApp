import React, {useEffect,useState,useRef} from 'react';
import firebase from '../../firebase';
import { Link } from 'react-router-dom';
import {Card, Img, Title} from '../style';
import {HeroImage} from '../style';
import {SeriesBox} from '../style';
import {SizedBox} from '../style';
import {Main} from '../style';
import axiosInstance from '../../axios';
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
import {MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import  ModalSerie from './modal';
import 'react-responsive-modal/styles.css';
import NotFound from '../404';
import Logo from '../../img/logo.png';
import chuck from '../../json';

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

export default function Homepage(props){

    const [open, setOpen] = useState(false);
    const [modalSerie, setModalSerie] = useState('');
    const onOpenModal = () => setOpen(true);
    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);

    useEffect(()=>{
        //firebase.updateSeasons('reign',chuck);
        const _result = async () => {
            setLoading(true);
            try {
                let params = {
                    api_key: process.env.REACT_APP_API_KEY,
                    language: 'pt-br'
                }
                var _data = data;
                const allSeries = await firebase.getAllSeries();
                const randomSerie = allSeries[Math.floor(Math.random() * allSeries.length)];
                const response = await axiosInstance.get(`${randomSerie.id}`,{params});
                _data.history = getHistory();
                _data.historyFormated = [];
                _data.allSeries = allSeries;
                _data.randomSerie = randomSerie;
                _data.randomSerieComplete = response.data;
                allSeries.forEach(_item => {
                    if(_data.history[_item.name]){
                        _data.historyFormated.push(_item)
                    }
                })
                if(props.match.params.name && 
                    allSeries.find(_item => _item.name == props.match.params.name)){
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
            const max = history[_nameSerie].reduce(function(prev, current) {
                return (prev.date > current.date) ? prev : current
            }) 
           return max;
        } catch (error) {
            return false;
        }
    }

    function progressBar(_ep){
        let _progress = 0
        const _epWatched = hasHistory(_ep);
        if(_epWatched){
            _progress = ((_epWatched.time*100) / (_epWatched.duration));
        }
        return _progress;
    }

    const handleClose = ()=>{
        setOpen(false);
        props.history.push({pathname:`/`})
    }

    if(!loading){
        if(!error){
            return (
                <Main>
                    <SizedBox 
                        width='100%' 
                        flex='flex' 
                        flexContent='space-between' 
                        alignContent='center'
                        position='absolute'
                        padding='1%'
                        >
                        <Img Img={Logo} width='30vh' />
                    </SizedBox>
                    <HeroImage image={data.randomSerie.image.banner}>
                        <Link to='' onClick={()=>{
                                    setModalSerie(data.randomSerie.name);
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
                                >{`${data.randomSerie.name.replaceAll('_',' ')}`}</Title>
                                <div>
                                    {
                                        data.randomSerieComplete.genres.map(_item=>(
                                        <p key={Math.random()} className='genres'>{_item.name}</p>   
                                        ))  
                                    }
                                </div>
                                <ReactStars
                                    count={5}
                                    value={5/10 * data.randomSerieComplete.vote_average}
                                    edit={false}
                                    size={24}
                                    isHalf={true}
                                    activeColor="red"
                                />
                                <p>
                                    {data.randomSerieComplete.overview}
                                </p>
                                <MuiThemeProvider theme={theme}>
                                    <SizedBox height='1vh'/>
                                    <ButtonGroup disableElevation variant="contained" aria-label="contained primary button group">
                                        <Button onClick={()=>{
                                            setModalSerie(data.randomSerie.name);
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
                                                <Link to={`${_value.name}`}>
                                                    <Card image={_value.image} onClick={()=>{
                                                            props.history.push(`${_value.name}`)
                                                            setModalSerie(_value.name);
                                                            onOpenModal()
                                                        }}>
                                                        <img src={_value.image.original}></img>
                                                        {hasHistory(_value.name) ? 
                                                        <div>
                                                            <PlayCircleFilledWhiteOutlinedIcon/>
                                                            <h4>{`T${hasHistory(_value.name).season} E${hasHistory(_value.name).episode}`}</h4>
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
                        
                        <Title weight='bold'>Todas as séries</Title>
                        <SizedBox width='100%' height='1vh'/>
                        <Swiper
                           slidesPerView='auto'
                           navigation
                            >
                            {
                                data.allSeries
                                .map((_value)=>(
                                    <SwiperSlide key = {Math.random()} >
                                        <Link to={`${_value.name}`}>
                                            <Card image={_value.image} onClick={()=>{
                                                    props.history.push(`${_value.name}`)
                                                    setModalSerie(_value.name);
                                                    onOpenModal()
                                                }}>
                                                <img src={_value.image.original}></img>
                                                {hasHistory(_value.name) ? 
                                                <div>
                                                    <PlayCircleFilledWhiteOutlinedIcon/>
                                                    <h4>{`T${hasHistory(_value.name).season} E${hasHistory(_value.name).episode}`}</h4>
                                                </div> : <></>}
                                            </Card>
                                        </Link>
                                    </SwiperSlide>
                                ))
                                }
                            </Swiper>
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