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

            <h4>I really like this project and have some ideas, how do I share this?</h4>
            <p>You can contact the founder, Niel, directly: nieldlr@gmail.com.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default FAQ;