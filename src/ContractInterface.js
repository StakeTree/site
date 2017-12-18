import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask

// Styling
import './ContractInterface.css';

// Other
import Web3Controller from './Web3Controller.js';
import web3store from './Web3Store.js';

//Components
import FundButton from './FundButton.js';
import EtherscanLink from './EtherscanLink.js';
import FunderCard from './FunderCard.js';
import BeneficiaryCard from './BeneficiaryCard.js';

let web3Polling;
const web3 = new Web3();

class ContractInterface extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      exchangeRate: 0,
      currentEthAccount: "0x0000000000000000000000000000000000000000",
      showTooltip: "",
      isFunder: false,
      isBeneficiary: false,
      customAmount: 0.1,
      web3available: true,
      contractAddress: this.props.match.params.address,
      contract: {
        totalCurrentFunders: 0,
        balance: 0,
        startTime: "...",
        nextWithdrawal: "...",
        withdrawalPeriod: "...",
        live: true,
        sunsetPeriod: "...",
        minimumFundingAmount: 0,
        tokenContract: "0x0000000000000000000000000000000000000000",
        withdrawalCounter: 0
      },
      contractInstance: '',
      loading: true,
      user: { // Fetch this information in the future
        title: 'StakeTree Development Fund',
      }
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

    // Poll web3 availability
    if(typeof window.web3 !== 'undefined') {
      this.hydrate();
    }
    else{
      let pollingCounter = 0;
      web3Polling = setInterval(async ()=> {
        if(typeof window.web3 !== 'undefined') {
          clearInterval(web3Polling);
          this.setState({"web3available": true});
          this.hydrate();
        }
        else {
          pollingCounter++;
          if(pollingCounter === 3) {
            this.setState({loading: false, web3available: false});
          }
        }
      }, 1500);
    }
  }

  componentWillUnmount() {
    clearInterval(web3Polling);
    web3store.unsubscribe('contract-dashboard');
    Web3Controller.unsubscribeFromAccountChange();
  }

  async hydrate() {
    const instance = Web3Controller.newInstance({
      which: "StakeTreeWithTokenization", 
      at: this.state.contractAddress
    });

    // Verify contract
    instance.version.call({}, async (err, result)=>{
      if(result && result.c && result.c[0] && result.c[0] === 2) {
        this.setState({contractInstance: instance});
        this.setState({loading: false});

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

        web3store.subscribe('contract-dashboard', (newState)=>{
          setTimeout(()=>{this.getContractDetails()}, 5000);
        });
      }
      else {
        // No contract found
        this.setState({loading: false});
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
      ]
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

  handleCustomAmount(e) {
    let value = e.target.value;
    if(e.target.value === "") value = 0.1;
    this.setState({customAmount: value});
  }

  noWeb3() {
    if(!this.state.web3available) {
      return <div className="no-web3"><p>To fund StakeTree using the buttons below you need have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. If you have MetaMask installed, try unlocking it before trying again. Otherwise send ether to this address, <code>{this.state.contractAddress}</code>, using your preffered wallet.</p></div>;
    }
    return "";
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

    let totalStakedDollar = this.state.exchangeRate * (balance);
    totalStakedDollar = totalStakedDollar.toFixed(2);

    const minAmount = web3.utils.fromWei(String(this.state.contract.minimumFundingAmount), 'ether');

    const noContractHtml = this.state.web3available && this.state.contractInstance === '' ? <div className="six columns offset-by-three">
                <div className="contract-card">
                  <p>No staketree contract found at this address. Double check that you have the correct address.</p>
                </div>
              </div> : <span></span>;
    
    const noWeb3 = !this.state.web3available ? <div className="six columns offset-by-three">
                <div className="contract-card">
                  <p>It doesn't seem like you have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. Try installing it and refreshing this page.</p>
                </div>
              </div> : <span></span>;

    return (
      <div className="container">
        <div className="row">
          {this.state.loading ? 
            <div className="twelve columns">
              Loading...
            </div> 
          : 
            <span>
            {noWeb3}
            {noContractHtml}
            {this.state.contractInstance ? 
              <span>
              <div className="five columns">
                {this.state.isFunder ? <FunderCard 
                  currentAccount={this.state.currentEthAccount}
                  toAddress={this.state.contractAddress}
                  minAmount={minAmount}
                  contract={this.state.contractInstance} 
                  tokenized={this.state.contract.tokenized}
                  tokenContract={this.state.contract.tokenContract} /> : ''}
                {this.state.isBeneficiary ? <BeneficiaryCard 
                  minAmount={minAmount}
                  nextWithdrawal={this.state.contract.nextWithdrawal}
                  withdrawalCounter={this.state.contract.withdrawalCounter}
                  totalStakedDollar={totalStakedDollar} 
                  tokenized={this.state.contract.tokenized}
                  contract={this.state.contractInstance} /> : ''}
                {!this.state.isBeneficiary && !this.state.isFunder ? <div className='contract-card'>
                Are you a beneficiary or funder? Select your respective account in Metamask to interact with this contract.
                </div> : ''}
              </div>

              <div className="seven columns">
                <div className="contract-card">
                  <h4>Contract details</h4>
                  <ul>
                    <li>Total staked: {balance} ether</li>
                    <li>Total funders: {this.state.contract.totalCurrentFunders}</li>
                    <li>Next Withdrawal Amount: ±${withdrawalAmount}</li>
                    <li>Withdrawal Period: {withdrawalPeriodDays} days</li>
                    <li>Next Withdrawal: {nextWithdrawal}</li>
                    <li>Fund Started: {fundStarted}</li>
                    <li>Sunset Period: {sunsetPeriodDays} days</li>
                    <li>Live: {this.state.contract.live ? '✔' : '🚫'}</li>
                    <li>Beneficiary: <code><EtherscanLink type={"address"} text={this.state.contract.beneficiary} id={this.state.contract.beneficiary} /></code></li>
                    <li>Contract: <code><EtherscanLink type={"address"} text={this.props.match.params.address} id={this.props.match.params.address} /></code></li>
                  </ul>
                  <div className="contract-card-actions">
                    <div className="main-actions">
                      <FundButton toAddress={this.state.contractAddress} amount={customAmount} minAmount={minAmount} >Stake {customAmount} Ether</FundButton>
                      <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
                    </div>
                  </div>
                </div>              
              </div></span> : ''}              
            </span>
          }
        </div>
      </div>
    );
  }
}

export default ContractInterface;