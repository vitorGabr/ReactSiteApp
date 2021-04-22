import React from 'react';
import {ModalHero, ModalInfo, ModalEpisodioAtual, SizedBox, Title, Img} from '../../style';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import Avatar from '@material-ui/core/Avatar';
import 'swiper/components/scrollbar/scrollbar.scss';
import {makeStyles } from "@material-ui/core/styles";
import ProgressBar from '../progressBar';

const format = (seconds) => {
    if (isNaN(seconds)) {
      return `00:00`;
    }
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}h:${ss}min`;
    }
    return `${mm}h:${ss}min`;
  };

const useStyles = makeStyles((theme) => ({
    large: {
      width: theme.spacing(8),
      height: theme.spacing(8),
    },
  }));

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

export default function Movie(props){

    function isWatched(id){
        try {
            const history = JSON.parse(localStorage.history);
            return (history[id][0]);
        } catch (error) {
            return false;
        }
    }

    function progressBar(id){
        const _epWatched = isWatched(id);
        let _progess = 0
        if(_epWatched){
            _progess = _epWatched ? ((_epWatched.time*100) / _epWatched.duration) : 0
        }

        return _progess;
    }

    const classes = useStyles();
    return(
        <>
            <ModalHero image={`https://www.themoviedb.org/t/p/original${props.seasonCurrentPt.backdrop_path}`}>
                <SizedBox 
                    flex='flex' 
                    flexDirection='column'
                    position= 'absolute'
                    alignContent='flex-start'
                    flexContent='center'
                    padding='0 2%'
                    >
                    <SizedBox width='40vh'>
                        <Title
                            strokeWidth='1px'
                            size='2rem'
                            weight='bold'
                        >{props.seasonCurrentPt.title}</Title>
                    </SizedBox>
                    {
                        isWatched(props.seasonCurrentPt.id) ?
                            <SizedBox 
                                flex='flex' 
                                width='100%' 
                                alignContent='center' 
                                flexContent='flex-start'
                                >
                                <ProgressBar completed= {progressBar(props.seasonCurrentPt.id)} />
                                <Title color='#e8e8e8' size='1rem' weight='bold'>{`${format(
                                        isWatched(props.seasonCurrentPt.id).time
                                )} de ${format(
                                    isWatched(props.seasonCurrentPt.id).duration
                            )}`}</Title>
                            </SizedBox>
                        :
                        <div></div>

                    }
                    <SizedBox height='1vh' />
                    <ButtonGroup variant="contained"aria-label="contained primary button group">
                        <Button onClick={()=>{
                            props.history.push({pathname:`${props.seasonCurrentPt.id}/assistir`})
                        }}>
                            <PlayArrowOutlinedIcon fontSize="default" />
                            Assistir
                        </Button>
                    </ButtonGroup>
                </SizedBox>

            </ModalHero>
            <ModalEpisodioAtual></ModalEpisodioAtual>
            <SizedBox width='100%' padding='0 0 0 2%' flex='flex'> 
                <Title 
                    weight='bold'
                    size='1rem'
                >
                    {new Date(props.seasonCurrentPt.release_date.replaceAll('-',',')).getFullYear()}
                </Title>
                <SizedBox width='5vh'/> 
                <Title 
                    weight='bold'
                    size='1rem'
                >
                    {format(props.seasonCurrentPt.runtime)}
                </Title>
            </SizedBox>
            <SizedBox height='3vh'/> 
            <SizedBox width='100%' padding='0 0  0 1%'> 
                <Title 
                    weight='bold'
                >
                    Elenco
                </Title>
                <Swiper
                    slidesPerView='auto'
                    
                >
                    {
                        props.seasonCurrentPt
                        .credits
                        .cast
                        .map((_value)=>(
                            <SwiperSlide key = {Math.random()} >
                                <SizedBox padding='1vh'>
                                    <Avatar alt={_value.name} className={classes.large} src={`https://www.themoviedb.org/t/p/original${_value.profile_path}`} />
                                </SizedBox>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </SizedBox>
        <ModalInfo>
                <p>{props.seasonCurrentPt.overview}</p>
            </ModalInfo>
        </>
    );
}
