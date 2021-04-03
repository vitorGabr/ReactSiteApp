import React, {useEffect,useState,useRef} from 'react';
import firebase from '../../firebase';
import Menu from '../menu';
import NotFound from '../404';
import {CardView, Img, Main, SizedBox, Title} from '../style';
import Grid from '@material-ui/core/Grid';
import Logo from '../../img/logo.png';
import { Link } from 'react-router-dom';
import {withStyles } from "@material-ui/core/styles";


export default function AllsSeries(props){

    const [data,setData] = useState({seasonSelected: 1});
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);

    useEffect(()=>{
        const _result = async () => {
            setLoading(true);
            try {
                var _data = data;
                const allSeries = await firebase.getAllSeries();
                _data.allSeries = allSeries;
                setData(_data);
            } catch (error) {
                setError(true);
            }finally{
                setLoading(false);
            }
           
        }
        _result()
    },[])

    if(!loading){
        if(!error){
            return(
                <>
                    <Menu></Menu>
                    <SizedBox padding='0 2%'>
                        <Title weight='bold' size='1.5rem'>Todas as séries</Title>
                    </SizedBox>
                    <SizedBox 
                        flex='flex' 
                        alignContent='center'
                        width='100%'
                        flexContent='center'
                    >
                        <Grid container xs={11}>
                            {
                                data.allSeries.map(_item => (
                                    <Grid key={Math.random()} container item xs={4} md={2}>
                                        <CardView image={_item.image} onClick={()=>{
                                            props.history.push(`${_item.name}`)
                                        }}>
                                            <img src={_item.image.original}></img>
                                        </CardView>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </SizedBox>
                </>
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