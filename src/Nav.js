import React from 'react';
import { Link } from 'react-router-dom';

import './Nav.css';

const Nav = () => {
	return (
		<div className="row nav-header">
			<Link to="/"><span className="nav-logo" role="img" aria-label="StakeTree Logo">🌲</span></Link> StakeTree 
		</div>
	);
};

export default Nav;