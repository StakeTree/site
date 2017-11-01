import React from 'react';

const EtherscanLink = ({text, type, id}) => {
  return (<a target="_blank" rel="noopener noreferrer" href={`https://etherscan.io/${type}/${id}`}>{text}</a>);
};

export default EtherscanLink;