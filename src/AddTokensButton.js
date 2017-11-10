import React, { Component } from 'react';
import Modal from 'react-modal';

import { HashLink as Link } from 'react-router-hash-link';

import web3store from "./Web3Store.js";

class AddTokensButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showModalForm: false,
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: 18,
      disabledTokenButton: true
    };
  }
  showModal() {
    this.setState({showModal: true});
  }
  closeModal() {
    this.setState({showModal: false});
  }
  showModalForm() {
    this.closeModal();
    this.setState({showModalForm: true});
  }
  closeModalForm(){
    this.setState({showModalForm: false});
  }
  addTokenization(e) {
    window.web3.eth.getAccounts(async (error, accounts) => {
      this.props.contract.addTokenization(
        this.state.tokenName,
        this.state.tokenSymbol,
        this.state.tokenDecimals,
        {"from": accounts[0], gas: 3200000, gasPrice: window.web3.toWei(1, 'gwei')}, (err, txHash)=>{
        if(!err) {
          this.closeModalForm();
          web3store.addTransaction({type: 'add-tokens', hash: txHash, mined: false});
        }
      });
    });
  }
  handleTokenName(e) {
    this.setState({tokenName: e.target.value});
    setTimeout(this.validateTokenDetails.bind(this), 10);
  }
  handleTokenSymbol(e) {
    const value = e.target.value.substring(0,5);
    this.setState({tokenSymbol: value});
    setTimeout(this.validateTokenDetails.bind(this), 10);
  }
  handleTokenDecimals(e) {
    this.setState({tokenDecimals: e.target.value});
    setTimeout(this.validateTokenDetails.bind(this), 10);
  }

  validateTokenDetails() {
    if(this.state.tokenName.length === 0) return this.setState({disabledTokenButton: true});
    if(this.state.tokenSymbol.length === 0) return this.setState({disabledTokenButton: true});
    if(this.state.tokenDecimals > 18) return this.setState({disabledTokenButton: true});

    this.setState({disabledTokenButton: false});
  }
  render() {
    let addTokenizationButtonClassNames = "btn";
    if(this.state.disabledTokenButton) addTokenizationButtonClassNames += " disabled-btn";
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
          <p>When you add tokenization to your contract you won't be able to reverse this.</p>
          <p>Unsure about what this means? <Link to="/faq#tokenization">Read more here first</Link>.</p>
          <button className="btn" onClick={this.showModalForm.bind(this)}>Continue</button>
          <button className="btn clean right" onClick={this.closeModal.bind(this)}>Cancel</button>
        </Modal>

        <Modal 
          className={{
            base: 'modal add-tokens',
            afterOpen: 'modal',
            beforeClose: 'modal'
          }}
          isOpen={this.state.showModalForm}
          onRequestClose={this.closeModalForm.bind(this)}
        >
          <h4>Token details</h4>
          <div>
              <p>Fill in the details of your token. These details can't be changed 
              once you added tokenization to your contract.</p>
              <p>Unsure of what these mean? <Link to="/faq#tokenization">Read more here first</Link></p>
              <label htmlFor={'token-name'}>Token Name: </label>
              <input onChange={this.handleTokenName.bind(this)} 
                className='full-width' 
                id="token-name" 
                value={this.state.tokenName}
                type="text" placeholder="Eg. StakeTree Tokens" />

              <label htmlFor={'token-symbol'}>Token Symbol: </label>
              <input onChange={this.handleTokenSymbol.bind(this)} 
                className='full-width' 
                id="token-symbol" 
                value={this.state.tokenSymbol}
                type="text" placeholder="Eg. XTT" />

              <label htmlFor={'token-decimals'}>Token Decimals: </label>
              <input onChange={this.handleTokenDecimals.bind(this)} 
                className='full-width' 
                id="token-decimals"
                value={this.state.tokenDecimals}
                type="number"  />
          </div>
          
          <button className={addTokenizationButtonClassNames} disabled={this.state.disabledTokenButton} onClick={this.addTokenization.bind(this)}>Add Tokenization</button>
          <button className="btn clean right" onClick={this.closeModalForm.bind(this)}>Cancel</button>
          <p className="modal-notice">Note: this transaction might take a while to be confirmed.</p>
        </Modal>
        
        <button className="btn clean full-width" onClick={this.showModal.bind(this)}>{this.props.children}</button>
      </span> : <span></span>;
    return buttonHtml;
  }
  
};

export default AddTokensButton;