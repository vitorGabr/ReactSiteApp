import React , {useEffect,useState} from 'react';
import { Img,SizedBox, Title } from '../style';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Logo from '../../img/logo.png';
import Logo2 from '../../img/logo2.png';
import {withStyles } from "@material-ui/core/styles";
import { Link } from 'react-router-dom';

const ColorButton = withStyles((theme) => ({
    root: {
      color: 'white',
      textTransform:'none'
    },
  }))(IconButton);


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

export default function Menu(props){

  const size = useWindowSize();
  return(
        <SizedBox
            width='100%' 
            flex='flex' 
            flexContent='space-between' 
            alignContent='center'
            position={props.absolute ? 'absolute' : ''}
            padding={size.width >= 600?'0.5%':'3% 0% 2% 4%'}
        >
            <Link to='/'>
                <Img Img={size.width >= 600 ? Logo: Logo2} width={size.width >= 600 ? '25vh' : '4.5vh'} />
            </Link>
            <SizedBox>
                <Link to='/search'>
                    <ColorButton color="primary" aria-label="upload picture" component="span">
                        <SearchIcon />
                    </ColorButton>
                </Link>
            </SizedBox>
        </SizedBox>
    );    

}