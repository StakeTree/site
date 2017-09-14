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
            <p>Hi everyone. <a href="https://twitter.com/nieldlr" target="_blank" rel="noopener noreferrer">Niel de la Rouviere</a> here. StakeTree is just starting out. I believe that to grow the crypto ecosystem
            (and hopefully much more in the future!) we need sustainable ways to fund projects & creators. ICOs are all the rage, but sometimes it just doesn't make
            sense for all that capital to be tied up, especially if your dapp doesn't need a token yet.</p>
            <p>Using smart contracts on Ethereum, creators & funders can back projects with no intermediaries, fees and instant settlement.</p>
            <p>There's lots more planned for StakeTree:</p>
            <ul>
              <li><strong>Creating a simple UI</strong> for funders & creators to fund & withdraw from the contracts.</li>
              <li><strong>Develop funding tiers</strong>. This is where creators can reward dedicated backers with special rewards/access. Think tiers like Kickstarter & Patreon.</li> 
              <li><strong>Fund contracts with any ERC-20 token.</strong></li>
              <li><strong>Tokenization for funders & creators</strong>. When the creator withdraws ether, it mints tokens for all parties. These tokens can then be used for many things: voting, curation, special access, discounts and more. The creativity of the creator is the limit here.</li>
              <li><strong>Create funding buckets</strong>. For example fund many Ethereum dev related projects using a single payment.</li>
            </ul>
            <p>I need your help to build StakeTree. In true dogfooding fashion, I'll be funding StakeTree using a staketree contract myself. The MVP is almost done. Signup to the mailing list to get updates (or follow development on <a href="https://github.com/staketree" target="_blank" rel="noopener noreferrer">Github</a> & <a href="https://twitter.com/staketree" target="_blank" rel="noopener noreferrer">Twitter</a>):</p>
          
            <div id="mc_embed_signup">
            <form action="//staketree.us2.list-manage.com/subscribe/post?u=8cb1857d350191921500a6ac3&amp;id=86873ce044" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" novalidate>
                <div id="mc_embed_signup_scroll">
            <div className="mc-field-group">
              <input type="email" placeholder="Email address" name="EMAIL" className="required email" id="mce-EMAIL" />
              <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="mc-button" />
            </div>
              <div id="mce-responses" className="clear">
                <div className="response" id="mce-error-response" style={{"display": 'none'}}></div>
                <div className="response" id="mce-success-response" style={{"display": 'none'}}></div>
              </div>
              <div className="mc-hidden-input" aria-hidden="true"><input type="text" name="b_8cb1857d350191921500a6ac3_86873ce044" tabindex="-1" value="" /></div></div>
            </form>
            </div>

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
