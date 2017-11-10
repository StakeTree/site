import React, { Component } from 'react';

import WithdrawButton from './WithdrawButton.js';
import AddTokensButton from './AddTokensButton.js';
import SetMinAmountButton from './SetMinAmountButton.js';

import './ContractCard.css';

class BeneficiaryCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newMinAmount: this.props.minAmount,
      showMinAmountOptions: false
    };
  }
  handleCustomAmount(e) {
    let value = e.target.value;
    this.setState({newMinAmount: value});
  }
  toggleSetMinAmountOptions() {
    this.setState({showMinAmountOptions: !this.state.showMinAmountOptions});
  }
  render() {    
    return (
      <div className="contract-card">
        <div className="contract-card-actions">
          <h4>Hi there beneficiary,</h4>
          <ul>
            <li><strong>Total $ staked</strong>: ±${this.props.totalStakedDollar}</li>
            <li><strong>Total withdrawals</strong>: {this.props.withdrawalCounter}</li>
          </ul>
          <div className="secondary-actions">
            <WithdrawButton
              withdrawalDate={new Date(this.props.nextWithdrawal*1000)} 
              visible={true}
              contract={this.props.contract}>Withdraw</WithdrawButton>
            <hr />
            <button className="btn clean full-width min-amount-btn" onClick={this.toggleSetMinAmountOptions.bind(this)}>Update minimum funding amount</button>
            {this.state.showMinAmountOptions ? 
              <div className="more-options">
                <input step="0.1" value={this.state.newMinAmount} className="custom-value-input" type="number" onChange={this.handleCustomAmount.bind(this)} /> 
                <SetMinAmountButton 
                  visible={true}
                  newMinAmount={this.state.newMinAmount}
                  contract={this.props.contract}
                  >Set minimum funding amount</SetMinAmountButton>
              </div>
            : 
            ''}

            {!this.props.tokenized ? 
              <AddTokensButton
              visible={true}
              contract={this.props.contract}
              >Add Tokenization</AddTokensButton>
            : ''}
          </div>
        </div>
      </div>
    )
  }
};

export default BeneficiaryCard;