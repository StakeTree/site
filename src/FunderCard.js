import React, { Component } from 'react';

import RefundButton from './RefundButton.js';
import ClaimTokensButton from './ClaimTokensButton.js';

class FunderCard extends Component {
  render() {
    const funderBalance = window.web3.fromWei(this.props.funder.balance, 'ether');
    const funderContribution = window.web3.fromWei(this.props.funder.contribution, 'ether');
    const funderClaimAmount = window.web3.fromWei(this.props.funder.contribution-this.props.funder.contributionClaimed, 'ether');
    
    return (
      <div className="contract-card">
        <div className="contract-card-actions">
          <h4>Hi there funder,</h4>
          <ul>
            <li>Currently staked: {funderBalance} ether.</li>
            <li>Total contributed: {funderContribution} ether.</li>
            {this.props.tokenized ? <li>You can claim {funderClaimAmount} tokens.</li> : '' }
          </ul>
          <div className="secondary-actions">
            <ClaimTokensButton
              claimAmount={funderClaimAmount} 
              visible={this.props.tokenized}
              contract={this.props.contract}>Claim Tokens</ClaimTokensButton>
            <RefundButton 
              visible={true} 
              contract={this.props.contract}>Refund</RefundButton>
          </div>
        </div>
      </div>
    )
  }
};

export default FunderCard;