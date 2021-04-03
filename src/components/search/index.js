import React, {useEffect,useState} from 'react';
import Menu from '../menu';
import firebase from '../../firebase';
import { } from '../style';
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles } from '@material-ui/core/styles';
import {CardView, Img, Main, SizedBox,Input,Title } from '../style';
import Grid from '@material-ui/core/Grid';
import NotFound from '../404';

const Progressor = withStyles({
    colorPrimary: {
        color: 'red',
    },
  })(CircularProgress);

export default function Search(props){

    const [search, setSearch] = useState('');
    const [data, setData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(false);

    useEffect(()=>{
        const _result = async () =>{
            setLoading(true);
            try {
                const searchSeries = await firebase.searchSeries(search);
                setData(searchSeries)
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false);
            }
        }
        _result();
    },[search])

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
                        placeholder="Pesquise sua série"></Input>
                    <SearchIcon></SearchIcon>
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
                            data.length >= 1 ?
                            <Grid container>
                                {
                                    data.map(_item => (
                                        <Grid key={Math.random()} container item xs={4} md={2}>
                                            <CardView image={_item.image} onClick={()=>{
                                                props.history.push(`${_item.name}`)
                                            }}>
                                                <img src={_item.image.original}></img>
                                            </CardView>
                                        </Grid>
                                    ))
                                }
                            </Grid> :
                            <Title>Sem resultados</Title>
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