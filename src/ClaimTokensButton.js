import React, { Component } from 'react';

import web3store from "./Web3Store.js";

class ClaimTokensButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    }
  }
  showTooltip() {
    if(this.props.claimAmount <= 0) {
      this.setState({showTooltip: true});
    }
  }
  hideTooltip() {
    this.setState({showTooltip: false});
  }
  claimTokens() {
    if(this.props.claimAmount <= 0) {
      return false;
    }
    
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.claimTokens({"from": accounts[0], "gas": 150000}, (err, txHash)=>{
        if(!err) {
          web3store.addTransaction({type: 'claim_tokens', hash: txHash, mined: false});
        }
      });
    });
  }
  render() {
    let tooltipClassNames = "tooltip";
    if(this.state.showTooltip) tooltipClassNames += ' visible';

    let buttonHtml = this.props.visible ? <span className="tooltip-button">
      <div className={tooltipClassNames}>{`You don't have any tokens to claim.`}</div>
      <button onMouseOver={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} className="btn clean full-width" onClick={this.claimTokens.bind(this)}>{this.props.children}</button> 
    </span> : <span></span>;
    
    return buttonHtml;
  }
};

export default ClaimTokensButton;