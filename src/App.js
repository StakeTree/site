import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './skeleton.css';

import Home from './Home.js';
import CreatorPage from './CreatorPage.js';
import ContractInterface from './ContractInterface.js';
import Deploy from './Deploy.js';

import FAQ from './FAQ.js';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/deploy" component={Deploy} />
          <Route path="/faq" component={FAQ} />
          <Route path="/dev" component={CreatorPage} />
          <Route path="/c/:address" component={ContractInterface} />
        </div>
      </Router>
    );
  }
}

export default App;
