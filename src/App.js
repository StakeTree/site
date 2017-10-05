import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './skeleton.css';

import Home from './Home.js';
import UserPage from './UserPage.js';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/dev" component={UserPage} />
        </div>
      </Router>
    );
  }
}

export default App;
