import StakeTreeWithTokenization from 'staketree-contracts/build/contracts/StakeTreeWithTokenization.json';
import StakeTreeMVP from 'staketree-contracts/build/contracts/StakeTreeMVP.json';
import TokenContract from 'staketree-contracts/build/contracts/MiniMeToken.json';

class ContractController {
  constructor() {
    this.contractABIs = {
      StakeTreeWithTokenization: StakeTreeWithTokenization.abi,
      StakeTreeMVP: StakeTreeMVP.abi,
      TokenContract: TokenContract.abi
    };

    this.contractInstances = {};
    this.subscriptions = {};
    this.accountChangeSubscription = '';

    window.addEventListener('load', ()=>{
      if(typeof window.web3 !== 'undefined') {

        // dirty hack for web3@1.0.0 support for localhost testrpc, 
        // see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
        if (typeof window.web3.currentProvider.sendAsync !== "function") {
          window.web3.currentProvider.sendAsync = function() {
            return window.web3.currentProvider.send.apply(
              window.web3.currentProvider,
                  arguments
            );
          };
        }
      }
    });
  }

  newInstance(params) {
    const contract = window.web3.eth.contract(this.contractABIs[params.which]);
    return contract.at(params.at);
  }

  subscribeToAccountChange(cb) {
    let currentAccount;
    const interval = setInterval(()=>{
      window.web3.eth.getAccounts((error, accounts)=>{
        if(!error) {
          if(accounts.length) { // Check for locked Metamask
            if(!currentAccount){
              currentAccount = accounts[0];
              cb(currentAccount);
            }

            if(currentAccount !== accounts[0]) {
              currentAccount = accounts[0];
              cb(currentAccount);
            }
          }
          else {
            cb("0x0000000000000000000000000000000000000000")
          }
        }
        
      })
    }, 1500);
    this.accountChangeSubscription = interval;
  }

  unsubscribeFromAccountChange() {
    clearInterval(this.accountChangeSubscription);
  }

  getContractDetails(params, cb) {
    let instance = params.instance;
    if(params['variables']) {
      for(var i=0; i<params['variables'].length; i++) {
        (function(count){
          let variable = params['variables'][count];
          instance[variable].call({}, (err, result) => {
            if(!err) {
              let callbacKey = variable;
              let callbackValue = result;
              if(typeof result.toNumber === 'function') callbackValue = result.toNumber();

              return cb(callbacKey, callbackValue);
            }
          });
        })(i)
      }
    }

    if(params['functions']) {
      for(var j=0; j<params['functions'].length; j++) {
        (function(count){
          let functionName = params['functions'][count].name;
          let functionArg = params['functions'][count].arg;
          instance[functionName].call(functionArg, (err, result) => {
            if(!err) {
              let callbacKey = functionName;
              let callbackValue = result;
              if(typeof result.toNumber === 'function') callbackValue = result.toNumber();
              return cb(callbacKey, callbackValue);
            }
          });
        })(j)
      }
    }
  }

  subscribeToContract(params, cb) {
    const interval = setInterval(async ()=> {
      let instance = params.instance;
      if(params['variables']) {
        for(var i=0; i<params['variables'].length; i++) {
          (function(count){
            let variable = params['variables'][count];
            instance[variable].call({}, (err, result) => {
              if(!err) {
                let callbacKey = variable;
                let callbackValue = result;
                if(typeof result.toNumber === 'function') callbackValue = result.toNumber();

                return cb(callbacKey, callbackValue);
              }
            });
          })(i)
        }
      }

      if(params['functions']) {
        for(var j=0; j<params['functions'].length; j++) {
          (function(count){
            let functionName = params['functions'][count].name;
            let functionArg = params['functions'][count].arg;
            instance[functionName].call(functionArg, (err, result) => {
              if(!err) {
                let callbacKey = functionName;
                let callbackValue = result;
                if(typeof result.toNumber === 'function') callbackValue = result.toNumber();
                return cb(callbacKey, callbackValue);
              }
            });
          })(j)
        }
      }
      
    }, 2000);

    this.subscriptions[params.id] = interval;
  }

  getCurrentAccount(cb) {
    window.web3.eth.getAccounts((error, accounts)=>{
      if(!error) {
        if(accounts.length > 0) {
          cb(accounts[0]);
        } // Check if Metamask isn't locked
        else {
          cb("0x0000000000000000000000000000000000000000");
        }
      }
      
    });
  }

  getWeb3() {
    return window.web3;
  }
}


export default new ContractController();