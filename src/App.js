import React, {Component,useState} from 'react';

import {BrowserRouter, Switch, Route} from 'react-router-dom';
import notFound from './components/404/index';
import Home from './components/home';
import Episode from './components/episode';
import Serie from './components/serie';

export default class App extends Component{

  render(){
    return(
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/episodio/:id' component={Episode} />
          <Route exact path='/:name' component={Serie} />
          {/* <Route exact path='/:name/:episode/' component={Serie} /> */}
          <Route exact path='/*' component={notFound} />
        </Switch>
      </BrowserRouter>
    )
  }
}