import React, { Component } from 'react';

import './Web3Hub.css';

let web3Polling;

class Web3Hub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      network: "Unknown",
      connected: false
    };

    let pollingCounter = 0;
    // Poll for account/web3 changes
    web3Polling = setInterval(async ()=> {
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
              networkName = "Main";
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
        
      }
      else {
        pollingCounter++;
        if(pollingCounter === 3) {
          this.setState({connected: false});
        }
      }
    }, 1500);
  }
 
  async componentWillMount() {

    
  }

  render() {
    const connectString = this.state.connected ? `Connected to ${this.state.network}` : `Not connected`; 
    let web3classnames = "web3-hub";
    if(this.state.connected) web3classnames += ' connected';
    if(!this.state.connected) web3classnames += ' not-connected';

    if(this.state.connected && this.state.network !== 'Main') web3classnames += ' not-main';

    return (
      <div className={web3classnames} >
        <span className="connect-string">{connectString}</span>
        {this.state.connected ? <i className="fa fa-check-square-o"></i> : <i className="fa fa-exclamation-circle"></i>}
      </div>
      )
      
  }
}

export default Web3Hub;