import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import TruffleContract from 'truffle-contract';
import StakeTreeWithTokenization from 'staketree-contracts/build/contracts/StakeTreeWithTokenization.json';

// Styling
import './ContractCard.css';

//Components
import Nav from './Nav.js';
import EtherscanLink from './EtherscanLink.js';

let contractInstance;
let web3Polling;
const web3 = new Web3();

class ContractCard extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      exchangeRate: 0,
      currentEthAccount: "",
      showTooltip: "",
      isFunder: false,
      isBeneficiary: false,
      customAmount: 0.1,
      web3available: false,
      contractAddress: this.props.match.params.address,
      contract: {
        totalCurrentFunders: 0,
        balance: 0,
        startTime: "...",
        nextWithdrawal: "...",
        withdrawalPeriod: "...",
        live: true,
        sunsetPeriod: "...",
        minimumFundingAmount: 0
      },
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

    // Poll for account/web3 changes
    web3Polling = setInterval(async ()=> {
      if(typeof window.web3 !== 'undefined') {
        this.setState({"web3available": true});

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

        const contract = TruffleContract(StakeTreeWithTokenization);
        contract.setProvider(window.web3.currentProvider);

        contractInstance = await contract.at(this.state.contractAddress);
        window.contractInstance = contractInstance; // debugging

        contractInstance.totalCurrentFunders.call().then(result => {
          this.setContractState('totalCurrentFunders', result.toNumber());
        });
        contractInstance.getContractBalance.call().then(result => {
          this.setContractState('balance', result.toNumber());
        });
        contractInstance.contractStartTime.call().then(result => {
          this.setContractState('contractStartTime', result.toNumber());
        });
        contractInstance.nextWithdrawal.call().then(result=>{
          this.setContractState('nextWithdrawal', result.toNumber());
        });
        contractInstance.withdrawalPeriod.call().then(result=>{
          this.setContractState('withdrawalPeriod', result.toNumber());
        });
        contractInstance.live.call().then(result=>{
          this.setContractState('live', result);
        });
        contractInstance.sunsetWithdrawalPeriod.call().then(result=>{
          this.setContractState('sunsetWithdrawalPeriod', result.toNumber());
        });
        contractInstance.minimumFundingAmount.call().then(result=>{
          this.setContractState('minimumFundingAmount', result.toNumber());
        });
        contractInstance.tokenized.call().then(result=>{
          this.setContractState('tokenized', result);
        });

        window.web3.eth.getAccounts(async (error, accounts) => {
          if(this.state.currentEthAccount !== accounts[0]){
            // RESET UI
            this.setState({
              currentEthAccount: accounts[0],
              isFunder: false,
              isBeneficiary: false
            });
          }

          // Check again for new accounts
          contractInstance.isFunder(this.state.currentEthAccount).then((isFunder) => {
            this.setState({
              ...this.state,
              isFunder: isFunder
            });
          });

          contractInstance.beneficiary.call().then((beneficiary) => {
            this.setState({
              ...this.state,
              isBeneficiary: this.state.currentEthAccount === beneficiary
            });
            this.setContractState('beneficiary', beneficiary);
          });
        });

      }
    }, 1500);
  }

  componentWillUnmount() {
    clearInterval(web3Polling);
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

  canFund(etherAmount) {
    let web3 = window.web3; // Uses web3 from metamask
    const minAmount = web3.fromWei(this.state.contract.minimumFundingAmount, 'ether');
    if(etherAmount < minAmount) {
      return false;
    }
    else{
      return true;
    } 
  }

  canWithdraw() {
    const withdrawalDate = new Date(this.state.contract.nextWithdrawal*1000);
    if(new Date() <= withdrawalDate) {
      return false;
    }
    else {
      return true;
    }
  }

  fund(etherAmount) {
    if(!this.canFund(etherAmount)){ return false;}

    let web3 = window.web3; // Uses web3 from metamask
    web3.eth.getAccounts((error, accounts) => {
      if(accounts.length > 0){
        this.setState({web3available: true});
        const account = accounts[0];

        web3.eth.sendTransaction(
          {"from": account, "to": this.state.contractAddress, "value": web3.toWei(etherAmount, "ether")}, 
          (err, transactionHash) => {
            console.log(transactionHash);
          }
        );
      }
      else {
        this.setState({web3available: false});
      }
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

  async refund(e) {
    window.web3.eth.getAccounts(async (error, accounts) => {
      // const gasRequired = await contractInstance.refund.estimateGas({from: accounts[0]});
      // TODO: Figure out why estimated gas cost is wrong
      await contractInstance.refund({"from": accounts[0], "gas": 100000});
    });
    
  }

  async withdraw(e) {
    if(!this.canWithdraw()) {
      return false;
    }
    
    window.web3.eth.getAccounts(async (error, accounts) => {
      // const gasRequired = await contractInstance.withdraw.estimateGas({from: accounts[0]});
      // console.log(gasRequired);
      // TODO: Figure out why estimated gas cost is wrong
      contractInstance.withdraw({"from": accounts[0], "gas": 100000});
    });
  }

  hideTooltip() {
    this.setState({showTooltip: ""});
  }

  checkTooltip(tooltipId) {
    switch(tooltipId){
      case "withdrawal":
        if(!this.canWithdraw()) {
          const withdrawalDate = new Date(this.state.contract.nextWithdrawal*1000);
          this.setState({
            showTooltip: tooltipId,
            tooltipText: `Unfortunately, you can only withdraw after ${withdrawalDate.toLocaleString()}.`
          });
        }
        break;
      case "fund":
        if(!this.canFund(this.state.customAmount)) {
          const minAmount = web3.utils.fromWei(this.state.contract.minimumFundingAmount, 'ether');
          this.setState({
            showTooltip: tooltipId,
            tooltipText: `The minimum funding amount is ${minAmount} ether. Try a bigger amount.`
          });
        }
        break;
      default:
        return false;
    }
  }

  render() {

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    const fundStarted = new Date(this.state.contract.contractStartTime*1000).toLocaleDateString();
    const nextWithdrawal = new Date(this.state.contract.nextWithdrawal*1000).toLocaleDateString();
    const sunsetPeriodDays = Math.floor((this.state.contract.sunsetWithdrawalPeriod % 31536000) / 86400);
    const withdrawalPeriodDays = Math.floor((this.state.contract.withdrawalPeriod % 31536000) / 86400);

    const balance = web3.utils.fromWei(this.state.contract.balance, 'ether');
    
    let withdrawTooltipClassNames = "tooltip";
    if(this.state.showTooltip === "withdrawal") withdrawTooltipClassNames += ' visible';

    let fundTooltipClassNames = "tooltip";
    if(this.state.showTooltip === "fund") fundTooltipClassNames += ' visible';

    let withdrawalAmount = this.state.exchangeRate * (balance * 0.1);
    withdrawalAmount = withdrawalAmount.toFixed(2);

    const tokenHtml = !this.state.contract.tokenized && this.state.isBeneficiary ? <div className="token-action">You haven't add token claiming to the contract yet. Add it by clicking <a href="">here</a>.</div> : '';

    return (
      <div className="container">
        <Nav />
        <div className="row">
          <div className="six columns offset-by-three">
            <div className="contract-card">
              <ul>
                <li>Total staked: {balance} ether</li>
                <li>Total funders: {this.state.contract.totalCurrentFunders}</li>
                <li>Next Withdrawal Amount: ±${withdrawalAmount}</li>
                <li>Withdrawal Period: {withdrawalPeriodDays} days</li>
                <li>Next Withdrawal: {nextWithdrawal}</li>
                <li>Fund Started: {fundStarted}</li>
                <li>Sunset Period: {sunsetPeriodDays} days</li>
                <li>Live: {this.state.contract.live ? '✅' : '🚫'}</li>
                <li>Beneficiary: <code><EtherscanLink type={"address"} text={this.state.contract.beneficiary} id={this.state.contract.beneficiary} /></code></li>
                <li>Contract:  <code><EtherscanLink type={"address"} text={this.props.match.params.address} id={this.props.match.params.address} /></code></li>
              </ul>
              <div className="contract-card-actions">
                <div className="main-actions">
                  <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
                  <button className="btn stake-btn" onMouseOver={this.checkTooltip.bind(this, 'fund')} onMouseLeave={this.hideTooltip.bind(this)} onClick={this.fund.bind(this, customAmount)}>Stake {customAmount} Ether</button>
                </div>
              </div>
            </div>
            
              <div className="contract-card">
                {this.state.isBeneficiary || this.state.isFunder ? 
                  <div className="contract-card-actions">
                    <div className="secondary-actions">
                      {this.state.isBeneficiary ? <button className="btn clean" onClick={this.withdraw.bind(this)}>Withdraw</button> : ''}
                      {this.state.isFunder ? <button className="btn clean" onClick={this.refund.bind(this)}>Refund</button> : ''}
                    </div>
                  </div>
                : "Are you a beneficiary or funder? Select your respective account in Metamask to interact with this contract."}
              </div> 
              
          </div>
        </div>
      </div>
    );
  }
}

export default ContractCard;