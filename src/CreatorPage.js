import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import { Link } from 'react-router-dom';

import Creators from './creatorsToIPFSMap.json';

// Styling
import './CreatorPage.css';

// Other
import Web3Controller from './Web3Controller.js';
import web3store from './Web3Store.js';

//Components
import EtherscanLink from './EtherscanLink.js';
import FundButton from './FundButton.js';
import PageEditor from './PageEditor.js';

let web3Polling;
const web3 = new Web3();

class CreatorPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      userLoading: true,
      contractLoading: true,
      exchangeRate: 0,
      currentEthAccount: "0x0000000000000000000000000000000000000000",
      showTooltip: "",
      isFunder: false,
      isBeneficiary: false,
      customAmount: 0.1,
      web3available: false,
      // contractAddress: "0x8c79ec3f260b067157b0a7db0bb465f90b87f8f1",
      // contractAddress: "0x34ef16c1f5f864a6b8de05205966b53e9fb0aaca", // Rinkeby test contract
      // contractAddress: "0x4ca3e0f44aacb3b0cc68e76a6cb94cb19afc3307", // local
      contract: {
        totalCurrentFunders: 0,
        balance: 0,
        startTime: "...",
        nextWithdrawal: "...",
        withdrawalPeriod: "...",
        live: true,
        sunsetWithdrawalPeriod: "...",
        minimumFundingAmount: 0,
        tokenContract: "0x0000000000000000000000000000000000000000"
      },
      contractInstance: '',
      creator: {title: ''}
    };

    window.CreatorPage = this;
  }

  fetchCreator(creatorUrl) {
    if(typeof Creators[creatorUrl] !== 'undefined'){
      const ipfsHash = Creators[creatorUrl];
      fetch(`https://ipfs.infura.io/ipfs/${ipfsHash}`)
        .then((res) => {return res.json()})
        .then(data => {
          this.setState({creator: data});
          this.setState({userLoading: false});

          // TODO: serve -s build runs this on port 5000
          const fetchHost = window.location.hostname === "localhost" ? "http://localhost:3000" : ''; 
          const fetchUrl = `${fetchHost}/contract/${this.state.creator.contractAddress}`;
          // TODO: Polyfill fetch for back suport
          fetch(fetchUrl)
            .then((res) => {return res.json()})
            .then(data => {
              this.setState({
                ...this.state,
                contract: data
              });
            });

          if(typeof window.web3 !== 'undefined') {
            this.hydrate();
          }
          else {
            // Poll for web3 availability
            web3Polling = setInterval(async ()=> {
              if(typeof window.web3 !== 'undefined') {
                clearInterval(web3Polling);
                this.setState({"web3available": true});
                this.hydrate();
              }
            }, 1500);
          }
        });
    }
    else {
      // NO USER
      console.log("NO USER AT THIS ADDESS");
    }
  }

  componentWillReceiveProps(nextProps) {
    // We've changed to a new creator page. Let's refetch things
    if(nextProps.match.url !== this.props.match.url) {
      this.setState({userLoading: true});
      this.setState({contractLoading: true});

      this.fetchCreator(nextProps.match.url);
    }
  }

  async componentWillMount() {  
    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD")
      .then(res => {return res.json()})
      .then(data => {
        this.setState({
          exchangeRate: parseInt(data[0].price_usd, 10)
        });
      });
    this.fetchCreator(this.props.match.url);
  }

  async hydrate() {
    const instance = Web3Controller.newInstance({
      which: "StakeTreeWithTokenization", 
      at: this.state.creator.contractAddress
    });

    // Verify contract
    instance.version.call({}, async (err, result)=>{
      if(result && result.c && result.c[0] && result.c[0] === 2) {
        this.setState({contractInstance: instance});
        this.setState({contractLoading: false});

        Web3Controller.getCurrentAccount((currentAccount)=>{
          this.setState({currentEthAccount: currentAccount});
          this.getContractDetails();

          // All set, now lets poll for values we are looking for
          Web3Controller.subscribeToAccountChange((newAccount) => {
            this.setState({
              currentEthAccount: newAccount,
              isFunder: false,
              isBeneficiary: false
            });
            this.getContractDetails();
          });
        });

        web3store.subscribe('creator-page', (newState)=>{
          setTimeout(()=>{this.getContractDetails()}, 5000);
        });
      }
      else {
        // No contract found
        this.setState({contractLoading: false});
      }
    });
  }

  getContractDetails() {
    Web3Controller.getContractDetails({
      id: 'main-contract-details',
      instance: this.state.contractInstance,
      variables: [
        'totalCurrentFunders', 'contractStartTime', 'beneficiary', 'getContractBalance',
        'nextWithdrawal', 'withdrawalPeriod', 'live', 'sunsetWithdrawalPeriod',
        'minimumFundingAmount', 'tokenized', 'withdrawalCounter', 'tokenContract'
      ],
    }, (key, value) => {
      if(key === "getContractBalance") key = "balance";
      this.setContractState(key, value);
    });
  }

  setContractState(key, value) {
    const newContractState = {
        ...this.state.contract
    };
    newContractState[key] = value;

    this.setState({
      contract: newContractState
    });
  }

  componentWillUnmount() {
    clearInterval(web3Polling);
    web3store.unsubscribe('creator-page');
    Web3Controller.unsubscribeFromAccountChange();
  }

  handleCustomAmount(e) {
    let value = e.target.value;
    if(e.target.value === "") value = 0.1;
    this.setState({customAmount: value});
  }

  render() {

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    const fundStarted = new Date(this.state.contract.contractStartTime*1000).toLocaleDateString();
    const nextWithdrawal = new Date(this.state.contract.nextWithdrawal*1000).toLocaleDateString();
    const sunsetPeriodDays = Math.floor((this.state.contract.sunsetWithdrawalPeriod % 31536000) / 86400);
    const withdrawalPeriodDays = Math.floor((this.state.contract.withdrawalPeriod % 31536000) / 86400);

    const balance = web3.utils.fromWei(String(this.state.contract.balance), 'ether');

    let withdrawalAmount = this.state.exchangeRate * (balance * 0.1);
    withdrawalAmount = withdrawalAmount.toFixed(2);

    const minAmount = web3.utils.fromWei(String(this.state.contract.minimumFundingAmount), 'ether');

    return (
      <div className="container creator-page">
        {this.state.userLoading ? 'Loading...' :
          <span>
          <div className="row">
            <div className="twelve columns">
              <h3 className="creatorpage-project-name">{this.state.creator.title}</h3>
            </div>
          </div>
          
          <div className="row">
            <div className="four columns sidebar">
              <div className="sidebar">
                <span className="creatorpage-avatar"><img alt={`Avatar for ${this.state.creator.title}`} src={this.state.creator.avatar} /></span>
                <FundButton toAddress={this.state.creator.contractAddress} amount={customAmount} minAmount={minAmount} >Stake {customAmount} Ether</FundButton>
                <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
                <div className="sidebar-key-info">
                  <div className="sidebar-key-info-heading">Fund Details</div>
                  Next withdrawal amount: ±${withdrawalAmount}<br />
                  Total contributors: {this.state.contract.totalCurrentFunders} <br />
                  Total staked: {balance} ether<br />
                  Next withdrawal: {nextWithdrawal}
                </div>
                <div className="sidebar-other-info">
                  Live: {this.state.contract.live ? '✅' : '🚫'}<br />
                  Fund started: {fundStarted} <br />
                  Withdrawal period: {withdrawalPeriodDays} days <br />
                  Sunset Period: {sunsetPeriodDays} days <br />
                  Contract Source: <EtherscanLink type={"address"} id={this.state.creator.contractAddress} text="View on Etherscan" />
                </div>
              </div>
             
              <div className='contract-card'>
                Are you a beneficiary or funder? Head to the <Link to={`/c/${this.state.creator.contractAddress}`}>contract dashboard</Link> to interact with this contract.
              </div>
            </div>
            <div className="eight columns">
              <PageEditor content={this.state.creator.description} readOnly={!this.state.isEditing} />
            </div>
          </div>

          </span>
        }
      </div>
    );
  }
}

export default CreatorPage;
