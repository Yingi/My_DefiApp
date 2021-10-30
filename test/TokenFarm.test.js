const { assert } = require('chai');
const _deploy_contracts = require('../migrations/2_deploy_contracts');

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(n){
   return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {

    //First you might be wondering where owner and investor came from
    // by default, 'accounts' is what is passed to the contract, and it is an array
    // accounts[0] represents the owners of the token account while account[1] represents the investors account
    // So rather than doing accounts[0] and accounts[1], we simply just create an array [owner, investor]

   //Write Tests here
   let daiToken, dappToken, tokenFarm

   // This before function runs first before anything
   before(async () => {
    // get an instance of DaiToken, DappToken, TokenFarm
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // transfer all dapp token token to token farm
    await dappToken.transfer(tokenFarm.address, tokens('1000000'))


    // send token to investor
    await daiToken.transfer(investor, tokens('100'), {from: owner})


   })

   describe('Mock Dai Deployment', async () => {
       it('has a name', async () => {
           
           // get the name
           const name = await daiToken.name()
           // assert that the name is equal to 'Mock Dai Token'
           assert.equal(name, 'Mock DAI Token')
       })
   })

   describe('Dapp Token Deployment', async () => {
    it('has a name', async () => {
        
        // get the name
        const name = await dappToken.name()
        // assert that the name is equal to 'DApp Token'
        assert.equal(name, 'DApp Token')
    })
   })

   describe('Token Farm Deployment', async () => {
    it('has a name', async () => {
        
        // get the name
        const name = await tokenFarm.name()
        // assert that the name is equal to 'token Farm'
        assert.equal(name, 'Dapp Token Farm')
    })
    it('contract has tokens', async () => {
        
        // get the balance
        let balance = await dappToken.balanceOf(tokenFarm.address)
        // assert that the balance is equal to 1 mill tokens
        assert.equal(balance.toString(), tokens('1000000'))
    })
    })

    describe('Farming Tokens', async () => {
        it('reward investors for staking mDai tokens', async() => {
            let result

            //Check investor Balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet balance correct before staking')
        
            //Stake Mock Dai Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            // Check Balance of Investor wallet after staking, this must result to zero, because they have staked their 100 Dai
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock Dai wallet balance correct after staking')

            //Check if Balance of Token Farm address has been credited with the 100 Dai
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock Dai wallet balance correct after staking')

            //Check if Investor staking balance now have 100 tokens
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Investor staking status correct after staking')
        
            // Issue Tokens
            await tokenFarm.issueTokens({from: owner})

            //Check balance after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Dapp Token wallet Balance correct after issuance')
        
            // Ensure only owner can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            // Unstake Tokens
            await tokenFarm.unstakeTokens({from: investor})

            //Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock Dai balance correct after unstaking')

            //Investor Token Farm Balance is now 0
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'Investor staking balance correct after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'Investor staking status correct after unstaking')
        })
    })

})
