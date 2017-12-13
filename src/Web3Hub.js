import React, { Component } from 'react';
import _ from 'lodash';

import './Web3Hub.css';
import web3store from "./Web3Store.js";

import EtherscanLink from './EtherscanLink.js';

class Web3Hub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      network: "Unknown",
      connected: false,
      transacting: false,
      showDrawer: false,
      transactions: web3store.getState().transactions
    };

    let pollingCounter = 0;
    // Poll for account/web3 changes
    setInterval(async ()=> {
      if(typeof window.web3 !== 'undefined') {

        // dirty hack for web3@1.0.0 support for localhost testrpc, 
        // see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
        if (typeof window.web3.currentProvider.sendAsync !== "function") {
          window.web3.currentProvider.sendAsync = function() {
            return window.web3.currentProvider.send.apply(
              window.web3.currentProvider,
                  arguments
            );
          };
        }

        window.web3.version.getNetwork((err, result) => {
          let networkName;
          switch (result) {
            case "1":
              networkName = "Main Net";
              break;
            case "2":
             networkName = "Morden";
             break;
            case "3":
              networkName = "Ropsten";
              break;
            case "4":
              networkName = "Rinkeby";
              break;
            case "42":
              networkName = "Kovan";
              break;
            default:
              networkName = "Unknown";
          }

          this.setState({network: networkName});
        });

        this.setState({connected: true});

        // Poll transactions
        const unminedTransactions = _.filter(this.state.transactions, function(tx) { return !tx.mined; });
        if(unminedTransactions.length>0) {
          for(var i=0; i<unminedTransactions.length; i++){
            const tx = unminedTransactions[i];
            window.web3.eth.getTransactionReceipt(tx.hash, (err, result)=>{
              if(result && (result.blockNumber || result.status)) {
                web3store.setTransactionAsMined(tx.hash);
              }
            });
          }
        }
        else {
          this.setState({transacting: false});
        } 
      }
      else {
        pollingCounter++;
        if(pollingCounter === 3) {
          this.setState({connected: false});
        }
      }
    }, 1500);

    web3store.subscribe('web3-hub', (newState)=>{
      this.setState({transactions: newState.transactions});
      this.setState({transacting: true});
    });
  }
 
  toggleDrawer() {
    this.setState({showDrawer: !this.state.showDrawer});
  }

  getFriendlyTransactionText(type, mined) { 
    let friendlyText = '';
    if(mined) return "Confirmed";
    switch (type) {
      case "stake":
        friendlyText = "Staking...";
        break;
      case "refund":
        friendlyText = "Refunding...";
       break;
      default:
        friendlyText = "Pending...";
    }

    return friendlyText;
  }

  render() {
    const connectString = this.state.connected ? `Connected to ${this.state.network}` : `Not connected`; 
    let web3classnames = "web3-hub";
    if(this.state.connected) web3classnames += ' connected';
    if(!this.state.connected) web3classnames += ' not-connected';

    if(this.state.connected && this.state.network !== 'Main Net') web3classnames += ' not-main';

    if(this.state.showDrawer) web3classnames += ' opened';

    const txKeys = Object.keys(this.state.transactions).reverse();
    return (
      <div className={web3classnames} onClick={this.toggleDrawer.bind(this)} >
        <span className="web3-status">
          <span className="connect-string">{connectString}</span>
          {this.state.connected ? <span>{this.state.transacting ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-check-square-o"></i>}</span> : <i className="fa fa-exclamation-circle"></i>}
        </span>
        {this.state.showDrawer ?
          <div className="web3-drawer">
            {this.state.connected ? 
              <span>
              {txKeys.length ? 
                <ul>
                {txKeys.map((key)=>{
                  const tx = this.state.transactions[key];
                  return <li key={`tx-${tx.hash}`}>
                    {tx.mined ? <i className="fa fa-check-circle-o"></i> : <i className="fa fa-spinner fa-spin"></i>} <EtherscanLink type="tx" id={tx.hash} text={tx.mined ? "Transaction confirmed" : "Transaction pending..."} />
                  </li>
                })}
                </ul>
              : "No new transactions."
              }
              </span>
              : <span>Install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> to improve your StakeTree experience.</span> }

          </div>
        :''  }
       
      </div>
      )
      
  }
}

export default Web3Hub;