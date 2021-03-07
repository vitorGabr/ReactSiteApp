import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default function notFound(props){
    return(
        <div id="notFound">
            <h1>
                404
            </h1>
            <h5>Desculpe! página não encontrada</h5>
            <Link to='/'>
                Voltar para página principal
            </Link>
        </div>
    );
}