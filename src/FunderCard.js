import React, { Component } from 'react';

import RefundButton from './RefundButton.js';
import FundButton from './FundButton.js';
import ClaimTokensButton from './ClaimTokensButton.js';

import './FunderCard.css';

class FunderCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customAmount: 0.1,
      stakeMore: false
    }
  }
  toggleStakingOptions() {
    this.setState({stakeMore: !this.state.stakeMore});
  }
  handleCustomAmount(e) {
    let value = e.target.value;
    if(e.target.value === "") value = 0.1;
    this.setState({customAmount: value});
  }
  render() {
    const funderBalance = window.web3.fromWei(this.props.funder.balance, 'ether');
    const funderContribution = window.web3.fromWei(this.props.funder.contribution, 'ether');
    const funderClaimAmount = window.web3.fromWei(this.props.funder.contribution-this.props.funder.contributionClaimed, 'ether');
    
    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    // const minAmount = window.web3.fromWei(this.props.minAmount, 'ether');

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
            <button className="btn clean full-width" onClick={this.toggleStakingOptions.bind(this)}>Stake more</button>
            {this.state.stakeMore ? 
              <div className="stake-more-options">
                <input step="0.1" placeholder="Custom amount?" className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} /> 
                <FundButton toAddress={this.props.toAddress} amount={customAmount} minAmount={this.props.minAmount} >Stake {customAmount} Ether</FundButton>
              </div>
            : 
            ''}
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