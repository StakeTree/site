import React, { Component } from 'react';
import './normalize.css';
import './skeleton.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="container">
        <div className="row header">
          <div className="four columns offset-by-four logo">
            <h1 className="tree-logo"><span role='img'>🌲</span></h1>
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
              <p>Creators can withdraw 10% every two weeks from the staked pool.</p>
            </div>
          </div> 
          <div className="four columns">
            <div className="featurette">
              <h4>Get your stake back at any time</h4>
              <p>Funders can withdraw their funding at any time.</p>
            </div>
          </div> 
        </div>
        <div className="row content info">
          <div className="nine columns">
            <h4>More on StakeTree</h4>
            <p>Hi everyone. <a href="https://twitter.com/nieldlr" target="_blank">Niel de la Rouviere</a> here. StakeTree is just starting out. I believe that to grow the crypto ecosystem
            (and hopefully much more in the future!) we need better ways to fund projects & creators. ICOs are all the rage, but sometimes it just doesn't make
            sense for all that capital to be tied up, especially if your dapp doesn't need a token yet.</p>
            <p>Using smart contracts on Ethereum, creators & funders can back projects with no intermediaries, fees and instant settlement.</p>
            <p>There's lots more planned for StakeTree:
              <ul>
                <li><strong>Creating a simple UI</strong> for funders & creators to fund & withdraw from the contracts.</li>
                <li><strong>Develop funding tiers</strong>. This is where creators can reward dedicated backers with special rewards/access. Think tiers like Kickstarter & Patreon.</li> 
                <li><strong>Fund contracts with any ERC-20 token.</strong></li>
                <li><strong>Tokenization for funders</strong>. When the creator withdraws ether, it mints tokens for the current stakers. These tokens can then be used for many things: voting, curation, special access, discounts and more. The creativity of the creator is the limit here.</li>
                <li><strong>Create funding buckets</strong>. For example fund many Ethereum dev related projects using a single payment.</li>
              </ul>
            </p>
            <p>I need your help to build StakeTree. In true dogfooding fashion, I'll be funding StakeTree using a staketree contract myself. The MVP is almost done. Signup to the mailing list to get updates (or follow development on <a href="https://github.com/staketree">Github</a>):</p>
          </div>
          <div className="three columns avatar">
            <img src="ava.jpg" />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
