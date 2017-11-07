import React, { Component } from 'react';

import web3store from "./Web3Store.js";

class FundButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    }
  }
  showTooltip() {
    if(this.props.amount < this.props.minAmount) {
      this.setState({showTooltip: true});
    }
  }
  hideTooltip() {
    this.setState({showTooltip: false});
  }
  fund() {
    if(this.props.amount < this.props.minAmount) {
      return false;
    }
    let web3 = window.web3; // Uses web3 from metamask
    web3.eth.getAccounts((error, accounts) => {
      if(accounts.length > 0){
        const account = accounts[0];

        web3.eth.sendTransaction(
          {"from": account, "to": this.props.toAddress, "value": web3.toWei(this.props.amount, "ether")}, 
          (err, transactionHash) => {
            if(!err) {
              web3store.addTransaction({type: 'stake', hash: transactionHash, mined: false});
            }
            console.log(transactionHash);
          }
        );
      }
    });
  }
  render() {
    let tooltipClassNames = "tooltip";
    if(this.state.showTooltip) tooltipClassNames += ' visible';

    let buttonHtml = <span className="tooltip-button">
      <div className={tooltipClassNames}>{`The minimum funding amount is ${this.props.minAmount} ether.`}</div>
      <button onMouseOver={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} className="btn full-width" onClick={this.fund.bind(this)}>{this.props.children}</button> 
    </span>;
    
    return buttonHtml;
  }
};

export default FundButton;