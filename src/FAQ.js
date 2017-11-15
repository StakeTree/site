import React, { Component } from 'react';

// Styling
import './FAQ.css';

class FAQ extends Component {
  render() {
    return (
      <div className="faq container">
        <div className="row">
          <div className="eight columns offset-by-two">
            <h3>FAQ</h3>
            <div className="web3-info">To use StakeTree you need to have <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">Metamask</a> installed. Metamask makes it really easy to interface with the Ethereum blockchain, so it's highly recommended.</div>
            <h4>How can I set up my own contract?</h4>
            <p>This is in development right now! Stay tuned.</p>

            <h4>How do I fund a contract?</h4>
            <p>You can send ether directly to the contract address or use one of the buttons on the creator's page.</p>

            <h4>As a beneficiary, how can I withdraw from the contract?</h4>
            <p>Select your beneficiary account in Metamask and head over to your creator page, a button will appear in the sidebar allowing you to withdraw.</p>

            <h4>As a funder, how can I refund my stake?</h4>
            <p>Select your funding account in Metamask and head over to the creator's page, a button will appear in the sidebar allowing you to refund your stake.</p>

            <h4>How much can the beneficiary withdraw?</h4>
            <p>The beneficiary can only withdraw 10% from their pool each week.</p>

            <h4 id="tokenization">What happens when I add tokenization to my contract?</h4>
            <p>After each withdrawal, a staketree contract keeps track of how much each funder has contributed to the beneficiary. 
            When a staktree contract is tokenized, this contribution amount, which is already kept track of, can be claimed as tokens. 
            This allows the funders & beneficiary to use those tokens in any creative way possible. Tokenizing a contract cannot be reversed.</p>
            
            <h4>What are the token details?</h4>
            <p>When you add tokenization to your contract, you'll be asked to provide some details for your token. These can also not be changed once they're added.</p>
            <p>The token name can be anything you prefer, eg StakeTree Tokens. The symbol (up to five letters) is a shorthand for your token. For example Ethereum's symbol is ETH,
            and Bitcoin's symbol BTC. The token decimal amount is up to how many decimals you'd want for your tokens. 18 is the default. It's the same amount that ether uses as well.</p>
            
            <h4>I really like this project and have some ideas, how do I share this?</h4>
            <p>You can contact the founder, Niel, directly: nieldlr@gmail.com.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default FAQ;