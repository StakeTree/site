const express = require('express');
const path = require('path');
const app = express();
const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const MVPContractABI = require('./abi/StakeTreeMVP.json');

const isLocal = process.env.PORT ? false : true;
let web3;
if(isLocal){
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
else {
  web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
}


if(isLocal){

  // Allow CORS for testing locally
  app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
}

app.use(express.static(path.join(__dirname, 'build')));

app.get('/contract/:address', async (req, res, next) => {
  const contract = TruffleContract(MVPContractABI);
  contract.setProvider(web3.currentProvider);

  // dirty hack for web3@1.0.0 support for localhost testrpc, 
  // see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
  if (typeof contract.currentProvider.sendAsync !== "function") {
    contract.currentProvider.sendAsync = function() {
      return contract.currentProvider.send.apply(
        contract.currentProvider,
            arguments
      );
    };
  }

  // TODO: Validate address

  const instance = await contract.at(req.params.address);
  const balance = await instance.getContractBalance.call();
  const totalContributors = await instance.getCurrentTotalFunders.call();
  const contractStartTime = await instance.contractStartTime.call();
  const nextWithdrawal = await instance.nextWithdrawal.call();
  const withdrawalPeriod = await instance.withdrawalPeriod.call();

  const live = await instance.live.call();
  const sunsetPeriod = await instance.sunsetWithdrawalPeriod.call();

  res.json({
    "balance": balance,
    "totalContributors": totalContributors,
    "contractStartTime": contractStartTime,
    "nextWithdrawal": nextWithdrawal,
    "withdrawalPeriod": withdrawalPeriod,
    "live": live,
    "sunsetPeriod": sunsetPeriod
  });
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const port = process.env.PORT || 3000;

app.listen(port);