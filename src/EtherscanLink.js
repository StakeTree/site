import React from 'react';

import './EtherscanLink.css';
const EtherscanLink = ({text, type, id}) => {
  return (<span className="etherscanlink">
  		<a className="etherscanlink-anchor" target="_blank" rel="noopener noreferrer" href={`https://etherscan.io/${type}/${id}`}>{text}</a>
  	</span>);
};

export default EtherscanLink;