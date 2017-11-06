import React from 'react';
import { Link } from 'react-router-dom';

import './Nav.css';
import Web3Hub from './Web3Hub.js';

const Nav = () => {
	return (
    <div className="container">
		<div className="row nav-header">
			<Link to="/"><span className="nav-logo" role="img" aria-label="StakeTree Logo">🌲</span><span className="nav-logo-text">StakeTree</span></Link>
      <div className="right-nav-links">
        <Link to="/faq">FAQ</Link> | 
        <Link to="/dev">Dev Fund</Link>
        <Web3Hub />
      </div>
		</div>
    </div>
	);
};

export default Nav;