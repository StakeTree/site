import React, { Component } from 'react';
import './Home.css';

const contractAddress = "0x9561c133dd8580860b6b7e504bc5aa500f0f06a7";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customAmount: 10,
      web3available: false
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
          {"from": account, "to": contractAddress, "value": web3.toWei(etherAmount, "ether")}, 
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
      return <div className="no-web3"><p>To fund StakeTree using the buttons below you need have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> installed. If you have MetaMask installed, try unlocking it before trying again. Otherwise send ether to this address, <code>{contractAddress}</code>, using your preffered wallet.</p></div>;
    }
    return "";
  }

  render() {
    const noWeb3 = this.noWeb3();

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 10;

    return (
      <div className="container">
        <div className="row header">
          <div className="four columns offset-by-four logo">
            <h1 className="tree-logo"><span role='img' aria-label="Tree logo">🌲</span></h1>
            <h1>StakeTree</h1>
          </div> 
        </div>
        <div className="row content">
          <div className="four columns">
            <div className="featurette">
              <h4>Stake Ether to your favorite creators</h4>
              <p>Help creators, teams & projects grow by funding their staketree smart contract.</p>
            </div>
          </div> 
          <div className="four columns">
            <div className="featurette">
              <h4>Creators can withdraw funding</h4>
              <p>Creators can withdraw 10% every week from the staked pool.</p>
            </div>
          </div> 
          <div className="four columns">
            <div className="featurette">
              <h4>Get your stake back at any time</h4>
              <p>Funders can withdraw what's left of their funding at any time.</p>
            </div>
          </div> 
        </div>
        <div className="row content info">
          
          <div className="ten columns offset-by-one">
            <h4>More on StakeTree</h4>
            <img className="avatar" alt="Niel's face" src="ava.jpg" />
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
            {noWeb3}
            <div className="cta-buttons">
              <button className="btn" onClick={this.fund.bind(this, 1)}>Stake 1 ether towards StakeTree</button><br />
              <button className="btn" onClick={this.fund.bind(this, 5)}>Stake 5 ether towards StakeTree</button><br />
              <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} />
              <button className="btn custom-value-button" onClick={this.fund.bind(this, customAmount)}>Stake {customAmount} ether</button>
      
            </div>
            <h4>Stay up-to-date</h4>
            <p>Sign up to the mailing list (or follow development on <a href="https://github.com/staketree" target="_blank" rel="noopener noreferrer">Github</a> & <a href="https://twitter.com/staketree" target="_blank" rel="noopener noreferrer">Twitter</a>)</p>
            <div id="mc_embed_signup">
            <form action="//staketree.us2.list-manage.com/subscribe/post?u=8cb1857d350191921500a6ac3&amp;id=86873ce044" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
                <div id="mc_embed_signup_scroll">
            <div className="mc-field-group">
              <input style={{"top": '-3px'}}type="email" placeholder="Email address" name="EMAIL" className="required email" id="mce-EMAIL" />
              <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="btn" />
            </div>
              <div id="mce-responses" className="clear">
                <div className="response" id="mce-error-response" style={{"display": 'none'}}></div>
                <div className="response" id="mce-success-response" style={{"display": 'none'}}></div>
              </div>
              <div className="mc-hidden-input" aria-hidden="true"><input type="text" name="b_8cb1857d350191921500a6ac3_86873ce044" tabIndex="-1" value="" /></div></div>
            </form>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default Home;