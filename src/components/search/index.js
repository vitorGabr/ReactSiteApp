import React, {useEffect,useState} from 'react';
import Menu from '../menu';
import firebase from '../../firebase';
import { } from '../style';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles } from '@material-ui/core/styles';
import {CardView, Img, Main, SizedBox,Input,Title } from '../style';
import Grid from '@material-ui/core/Grid';
import NotFound from '../404';
import {seachMovies} from '../../axios';
import ImgNotFound from '../../img/not-found.png';

const Progressor = withStyles({
    colorPrimary: {
        color: 'red',
    },
  })(CircularProgress);

const IconSearchButton = withStyles((theme) => ({
    root: {
      color: 'white',
      textTransform:'none'
    },
  }))(IconButton);

export default function Search(props){

    const [search, setSearch] = useState('');
    const [data, setData] = useState(null);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(false);


    const searchParams = async () => {
        let params = {
            api_key: process.env.REACT_APP_API_KEY,
            query: '',
            language: 'pt-br'
        }
        setLoading(true);
            try {
                if(search.length != 0){
                    params.query = search + '\uf8ff';
                    const _response = await seachMovies.get('',{params});
                    const searchSeries = await firebase.searchSeries(search);
                    const exceptions = await firebase.getExceptions();
                    const zeroPad = (num, places) => String(num).padStart(places, '0');
                    function shuffle(o) {
                        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                        return o;
                    }
                    var d = new Date();
                    _response.data.results = _response.data.results.filter(_item => 
                        _item.release_date <= 
                        `${d.getFullYear()}-${zeroPad(d.getMonth(),2)}-${zeroPad(d.getDay(),2)}`);
                    _response.data.results.push(...searchSeries);
                    _response.data.results = _response.data.results.filter(_item => {
                        if(!exceptions.find(_i => _i.id == _item.id)){
                            if(_item.poster_path != null){
                                return _item;
                            }
                            return false;
                        }
                        return false;
                    });
                    setData(shuffle(_response.data.results));
                }
            } catch (error) {
                //setError(true);
            }finally{
                setLoading(false);
            }
    }

    const handleChange = (e) => {
        setSearch(e.target.value)
    }

   if(!error){
       return(
            <>
                <Menu></Menu>
                <SizedBox 
                    margin='2%' 
                    height='60px'
                    padding='0 2%'
                    flex='flex'
                    flexContent='space-between'
                    alignContent='center'
                    backgroundColor='#7a7a7a'
                >
                    <Input 
                        type='text' 
                        value={search} 
                        onChange={handleChange}
                        placeholder="Pesquise seu filme ou série"></Input>
                    <IconSearchButton onClick={searchParams}>
                        <SearchIcon></SearchIcon>
                    </IconSearchButton>
                </SizedBox>
                {
                    loading ?
                    <SizedBox  
                        padding='10% 0'
                        width='100%' 
                        flex='flex' 
                        flexContent='center' 
                        alignContent='center'>
                        <Progressor></Progressor>
                    </SizedBox>:
                    <SizedBox padding='0 1%'>
                        {
                            data != null ?
                            <>
                                {data.length <= 1 ? 
                                    <SizedBox margin='1%' width='99%' flex='flex'>
                                        <Title>Sem resultados</Title>
                                    </SizedBox> : 
                                    <Grid container>
                                        {
                                            data.map(_item => (
                                                <Grid key={Math.random()} container item xs={4} md={2}>
                                                    <CardView onClick={()=>{
                                                        props.history.push(`${_item.id}`)
                                                    }}>
                                                        <img src={_item.poster_path != null ? `https://www.themoviedb.org/t/p/w220_and_h330_face${_item.poster_path}` : ImgNotFound}></img>
                                                    </CardView>
                                                </Grid>
                                            ))
                                        }
                                    </Grid> 
                                }
                            </>
                            :
                            <>
                            </>
                        }
                    </SizedBox>
                }
            </>
       );
   }
   return(
       <NotFound></NotFound>
   );

}