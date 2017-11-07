import React, { Component } from 'react';
import Modal from 'react-modal';

import web3store from "./Web3Store.js";

class RefundButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }
  showModal() {
    this.setState({showModal: true});
  }
  closeModal() {
    this.setState({showModal: false});
  }
  refund(e) {
    this.closeModal();
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.refund({"from": accounts[0], "gas": 100000}, (err, txHash)=>{
        if(!err) {
          web3store.addTransaction({type: 'refund', hash: txHash, mined: false});
        }
      });
    });
  }
  render() {
    let buttonHtml = this.props.visible ? <span>
        <Modal 
          className={{
            base: 'modal',
            afterOpen: 'modal',
            beforeClose: 'modal'
          }}
          isOpen={this.state.showModal}
          onRequestClose={this.closeModal.bind(this)}
        >
          <h4>Are you sure?</h4>
          <p>If you refund yourself we'll lose track of your past contributions & you might lose some benefits of being a funder.</p>
          <button className="btn" onClick={this.refund.bind(this)}>Continue</button>
          <button className="btn clean right" onClick={this.closeModal.bind(this)}>Cancel</button>
        </Modal>
        <button className="btn clean full-width" onClick={this.showModal.bind(this)}>{this.props.children}</button>
      </span> : <span></span>;
    return buttonHtml;
  }
  
};

export default RefundButton;