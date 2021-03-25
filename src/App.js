import React, {Component,useState} from 'react';

import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Homepage from './components/homePage';
import Player from './components/player';
import notFound from './components/404/index';

export default class App extends Component{

  render(){
    return(
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Homepage} />
          <Route exact path='/teste' component={Homepage} />
          <Route exact path='/:name' component={Homepage} />
          <Route exact path='/:name/:episode/' component={Player} />
          <Route exact path='/*' component={notFound} />
        </Switch>
      </BrowserRouter>
    )
  }
}