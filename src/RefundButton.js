import React, { Component } from 'react';

class RefundButton extends Component {
  refund(e) {
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.refund({"from": accounts[0], "gas": 100000});
    });
  }
  render() {
    return <button className="btn clean" onClick={this.refund.bind(this)}>{this.props.children}</button>
  }
  
};

export default RefundButton;