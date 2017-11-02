import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import TruffleContract from 'truffle-contract';
import StakeTreeWithTokenization from 'staketree-contracts/build/contracts/StakeTreeWithTokenization.json';

// Styling
import './ContractCard.css';

//Components
import Nav from './Nav.js';
import RefundButton from './RefundButton.js';
import WithdrawButton from './WithdrawButton.js';
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
        minimumFundingAmount: 0
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

    let pollingCounter = 0;
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

        await contract.at(this.state.contractAddress).then(inst=> {
          contractInstance = inst;
          this.setState({contractInstance: contractInstance});
          this.setState({loading: false});
          window.contractInstance = contractInstance; // debugging
        }).catch(err => {
          this.setState({loading: false});
          // No contract found
          console.log("C");
        });

        if(contractInstance) {
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

          contractInstance.withdrawalCounter.call().then(result=>{
            this.setContractState('withdrawalCounter', result.toNumber());
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
            contractInstance.isFunder(this.state.currentEthAccount).then(async (isFunder) => {
              const funderBalance = await contractInstance.getFunderBalance.call(this.state.currentEthAccount);
              const funderContribution = await contractInstance.getFunderContribution.call(this.state.currentEthAccount);
              const funderContributionClaimed = await contractInstance.getFunderContributionClaimed.call(this.state.currentEthAccount);

              this.setState({
                ...this.state,
                isFunder: isFunder,
                funder: {
                  contribution: funderContribution.toNumber(),
                  contributionClaimed: funderContributionClaimed.toNumber(),
                  balance: funderBalance.toNumber()
                }
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
      }
      else {
        pollingCounter++;
        if(pollingCounter === 3) {
          this.setState({loading: false, web3available: false});
        }
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

  async claimTokens(e) {
    window.web3.eth.getAccounts(async (error, accounts) => {
      await contractInstance.claimTokens({"from": accounts[0], "gas": 150000});
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

    const isFunder = this.state.isFunder;
    let funderBalance = 0;
    let funderContribution = 0;
    let funderClaimAmount = 0;
    if(isFunder) {
      funderBalance = web3.utils.fromWei(this.state.funder.balance, 'ether');
      funderContribution = web3.utils.fromWei(this.state.funder.contribution, 'ether');
      funderClaimAmount = web3.utils.fromWei(this.state.funder.contribution-this.state.funder.contributionClaimed, 'ether');
    }
    
    let fundTooltipClassNames = "tooltip";
    if(this.state.showTooltip === "fund") fundTooltipClassNames += ' visible';

    let withdrawalAmount = this.state.exchangeRate * (balance * 0.1);
    withdrawalAmount = withdrawalAmount.toFixed(2);

    let totalStakedDollar = this.state.exchangeRate * (balance);
    totalStakedDollar = totalStakedDollar.toFixed(2);

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
        <Nav />
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
                <div className="contract-card">
                  {this.state.isBeneficiary || this.state.isFunder ? 
                    <div className="contract-card-actions">
                      {this.state.isFunder ? <div>
                        <h4>Hi there funder,</h4>
                        <ul>
                          <li>Currently staked: {funderBalance} ether.</li>
                          <li>Total contributed: {funderContribution} ether.</li>
                          {this.state.contract.tokenized ? <li>You can claim {funderClaimAmount} tokens.</li> : '' }
                        </ul>
                      </div> : ''}
                      {this.state.isBeneficiary ? <div>
                        <h4>Hi, beneficiary</h4>
                        <ul>
                          <li><strong>Total $ staked</strong>: ±${totalStakedDollar}</li>
                          <li><strong>Total withdrawals</strong>: {this.state.contract.withdrawalCounter}</li>
                        </ul>
                      </div> : ''}
                      <div className="secondary-actions">
                        <WithdrawButton
                          withdrawalDate={new Date(this.state.contract.nextWithdrawal*1000)} 
                          visible={this.state.isBeneficiary}
                          contract={this.state.contractInstance}>Withdraw</WithdrawButton>
                        <RefundButton 
                          visible={this.state.isFunder} 
                          contract={this.state.contractInstance}>Refund</RefundButton>
                        {this.state.isFunder && this.state.contract.tokenized ? <button className="btn clean" onClick={this.claimTokens.bind(this)}>Claim Tokens</button> : ''}
                      </div>
                    </div>
                  : "Are you a beneficiary or funder? Select your respective account in Metamask to interact with this contract."}
                </div>
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
                      <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
                      <button className="btn stake-btn" onMouseOver={this.checkTooltip.bind(this, 'fund')} onMouseLeave={this.hideTooltip.bind(this)} onClick={this.fund.bind(this, customAmount)}>Stake {customAmount} Ether</button>
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

export default ContractCard;