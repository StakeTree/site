import _ from 'lodash';

class Web3Store {
  constructor() {
    this.subFunctions = [];
    this.funcIndex = {};
    this.state = {
      transactions: {}
    }
  }

  getState() {
    return this.state;
  }

  subscribe(id, listenerFunc) {
    if(typeof this.funcIndex[id] === 'undefined'){
      this.funcIndex[id] = listenerFunc;
    }
  }

  unsubscribe(id){
    delete this.funcIndex[id];
  }

  pushCallbacks() {
    const funcIds = Object.keys(this.funcIndex);
    for(var i=0; i<funcIds.length; i++) {
      const funcKey = funcIds[i];
      this.funcIndex[funcKey](this.getState());
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