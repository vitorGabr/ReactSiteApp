import React, {useEffect,useState,useRef} from 'react';
import firebase from '../../firebase';
import Menu from '../menu';
import NotFound from '../404';
import {CardView, Img, Main, SizedBox, Title} from '../style';
import Grid from '@material-ui/core/Grid';
import Logo from '../../img/logo.png';
import  {moviesByGenre,genre} from '../../axios';
import { Link } from 'react-router-dom';
import {withStyles } from "@material-ui/core/styles";
import UIInfiniteScroll from './infiniteScroll/inifiniteScroll';


export default function AllsSeries(props){

    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [isFetchingMore,setFetchingMore] = useState(false);
    const [error,setError] = useState(false);
    const [page,setPage] = useState(1);
    let params = {
        api_key: process.env.REACT_APP_API_KEY,
        page: page,
        language: 'pt-br'
    };

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    useEffect(()=>{
        const _result = async () => {
            setLoading(true);
            try {
                const getGenres = await genre.get(``,{params});
                const getGenre = getGenres.data.genres.find(_item => _item.id == props.match.params.id);
                if(getGenre != undefined){
                    var _data = data;
                    const allSeries = await firebase.getSeriesGenre(props.match.params.id);
                    params.with_genres = props.match.params.id;
                    let getMovies = await moviesByGenre.get(``,{params});
                    var d = new Date();
                    getMovies.data.results = getMovies.data.results.filter(_item => 
                        _item.release_date <= 
                        `${d.getFullYear()}-${zeroPad(d.getMonth(),2)}-${zeroPad(d.getDay(),2)}`);
                    _data.allSeries = allSeries;
                    _data.all = [...allSeries,...getMovies.data.results];
                    _data.genre = getGenre;
                    setData(_data);
                }else{
                    throw error;
                }
                
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false);
            }
           
        }
        _result()
    },[])

    const fetchMore = async () => {
        
        setFetchingMore(true);
        try {
            params.page = page+1;
            let getMovies = await moviesByGenre.get(``,{params});
            var d = new Date();
            getMovies.data.results = getMovies.data.results.filter(_item => 
                _item.release_date <= 
                `${d.getFullYear()}-${zeroPad(d.getMonth(),2)}-${zeroPad(d.getDay(),2)}`);
            setData({...data,all: [...data.all,...getMovies.data.results]});
            setPage(page+1);
        } catch (error) {
            setError(true);
        }finally{
            setFetchingMore(false);
        }
    }

    if(!loading){
        if(!error){
            return(
                <div id='principal'>
                    <Menu></Menu>
                    <SizedBox padding='0 2%'>
                        <Title weight='bold' size='1.3rem'>{data.genre.name}</Title>
                    </SizedBox>
                    <SizedBox height='1vh' />
                    <SizedBox padding='0 1%'>
                        <Grid container>
                            {
                                data.all.map(_item => (
                                    <Grid key={Math.random()} container item xs={4} md={2}>
                                        <CardView onClick={()=>{
                                            props.history.push(`/${_item.id}`)
                                        }}>
                                            <img src={`https://www.themoviedb.org/t/p/w220_and_h330_face${_item.poster_path}`}></img>
                                        </CardView>
                                    </Grid>
                                ))
                            }
                        </Grid> 
                        {
                            !isFetchingMore && (
                                <>
                                    <Title>Carregando mais...</Title>
                                    <UIInfiniteScroll fetchMore={fetchMore} />
                                </>
                            )
                        }
                    </SizedBox>
                </div>
            );    
        }
        return (
            <NotFound />
        )
    }
    return (
    <SizedBox width='100%' height='100vh' flex='flex' flexContent='center' alignContent='center'>
        <Img Img={Logo} width='40vh' />
    </SizedBox>
    )

}