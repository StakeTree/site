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
  setMinAmount() {    
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.setMinimumFundingAmount(window.web3.toWei(this.props.newMinAmount, 'ether'), {"from": accounts[0], "gas": 30000}, (err, txHash)=>{
        if(!err) {
          web3store.addTransaction({type: 'set_min_amount', hash: txHash, mined: false});
        }
      });
    });
  }
  render() {
    let tooltipClassNames = "tooltip";
    if(this.state.showTooltip) tooltipClassNames += ' visible';

    let buttonHtml = this.props.visible ? <span className="tooltip-button">
      <div className={tooltipClassNames}>{`You don't have any tokens to claim.`}</div>
      <button className="btn clean full-width min-amount-btn" onClick={this.setMinAmount.bind(this)}>{this.props.children}</button> 
    </span> : <span></span>;
    
    return buttonHtml;
  }
};

export default ClaimTokensButton;