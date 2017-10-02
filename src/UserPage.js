import React, { Component } from 'react';
import './UserPage.css';

import Nav from './Nav.js';

class UserPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customAmount: 10,
      web3available: false,
      user: { // Fetch this information in the future
        title: 'StakeTree Development Fund',
        contract: {
          totalContributors: 10,
          totalBalance: 50,
          address: "0x9561c133dd8580860b6b7e504bc5aa500f0f06a7"
        }
      }
    };

    window.addEventListener('load', function() {
      if (typeof web3 !== 'undefined') {
        this.setState({"web3available": true});
      }
    }.bind(this))
  }
  fund(etherAmount) {
    let web3 = window.web3;
    web3.eth.getAccounts((error, accounts) => {
      if(accounts.length > 0){
        this.setState({web3available: true});
        const account = accounts[0];

        web3.eth.sendTransaction(
          {"from": account, "to": this.state.user.contract.address, "value": web3.toWei(etherAmount, "ether")}, 
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
      return <div className="no-web3"><p>To fund StakeTree using the buttons below you need have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. If you have MetaMask installed, try unlocking it before trying again. Otherwise send ether to this address, <code>{this.state.user.contract.address}</code>, using your preffered wallet.</p></div>;
    }
    return "";
  }

  render() {
    const noWeb3 = this.noWeb3();

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 10;

    return (
      <div className="container">
        <Nav />
        <div className="row up-highlights">
          <div className="three columns">
            <div className="featurette up-highlight">
              <h4>10 <br />contributors</h4>
            </div>
          </div>
          <div className="six columns">
            <div className="featurette">
              <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" />
              <button className="btn">Stake 1 Ether</button>
            </div>
          </div>  
          <div className="three columns">
            <div className="featurette up-highlight">
              <h4>50 <br />ether staked</h4>
            </div>
          </div> 
          
        </div>
        <div className="row">
          <div className="twelve columns">
            <h3 className="up-project-name">{this.state.user.title}</h3>
          </div>
        </div>
        <div className="row">
          <div className="three columns sidebar">
            <img className="up-avatar" alt="Niel's face" src="ava.jpg" />
            <div className="sidebar-info">
              Fund started: xx/xx/xxxx. <br />
              Next withdrawal date: xx/xx/xxxx.
            </div>
            <div className="sidebar-actions">
              <button className="btn clean">Refund my ether</button>
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