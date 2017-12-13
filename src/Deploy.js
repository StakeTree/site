import React, { Component } from 'react';
import TruffleContract from 'truffle-contract';
import StakeTreeWithTokenizationFactory from 'staketree-contracts/build/contracts/StakeTreeWithTokenizationFactory.json';

// Styling
import './Deploy.css';

//Components
import { Link } from 'react-router-dom';

let contractInstance;
let contractInstanceWeb3;
let web3Polling;

class Deploy extends Component {
  constructor(props){
    super(props);

    this.state = {
      contractAddress: "0x06afedaf28ca94be647418cbf9c02502f4554aa1",
      deployedAddresses: [],
      contractConfig: {
        beneficiaryAddress: "",
        withdrawalPeriod: 604800, // 1 week
        sunsetWithdrawalPeriod: 5184000, // 2 months
        minimumFundingAmount: 10000000000000000 // 0.01 ether
      }
    };
  }
  async componentWillMount() {
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

        const contract = TruffleContract(StakeTreeWithTokenizationFactory);
        contract.setProvider(window.web3.currentProvider);

        contractInstance = await contract.at(this.state.contractAddress);
        window.contractInstance = contractInstance; // debugging

        // Use the web3 instance of the contract to allow for async tx
        contractInstanceWeb3 = await window.web3.eth.contract(StakeTreeWithTokenizationFactory.abi).at(this.state.contractAddress);
        window.contractInstanceWeb3 = contractInstanceWeb3; // debugging

        window.web3.eth.getAccounts(async (error, accounts) => {
          if(this.state.currentEthAccount !== accounts[0]){
            // RESET UI
            this.setState({
              ...this.state,
              currentEthAccount: accounts[0],
              deployedAddresses: [],
            });
          }
          const account = accounts[0];
          const newContractAddresses = await contractInstance.getContractAddress.call({from: account});
          
          // If we are currently deploying, don't update UI
          if(this.state.deployedAddresses.length > newContractAddresses.length) return; 

          this.setState({deployedAddresses: newContractAddresses});
        });
      }
    }, 1500)
  }
  componentWillUnmount() {
    clearInterval(web3Polling);
  }

  async deploy() {
    let web3 = window.web3; // Uses web3 from metamask
    // Extra validation
    if(web3.isAddress(this.state.contractConfig.beneficiaryAddress)){
      
      web3.eth.getAccounts(async (error, accounts) => {
        if(accounts.length > 0){

          const account = accounts[0];

          const nowUnix = new Date().getTime()/1000;
          const nowParsed = parseInt(nowUnix.toFixed(0), 10);

          contractInstanceWeb3.newContract(
            this.state.contractConfig.beneficiaryAddress, 
            this.state.contractConfig.withdrawalPeriod, 
            nowParsed,
            this.state.contractConfig.sunsetWithdrawalPeriod, 
            this.state.contractConfig.minimumFundingAmount, 
            {from: account}, 
            function(error, tx){
              const clone = this.state.deployedAddresses.slice();
              clone.push("Deploying...");
              this.setState({...this.state, deployedAddresses: clone});
              console.log(tx);
            }.bind(this));
        }
      });
    }
  }

  handleBeneficiaryAddress(e) {
    this.setState({
      ...this.state,
      contractConfig: {
        ...this.state.contractConfig,
        beneficiaryAddress: e.target.value
      }
    })
  }

  render() {
    return (
      <div className="faq container">
        <div className="row">
          <div className="eight columns offset-by-two">
            <h3>Deploy Contract</h3>
            <p>To get started with StakeTree we'll help you deploy a new instance of a StakeTree contract to the
            Ethereum blockchain. You can do this right from this page.</p>
            <p>We've set up the contract configuration with some defaults.</p>
            <ul>
              <li>The withdrawal period is every 7 days.</li>
              <li>The minimum funding amount period is 0.01 ether.</li>
              <li>The sunset withdrawal period is 2 months.</li>
            </ul>
            <p>All we need from you is your beneficiary address and we're good to go!</p>
            <input type="text" className={'deploy-input'} placeholder="Beneficiary address" onChange={this.handleBeneficiaryAddress.bind(this)}/>
            <button className={'btn full-width'} onClick={this.deploy.bind(this)}>Deploy new contract</button>
            {this.state.deployedAddresses.length > 0 ? <div className="well">
              <h4>Deployed contracts</h4>
              <ol> 
                {this.state.deployedAddresses.map(address => {
                  return <li key={`addr-${address}`}><Link to={`/c/${address}`}>{address}</Link></li>
                })}
              </ol>
            </div>
            : ''}
          </div>
        </div>
      </div>
    );
  }
}

export default Deploy;