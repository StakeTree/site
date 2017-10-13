import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import TruffleContract from 'truffle-contract';
import StakeTreeMVP from 'staketree-contracts/build/contracts/StakeTreeMVP.json';

// Styling
import './CreatorPage.css';

//Components
import Nav from './Nav.js';

let contractInstance;
let web3Polling;
const web3 = new Web3();

class CreatorPage extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      currentEthAccount: "",
      showTooltip: "",
      isFunder: false,
      isBeneficiary: false,
      customAmount: 0.1,
      web3available: false,
      contractAddress: "0xa899495d47B6a575c830Ffc330BC83318Df46a44",
      contract: {
        totalContributors: "...",
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

    const fetchHost = window.location.hostname === "localhost" ? "http://localhost:3000" : ''; 
    const fetchUrl = `${fetchHost}/contract/${this.state.contractAddress}`;
    // TODO: Polyfill fetch for back suport
    fetch(fetchUrl)
      .then((res) => {return res.json()})
      .then(data => {
        this.setState({
          ...this.state,
          contract: data
        });
      });
  }

  async componentWillMount() {
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

        const contract = TruffleContract(StakeTreeMVP);
        contract.setProvider(window.web3.currentProvider);

        contractInstance = await contract.at(this.state.contractAddress);
        window.contractInstance = contractInstance; // debugging
      
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
          });
        });
      }
    }, 1500);
  }

  componentWillUnmount() {
    clearInterval(web3Polling);
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
    const sunsetPeriodDays = Math.floor((this.state.contract.sunsetPeriod % 31536000) / 86400);
    const withdrawalPeriodDays = Math.floor((this.state.contract.withdrawalPeriod % 31536000) / 86400);

    const balance = web3.utils.fromWei(this.state.contract.balance, 'ether');
    
    let withdrawTooltipClassNames = "tooltip";
    if(this.state.showTooltip === "withdrawal") withdrawTooltipClassNames += ' visible';

    let fundTooltipClassNames = "tooltip";
    if(this.state.showTooltip === "fund") fundTooltipClassNames += ' visible';

    return (
      <div className="container">
        <Nav />
        <div className="row">
          <div className="twelve columns">
            <h3 className="creatorpage-project-name">{this.state.user.title}</h3>
          </div>
        </div>
        <div className="row">
          <div className="four columns sidebar">
            <div className="sidebar">
              <span className="creatorpage-avatar"><img alt="Niel's face" src="ava.jpg" /></span>
              <span className="tooltip-button">
                <div className={fundTooltipClassNames}>{this.state.tooltipText}</div>
                <button className="btn" onMouseOver={this.checkTooltip.bind(this, 'fund')} onMouseLeave={this.hideTooltip.bind(this)} onClick={this.fund.bind(this, customAmount)}>Stake {customAmount} Ether</button>
              </span>
              <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
              <div className="sidebar-key-info">
                <div className="sidebar-key-info-heading">Fund Details</div>
                Total contributors: {this.state.contract.totalContributors} <br />
                Total staked: {balance} ether<br />
                Fund started: {fundStarted} <br />
                Next withdrawal: {nextWithdrawal}
              </div>
              <div className="sidebar-other-info">
                Live: {this.state.contract.live ? '✅' : '🚫'}<br />
                Withdrawal period: {withdrawalPeriodDays} days <br />
                Sunset Period: {sunsetPeriodDays} days
              </div>
            </div>
            <div className="sidebar-actions">
              {this.state.isBeneficiary ? 
                <span className="tooltip-button">
                  <div className={withdrawTooltipClassNames}>{this.state.tooltipText}</div>
                  <button onMouseOver={this.checkTooltip.bind(this, 'withdrawal')} onMouseLeave={this.hideTooltip.bind(this)} className="btn clean" onClick={this.withdraw.bind(this)}>Withdraw from fund</button> 
                </span>
              : ''}
              {this.state.isFunder ? <button className="btn clean" onClick={this.refund.bind(this)}>Refund my ether</button> : ''}
            </div>
          </div>
          <div className="eight columns">
            <p>
            Hi everyone. <a href="https://twitter.com/nieldlr" target="_blank" rel="noopener noreferrer">Niel de la Rouviere</a> here. Welcome to StakeTree! I'm excited to introduce this project. I believe that to grow the crypto ecosystem
            (and hopefully much more in the future!) we need sustainable ways to fund projects & creators. ICOs are all the rage, but sometimes it just doesn't make
            sense for all that capital to be tied up, especially if your dapp doesn't need a token yet.
            </p>
            <p>Using smart contracts on Ethereum, creators & funders can back projects with no intermediaries, fees and instant settlement.</p>
            <p>There's lots more planned for StakeTree:</p>
            <ul>
              <li><strong>Creating a simple UI</strong> for funders & creators to fund & withdraw from contracts.</li>
              <li><strong>Develop funding tiers</strong>. This is where creators can reward dedicated backers with special rewards/access. Think tiers like Kickstarter & Patreon.</li> 
              <li><strong>Fund contracts with any ERC-20 token.</strong></li>
              <li><strong>Tokenization for funders & creators</strong>. When the creator withdraws ether, it mints tokens for all parties. These tokens can then be used for many things: voting, curation, special access, discounts and more. The creativity of the creator is the limit here.</li>
              <li><strong>Create funding buckets</strong>. For example fund many Ethereum dev related projects using a single payment.</li>
              <li><strong>Build a platform</strong>. Make it easy for creators to communicate with and build their communities.</li>
            </ul>
            <p>Plus many more ideas to come. But...</p>
            <p><strong>I need your help to build StakeTree.</strong></p>
            <p>In true dogfooding fashion, I'll be funding StakeTree using the MVP StakeTree contract myself. You can help fund development using the buttons below. If at any time you want to take back what's left of your ether, you can do this at any time. The UI to make that easy is coming very soon!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default CreatorPage;