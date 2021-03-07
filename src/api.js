import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.tvmaze.com/singlesearch/shows?q='
})

export default api;