import styled from 'styled-components';

export const FullSize = styled.main`
    width:100%;
    height: 100vh;
`;

export const Main = styled.main`
    width:100%;
`;

export const SizedBox = styled.div`
    width: ${props => `${props.width}`};
    height: ${props => `${props.height}`};
    color:white;
`;

export const ModalInfo = styled(SizedBox)`
    display:flex;
    flex-direction:column;
    padding: 2% 2%;
    margin: 2% 0;
    p{
        color: #b5b5b5;
    }
    @media(max-width: 990px) {
        padding: 2% 4%;
        width:100%;
    }
    color:white;
    width:60%;
`;

export const ModalEpisodes = styled(ModalInfo)`
    width:100%;
    hr{
        margin:2% 0;
        border-top: 0.5px solid #b5b5b5;
    }
    a{
        margin:2% 2%;
        text-decoration:none;
        color:white;
        display:flex;
        align-items:center;
        flex-wrap: wrap;
        div:nth-child(1){
            width:20%;
            position: relative;
            display:flex;
            img{
                border-radius:5px;
                width: 100%;
                height:auto;
            }
            .episodeProgress{
                top:95%;
                position: absolute;
            }
        }
        @media(max-width: 990px) {
            div:nth-child(1){
                width:40%;
            }
            p{
                margin-top:2%;
            }
        }
        h4{
            width:50%;
            margin-left:2%;
            font-size: 0.9rem;
        }
        p{
            color: #b5b5b5;
            font-size: 0.85rem;
        }
        
    }
    @media(max-width: 990px) {
        h2{
            font-size:1.2rem;
        }
    }
`;

export const HeroImage = styled.div`
    width:100%;
    height: 95vh;
    background-image: url(${props => `${props.image}`}); 
    background-position:top;
    background-size:cover;
    display:flex;
    a{
        text-decoration:none;
        color: white;
        text-transform: uppercase;
        align-items:center;
        justify-content: center;
        width:100%;
        justify-content:center;
        text-align:center;
        flex-direction:column;
        padding-bottom:15vh;
        font-size:1.7rem;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display:flex;
        div:not(.react-stars-wrapper-0578260352001738){
            p{
                width:auto;
            }
            .genres{
                padding-right:1%;
            }
            display:flex;
            width:100%;
            align-items:center;
            justify-content:center;
            flex-wrap:wrap;
        }
        p{
            width:50%;
            font-size:0.9rem;
            font-weight:bold;
            display: -webkit-box;
            -webkit-line-clamp: 3; /** número de linhas que você quer exibir */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
            text-transform:capitalize;
        }
    }

`;

export const BoxEpisodioAtual = styled.div`
    background-image: linear-gradient(
        to bottom,rgba(20,20,20,0) 0,rgba(20,20,20,.15) 29%,rgba(20,20,20,.35) 44%,rgba(20,20,20,.58) 50%,#141414 68%,#141414 100%);
    width: 100%;
    height: 21vh;
    top: 75vh;
    z-index: 8;
    position: absolute;
    opacity: 1;
    background-color: transparent;
`;

export const ModalEpisodioAtual = styled(BoxEpisodioAtual)`
    top: 46vh !important;
    height: 15vh;
    background-image: linear-gradient(
        to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,.15) 29%,rgba(0,0,0,.35) 44%,rgba(0,0,0,.58) 50%,#000 68%,#000 100%);
`;

export const SeriesBox = styled.div`
    top: 80vh;
    position: absolute;
    z-index: 9;
    width: 100%;
    padding: 1% 2%;
`;

export const LogoTitle = styled.h1`
    top:2%;
    left:2%;
    position: absolute;
    font-size: 30px;
    color:red;
`;

export const Card = styled.div`
    width: 100%;
    height: 30vh;
    div{
        font-size:1rem;
        top:0;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        width:100%;
        border-radius: 5px;
        background-color:rgba(0,0,0,0.5);
        &:hover{
            border:solid white;
        }
        position:absolute;
        svg{
            font-size:3rem;
        }
        h4{
            position:absolute;
            top:90%;
            font-weight:normal;
        }
    }
    a{
        img{
            height: 100%;
            width:auto;
            border-radius: 5px;
        }

    }
    &:hover{
        img{
            border:solid white;
        }
    }
`;

export const ModalHero = styled.div`
    width:100%;
    height: 60vh;
    background-image: url(${props => `${props.image}`}); 
    background-position:top;
    border-radius: 5px;
    background-size:cover;
    display:flex;
    button{
        position: absolute;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        border-radius: 5px;
        padding:1% 2%;
        background-color: white;//#d40808;
        top:40vh;
        left:5vh;
        color: black;
        height: 5.5vh;
        svg{
            margin-right:8%;
        }
        width: 18vh;
        border:none;
        outline:none;
    }
`;

export const ContainerStyles = styled.div`
    position: absolute;
    left:-3vh;
    max-width: 25vh;
    top:30vh;
    height: 3px;
    width: 100%;
    background-color: #7d7d7d;
    border-radius: 50px;
    margin: 50px;
`

export  const FillerStyless = styled.div`
    height: 100%;
    width: ${props => `${props.completed}%`};
    background: red;
`
