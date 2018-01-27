import React, { Component } from 'react';

import RefundButton from './RefundButton.js';
import FundButton from './FundButton.js';
import ClaimTokensButton from './ClaimTokensButton.js';

import './ContractCard.css';

import Web3Controller from './Web3Controller.js';
import web3store from './Web3Store.js';

class FunderCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customAmount: 0.1,
      stakeMore: false,
      funder: {
        balance: 0,
        contribution: 0,
        contributionClaimed: 0
      },
      tokens: {
        balance: 0,
        symbol: '',
        decimals: 18
      }
    }
  }

  componentWillMount() {
    this.getContractDetails();
    web3store.subscribe('funder-card', (newState)=>{
      setTimeout(()=>{this.getContractDetails()}, 5000);
    });
  }
  componentWillUnmount() {
    web3store.unsubscribe('funder-card');
  }

  getContractDetails() {
    Web3Controller.getContractDetails({
      id: 'funder-card-details',
      instance: this.props.contract,
      variables: ['version', 'minorVersion'],
      functions: [
        {name: 'getFunderBalance', arg: this.props.currentAccount},
        {name: 'getFunderContribution', arg: this.props.currentAccount},
        {name: 'getFunderContributionClaimed', arg: this.props.currentAccount}
      ]
    }, (key, value) => {
      switch(key) {
        case 'getFunderBalance':
          key = 'balance';
          break;
        case 'getFunderContribution':
          key = 'contribution';
          break;
        case 'getFunderContributionClaimed':
          key = 'contributionClaimed';
          break;
        default:
          break;
      }
      const newFunderState = {...this.state.funder};
      newFunderState[key] = value;
      this.setState({
        ...this.state,
        funder: newFunderState
      });
    });

    if(this.props.tokenized && this.props.tokenContract !== "0x0000000000000000000000000000000000000000") {
      const instance = Web3Controller.newInstance({
        which: "TokenContract", 
        at: this.props.tokenContract
      });

      Web3Controller.getContractDetails({
        id: 'tokens',
        instance: instance,
        variables: [
          'decimals', 'symbol'
        ],
        functions: [
          { name: 'balanceOf', arg: this.props.currentAccount }
        ]
      }, (key, value) => {
        const newTokens = {...this.state.tokens};
        if(key ==='balanceOf') key = 'balance';
        newTokens[key] = value;
        this.setState({
          ...this.state,
          tokens: newTokens
        });
      });
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
    const funderBalance = window.web3.fromWei(this.state.funder.balance, 'ether');
    const funderContribution = window.web3.fromWei(this.state.funder.contribution, 'ether');
    const funderClaimAmount = window.web3.fromWei(this.state.funder.contribution-this.state.funder.contributionClaimed, 'ether');
    const tokenClaimAmount = this.state.funder.minorVersion === 1 ? funderClaimAmount*1000 : funderClaimAmount;

    const customAmount = this.state.customAmount > 0 ? this.state.customAmount : 0.1;

    // const minAmount = window.web3.fromWei(this.props.minAmount, 'ether');

    return (
      <div className="contract-card">
        <div className="contract-card-actions">
          <h4>Hi there funder,</h4>
          <ul>
            <li>Currently staked: {funderBalance} ether.</li>
            <li>Total contributed: {funderContribution} ether.</li>
            {this.props.tokenized ? <li>Current token balance: {this.state.tokens.balance/Math.pow(10, this.state.tokens.decimals)} {this.state.tokens.symbol} tokens.</li> : ''}
            {this.props.tokenized ? <li>You can claim {tokenClaimAmount} tokens.</li> : '' }
          </ul>
          <div className="secondary-actions">
            <button className="btn clean full-width" onClick={this.toggleStakingOptions.bind(this)}>Stake more</button>
            {this.state.stakeMore ? 
              <div className="more-options">
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