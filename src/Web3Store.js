import _ from 'lodash';

class Web3Store {
  constructor() {
    this.subFunctions = [];
    this.state = {
      transactions: {}
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listenerFunc) {
    this.subFunctions.push(listenerFunc);
  }

  pushCallbacks() {
    for(var i=0; i<this.subFunctions.length; i++) {
      this.subFunctions[i](this.getState());
    }
  }

  updateStateAndCallback(copy) {
    this.state = copy;
    this.pushCallbacks();
  }

  addTransaction(tx) {
    const copy = _.cloneDeep(this.state);
    copy.transactions[tx.hash] = tx;

    this.updateStateAndCallback(copy);
  }

  setTransactionAsMined(txHash){
    const copy = _.cloneDeep(this.state);
    copy.transactions[txHash].mined = true;

    this.updateStateAndCallback(copy);
  }
}

export default new Web3Store();