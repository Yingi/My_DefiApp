const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {

  // Deploy Mock Dai Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed()

  //Deploy Dapp Token
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed()

  // transfer all tokens to TokenFarm, check the DappTokem.sol and you will see transfer function
  // (1 million token)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // transfer 100 Mock Dai to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')

};


/** 
 * // This is how to do a basic migration and deployment
 module.exports = function(deployer) {
  deployer.deploy(TokenFarm);
};
 */