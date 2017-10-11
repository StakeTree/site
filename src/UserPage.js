import React, { Component } from 'react';
import Web3 from 'web3'; // TODO: follow up on how to use web3 when pulled in vs metamask
import TruffleContract from 'truffle-contract';
import StakeTreeMVP from './abi/StakeTreeMVP.json';

// Styling
import './UserPage.css';

//Components
import Nav from './Nav.js';

let contractInstance;
const web3 = new Web3();

class UserPage extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isFunder: false,
      isBeneficiary: false,
      customAmount: 0.1,
      web3available: false,
      contractAddress: "0xa899495d47b6a575c830ffc330bc83318df46a44",
      contract: {
        totalContributors: "...",
        balance: 0,
        startTime: "...",
        nextWithdrawal: "...",
        withdrawalPeriod: "...",
        live: true,
        sunsetPeriod: "..."
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

    window.addEventListener('load', async function() {
      if (typeof window.web3 !== 'undefined') {
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
          const isFunder = await contractInstance.isFunder(accounts[0]);
          this.setState({
            ...this.state,
            isFunder: isFunder
          });

          const beneficiary = await contractInstance.beneficiary.call();
          this.setState({
            ...this.state,
            isBeneficiary: accounts[0] === beneficiary
          });
        });

      }
    }.bind(this))
  }

  fund(etherAmount) {
    // TODO: follow up on how to use web3 when pulled in vs metamask
    let web3 = window.web3;
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
    this.setState({customAmount: e.target.value});
  }

  noWeb3() {
    if(!this.state.web3available) {
      return <div className="no-web3"><p>To fund StakeTree using the buttons below you need have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. If you have MetaMask installed, try unlocking it before trying again. Otherwise send ether to this address, <code>{this.state.contractAddress}</code>, using your preffered wallet.</p></div>;
    }
    return "";
  }

  async refund(e) {
    window.web3.eth.getAccounts(async (error, accounts) => {
      const gasRequired = await contractInstance.refund.estimateGas({from: accounts[0]});
      console.log(gasRequired);
      // TODO: Figure out why estimated gas cost is wrong
      contractInstance.refund({"from": accounts[0], "gas": 100000});

      // TODO: Add success handler to remove button
      this.setState({
        ...this.state,
        isFunder: false
      });
    });
    
  }

  async withdraw(e) {
    // TODO: Add client-side validation when not in time for withdrawal
    window.web3.eth.getAccounts(async (error, accounts) => {
      // const gasRequired = await contractInstance.withdraw.estimateGas({from: accounts[0]});
      // console.log(gasRequired);
      // TODO: Figure out why estimated gas cost is wrong
      contractInstance.withdraw({"from": accounts[0], "gas": 100000});
    });
  }

  render() {

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    const fundStarted = new Date(this.state.contract.contractStartTime*1000).toLocaleDateString();
    const nextWithdrawal = new Date(this.state.contract.nextWithdrawal*1000).toLocaleDateString();
    const sunsetPeriodDays = Math.floor((this.state.contract.sunsetPeriod % 31536000) / 86400);
    const withdrawalPeriodDays = Math.floor((this.state.contract.withdrawalPeriod % 31536000) / 86400);

    const balance = web3.utils.fromWei(this.state.contract.balance, 'ether');

    return (
      <div className="container">
        <Nav />
        <div className="row">
          <div className="twelve columns">
            <h3 className="up-project-name">{this.state.user.title}</h3>
          </div>
        </div>
        <div className="row">
          <div className="four columns sidebar">
            <div className="sidebar">
              <span className="up-avatar"><img alt="Niel's face" src="ava.jpg" /></span>
              <button className="btn" onClick={this.fund.bind(this, customAmount)}>Stake {customAmount} Ether</button>
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
              {this.state.isBeneficiary ? <button className="btn clean" onClick={this.withdraw.bind(this)}>Withdraw from fund</button> : ''}
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

export default UserPage;