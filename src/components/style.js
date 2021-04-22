import styled from 'styled-components';

export const FullSize = styled.main`
    width:100%;
`;

export const Main = styled.main`
    width:100%;
    overflow: auto;
`;

export const SizedBox = styled.div`
    margin: ${props => `${props.margin}`};
    padding: ${props => `${props.padding}`};
    width: ${props => `${props.width}`};
    height: ${props => `${props.height}`};
    color:white;
    background-color:${props => `${props.backgroundColor}`};
    display:${props => `${props.flex}`};
    justify-content:${props => `${props.flexContent}`};
    align-items:${props => `${props.alignContent}`};
    flex-direction:${props => `${props.flexDirection}`};
    flex-wrap:${props => `${props.flexWrap}`};
    position:${props => `${props.position}`};
    top:${props => `${props.top}`};
    left:${props => `${props.left}`};
    right:${props => `${props.right}`};
    bottom:${props => `${props.bottom}`};
`;
export const PlayerBack = styled(SizedBox)`
    display:flex;
    padding:0vh 1%;
    @media(max-width:600px){
        margin-top:2vh;
        padding-left: 2vh;
    }
    text-decoration:none;
    display:flex;
    align-items:center;
    a{
        display:flex;
        align-items:flex-end;
        border:none;
        text-decoration:none;
        margin-right:2%;
        color:white;
        span{
            font-size:1.5rem;
            margin-right:3vh;
        }
    }
`;
export const ModalInfo = styled(SizedBox)`
    display:flex;
    flex-direction:column;
    padding: 2% 2%;
    margin: 2% 0;
    p{
        color: #b5b5b5;
        display: -webkit-box;
        -webkit-line-clamp: 3; /** número de linhas que você quer exibir */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
        text-transform:capitalize;
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
            font-weight: 600;
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
    background-position:center;
    background-size:cover;
    display:flex;
    @media(max-width: 500px) {
        height: 100vh;
    }
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
        font-size:1.7rem;
        height: 100%;
        @media(max-width: 990px) {
            font-size:1.4rem;
        }
        @media(max-width: 500px){
            padding-bottom:20vh;
        }
        background-color: rgba(0,0,0,0.7);
        display:flex;
        > ${SizedBox}{
            z-index:15;
            width:50vw !important;
            margin-bottom:5%;
            @media(max-width: 990px){
                h2{
                    font-size: 2.3rem;
                }
                width:80vw !important;
            }
        }
        div:not(.react-stars-wrapper-0578260352001738){
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
        to bottom,rgba(20,20,20,0) 0%,rgba(20,20,20,.15) 29%,rgba(20,20,20,.35) 44%,rgba(20,20,20,.58) 50%,#141414 68%,#141414 100%);
    width: 100%;
    height: 40vh;
    bottom: -1vh;
    z-index: 8;
    position: absolute;
    opacity: 1;
    background-color: transparent;
    @media(max-width: 500px) {
        height: 40vh;
    }
`;
export const ModalEpisodioAtual = styled(BoxEpisodioAtual)`
    top: 46vh !important;
    height: 15vh;
    background-image: linear-gradient(
        to bottom,rgba(20,20,20,0) 0%,rgba(20,20,20,.15) 29%,rgba(20,20,20,.35) 44%,rgba(20,20,20,.58) 50%,#141414 68%,#141414 100%);
        
`;
export const SeriesBox = styled.div`
    top:75vh;
    padding-bottom:2vh;
    position: absolute;
    z-index: 9;
    width: 100%;
    padding-left: 2%;
    
`;

export const Img = styled.img.attrs(props => ({
    src: props.Img,
}))`
    border-radius: ${props => props.borderRadius};
    width: ${props => props.width};
    height: ${props => props.height};
    object-fit:${props => props.objectFit};
`;

export const LogoTitle = styled.img.attrs(props => ({
    src: props.Img,
}))`
    top:2%;
    left:2%;
    width:30vh;
    position: absolute;
`;

export const Title = styled.h2`
    -webkit-text-stroke-width: ${props => props.strokeWidth};
    -webkit-text-stroke-color: black;
    font-size: ${props => props.size ?? '1.2rem'};
    font-weight: ${props => props.weight ?? 'normal'};
    text-transform: ${props => props.textTransform};
    color:${props => props.color ?? 'white'};
`;
export const Center = styled.div`
    width:100%;
    height:100%;
    display:flex;
    justify-content:center;
    align-items:center;
`;
export const Card = styled.div`
    width: 100%;
    height:30vh;
    cursor: pointer;
    position:relative;
    @media(max-width: 990px) {
        height:23vh;
    }
    > div{
        font-size:1rem;
        top:0;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        width:100%;
        color:white;
        border-radius: 5px;
        background-color:rgba(0,0,0,0.5);
        &:hover{
            border:solid white;
        }
        position:absolute;
        svg{
            font-size:3rem;
        }
        ${SizedBox}{
            position:absolute;
            bottom:0;
            left:0;
            border-radius: 10px
        }
        h4{
            position:absolute;
            bottom:1vh;
            font-weight:bold;
        }
        
    }
    img{
            height: 100%;
            width:auto;
            border-radius: 5px;
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
    > ${SizedBox}{
        width:100%;
        height:60vh;
        
    }
    button{
        
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        border-radius: 5px;
        padding:1% 2%;
        background-color: white;//#d40808;
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
    max-width: 25vh;
    height: 3px;
    width: 100%;
    background-color: #7d7d7d;
    border-radius: 50px;
    margin-right: 10px;
`
export  const FillerStyless = styled.div`
    height: 100%;
    width: ${props => `${props.completed}%`};
    background: red;
`
export  const EpisodeProgress = styled.div`
    position:absolute;
    bottom:0;
    left:0;
    height: 1px !important;
    color: red !important;
    border-top: 4px solid;
    width: ${props => `${props.value}% !important`};
`
export const PlayerInfoContent = styled.div`
    display:flex;
    align-items:center;
    flex-direction:row;
    flex-wrap:wrap;
`
export const PlayerContentBtn = styled.div`
    justify-content:space-between;
    align-items:center;
    display:flex;
    .isDisable{
        color:grey;
    }
    a{
        text-decoration:none;
        color:white;
        align-items:center;
        display:flex;
        span{
            font-size:1.9rem;
        }
    }
    flex-direction:row;
`
export const VideoPLayer = styled.div`
    width:100%;
    background-color:black;
`
export const PlayerContent = styled(Main)`
    padding: 2% 0;
    ${SizedBox}{
        ${SizedBox}{
            @media(min-width: 660px){
                margin: 0 !important;
            }
        }
        .video{
            background-color:black;
            @media(max-width: 660px){
                width: 100% !important;
                height:50vh !important;
            }
            height:70vh !important;
        }
    }
`
export const CardView = styled.div`
    width: 100%;
    margin:2vh;
    @media(max-width: 600px){
        margin:0.5vh;
    }
    cursor: pointer;
    img{
        height: 100%;
        object-fit: cover;
        width:100%;
        border-radius: 5px;
    }
    &:hover{
        img{
            border:solid white;
        }
    }
    
`
export const Input = styled.input`
    outline:none;
    background-color:transparent;
    border:none;
    color: white;
    height:100%;
    width: 100%;
    text-align:center;
    font-size:1.2rem;
    font-weight:bold;
    ::placeholder {
        color: white;
        font-weight:bold;
    }
`