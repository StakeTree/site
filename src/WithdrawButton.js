import React, { Component } from 'react';

import web3store from "./Web3Store.js";

class WithdrawButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    }
  }
  showTooltip() {
    if(new Date() <= this.props.withdrawalDate) {
      this.setState({showTooltip: true});
    }
  }
  hideTooltip() {
    this.setState({showTooltip: false});
  }
  withdraw() {
    if(new Date() <= this.props.withdrawalDate) {
      return false;
    }
    
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.withdraw({"from": accounts[0], "gas": 100000}, (err, txHash)=>{
        if(!err) {
          web3store.addTransaction({type: 'withdraw', hash: txHash, mined: false});
        }
      });
    });
  }
  render() {
    let tooltipClassNames = "tooltip";
    if(this.state.showTooltip) tooltipClassNames += ' visible';

    let buttonHtml = this.props.visible ? <span className="tooltip-button">
      <div className={tooltipClassNames}>{`You can only withdraw after ${this.props.withdrawalDate.toLocaleString()}.`}</div>
      <button onMouseOver={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} className="btn clean full-width" onClick={this.withdraw.bind(this)}>{this.props.children}</button> 
    </span> : <span></span>;
    
    return buttonHtml;
  }
};

export default WithdrawButton;