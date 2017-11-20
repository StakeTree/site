import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import TruffleContract from 'truffle-contract';
import StakeTreeMVP from 'staketree-contracts/build/contracts/StakeTreeMVP.json';

import Creators from './creators.json';

// Styling
import './CreatorPage.css';

// Other
import Web3Controller from './Web3Controller.js';
import web3store from './Web3Store.js';

//Components
import EtherscanLink from './EtherscanLink.js';
import FundButton from './FundButton.js';
import FunderCard from './FunderCard.js';
import BeneficiaryCard from './BeneficiaryCard.js';
import PageEditor from './PageEditor.js';

let contractInstanceMVP;
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
        sunsetPeriod: "...",
        minimumFundingAmount: 0,
        tokenContract: "0x0000000000000000000000000000000000000000"
      },
      contractInstance: '',
      creator: {title: ''}
    };
  }

  async componentWillMount() {    
    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD")
      .then(res => {return res.json()})
      .then(data => {
        this.setState({
          exchangeRate: parseInt(data[0].price_usd, 10)
        });
      });

    // Simulate async fetching user info
    setTimeout(()=> {
      if(typeof Creators[this.props.match.url] !== 'undefined') {
        this.setState({creator: Creators[this.props.match.url]});
        this.setState({userLoading: false});

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
      }
      else {
        // NO USER
        console.log("NO SUER AT THIS ADDESS");
      }
    }, 1000);
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

    // OLD MVP for refunding backwards compatible
    const contractMVP = TruffleContract(StakeTreeMVP);
    contractMVP.setProvider(window.web3.currentProvider);
    contractInstanceMVP = await contractMVP.at("0xa899495d47B6a575c830Ffc330BC83318Df46a44");
    window.contractInstanceMVP = contractInstanceMVP; // debugging
    // OLD MVP for refunding backwards compatible
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

    Web3Controller.getContractDetails({
      id: 'is-funder',
      instance: this.state.contractInstance,
      functions: [
        {name: 'isFunder', arg: this.state.currentEthAccount}
      ]
    }, (key, isFunder) => {
      this.setState({
        ...this.state,
        isFunder: isFunder,
      });        
    });

    Web3Controller.getContractDetails({
      id: 'is-beneficiary',
      instance: this.state.contractInstance,
      variables: ['beneficiary']
    }, (key, beneficiary) => {
      this.setState({
        ...this.state,
        isBeneficiary: this.state.currentEthAccount === beneficiary,
      });        
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

  noWeb3() {
    if(!this.state.web3available) {
      return <div className="no-web3"><p>To fund StakeTree using the buttons below you need have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. If you have MetaMask installed, try unlocking it before trying again. Otherwise send ether to this address, <code>{this.state.creator.contractAddress}</code>, using your preffered wallet.</p></div>;
    }
    return "";
  }

  async refundOld(e) {
    e.preventDefault();
    window.web3.eth.getAccounts(async (error, accounts) => {
      // const gasRequired = await contractInstance.refund.estimateGas({from: accounts[0]});
      // TODO: Figure out why estimated gas cost is wrong
      await contractInstanceMVP.refund({"from": accounts[0], "gas": 100000});
    });
  }

  render() {

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    const fundStarted = new Date(this.state.contract.contractStartTime*1000).toLocaleDateString();
    const nextWithdrawal = new Date(this.state.contract.nextWithdrawal*1000).toLocaleDateString();
    const sunsetPeriodDays = Math.floor((this.state.contract.sunsetPeriod % 31536000) / 86400);
    const withdrawalPeriodDays = Math.floor((this.state.contract.withdrawalPeriod % 31536000) / 86400);

    const balance = web3.utils.fromWei(this.state.contract.balance, 'ether');

    let withdrawalAmount = this.state.exchangeRate * (balance * 0.1);
    withdrawalAmount = withdrawalAmount.toFixed(2);

    const minAmount = web3.utils.fromWei(this.state.contract.minimumFundingAmount, 'ether');

    let totalStakedDollar = this.state.exchangeRate * (balance);
    totalStakedDollar = totalStakedDollar.toFixed(2);

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
            <div className="twelve columns">
              <div style={{"marginBottom": "25px"}}className="well">
              The <EtherscanLink text={"MVP contract"} type={"address"} id={"0xa899495d47B6a575c830Ffc330BC83318Df46a44"} /> has been put into sunset mode. Click <a href="" onClick={this.refundOld.bind(this)}>here</a> to refund your ether.<br />
              Read more on <a target="_blank" rel="noopener noreferrer" href="https://medium.com/@StakeTree/sunsetting-the-mvp-now-with-tokenization-4b4be1339b71">what's changed</a> in the new contract. I hope to see you fund the new contract below!
              </div>
            </div>
          </div>
          <div className="row">
            <div className="four columns sidebar">
              <div className="sidebar">
                <span className="creatorpage-avatar"><img alt="Niel's face" src="ava.jpg" /></span>
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
                  Contract Source: <a href={`https://etherscan.io/address/${this.state.creator.contractAddress}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>
                </div>
              </div>
              {this.state.isFunder ? 
                <FunderCard 
                  currentAccount={this.state.currentEthAccount}
                  toAddress={this.state.creator.contractAddress}
                  minAmount={minAmount}
                  contract={this.state.contractInstance} 
                  tokenized={this.state.contract.tokenized}
                  tokenContract={this.state.contract.tokenContract} /> : ''}
              {this.state.isBeneficiary ? 
                <BeneficiaryCard 
                  minAmount={minAmount}
                  nextWithdrawal={this.state.contract.nextWithdrawal}
                  withdrawalCounter={this.state.contract.withdrawalCounter}
                  totalStakedDollar={totalStakedDollar} 
                  tokenized={this.state.contract.tokenized}
                  contract={this.state.contractInstance} /> : ''}
              {!this.state.isBeneficiary && !this.state.isFunder ? 
                <div className='contract-card'>
                Are you a beneficiary or funder? Select your respective account in Metamask to interact with this contract.
                </div> 
              : ''}
            </div>
            <div className="eight columns">
              <p>
              Hi everyone. I'm <a href="https://twitter.com/nieldlr" target="_blank" rel="noopener noreferrer">Niel</a>, the founder of StakeTree.<br />
              This dev fund is my only source of funding right now. I would really appreciate any help with bringing this ecosystem to the world.
              </p>
              <p>StakeTree uses smart contracts on Ethereum, where creators & funders can back projects with no intermediaries, fees and instant settlement.</p>
              <p>There's lots more planned for StakeTree:</p>
              <ul>
                <li><strong>Creating a simple UI</strong> for funders & creators to create, fund & withdraw from contracts.</li>
                <li><strong>Develop funding tiers</strong>. This is where creators can reward dedicated backers with special rewards/access. Think tiers like Kickstarter & Patreon.</li> 
                <li><strong>Fund contracts with any ERC-20 token.</strong></li>
                <li><strong>Tokenization for funders & creators</strong>. When the creator withdraws ether, it mints tokens for all parties. These tokens can then be used for many things: voting, curation, special access, discounts and more. The creativity of the creator is the limit here.</li>
                <li><strong>Create funding buckets</strong>. For example fund many Ethereum dev related projects using a single payment.</li>
                <li><strong>Build a platform</strong>. Make it easy for creators to communicate with and build their communities.</li>
              </ul>
              <p>Plus many more ideas to come! Check out the <a href="https://trello.com/b/ThPpLwFm/staketree-transparent-roadmap" target="_blank" rel="noopener noreferrer">transparent roadmap</a> here.</p>
              <p><strong>But I need your help to build StakeTree.</strong></p>
              <p>In true dogfooding fashion, I'll be building StakeTree using StakeTree itself.</p>
              <p>For updates, follow me on <a href="https://twitter.com/staketree" target="_blank" rel="noopener noreferrer">Twitter</a> & <a href="https://github.com/StakeTree" target="_blank" rel="noopener noreferrer">Github</a>.</p>
            
              <PageEditor content={this.state.creator.description} />
            
            </div>
          </div>

          </span>
        }
      </div>
    );
  }
}

export default CreatorPage;