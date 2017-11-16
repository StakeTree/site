import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './skeleton.css';
import './font-awesome/css/font-awesome.css';

import Home from './Home.js';
import CreatorPage from './CreatorPage.js';
import ContractInterface from './ContractInterface.js';
import Deploy from './Deploy.js';

import Nav from './Nav.js';

import FAQ from './FAQ.js';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Nav />
          <Switch >
            <Route exact path="/" component={Home} />
            <Route path="/deploy" component={Deploy} />
            <Route path="/faq" component={FAQ} />
            <Route path="/c/:address" component={ContractInterface} />
            <Route path="/*" component={CreatorPage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
