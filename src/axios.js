import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'https://api.themoviedb.org/3/'
});

export const seachMovies = axios.create({
    baseURL: 'https://api.themoviedb.org/3/search/movie?'
});

export const moviesByGenre = axios.create({
    baseURL: 'https://api.themoviedb.org/3/discover/movie?'
});

export const genre = axios.create({
    baseURL: 'https://api.themoviedb.org/3/genre/movie/list?'
});

export const videoPlayer = axios.create({
    baseURL: 'https://vps.receitasdolar.xyz/expires-1590/-f-i-l-m-e-s-/'
});

export default axiosInstance;