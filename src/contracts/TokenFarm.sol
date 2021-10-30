pragma solidity >=0.4.22 <0.9.0;

import './DappToken.sol';
import './DaiToken.sol';


contract TokenFarm {
    // all codes come in here
    address public owner;
    string public name = "Dapp Token Farm";

    DappToken public dappToken;
    DaiToken public daiToken;

    // array of all the address of people who have staked
    address[] public stakers;

    // the below code is how to create a dictionary-like object in solidity
    mapping(address => uint) public stakingBalance;

    //create another map telling that the user has staked
    mapping(address => bool) public hasStaked;

    // Is staking
    mapping(address => bool) public isStaking;

    // The constructor runs once when this is migrated to the blockchain
    // This smart contract needs reference to DappToken and DaiToken
    // the arguments in the constructor _dappToken and _daiToken is the address of the Dai and Dap smartcontract migrated

    constructor(DappToken _dappToken, DaiToken _daiToken) public {

        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;

    }

    //1. Stake Tokens (Deposit)
    function stakeTokens(uint _amount) public{
        /**
        this function is the piece of code that allows the investor
        to stake/transfer their DAI Token in this TokenFarm contract so as to earn
        Dapp tokens
         */

         //Require amount that the investor is staking is greater than zero
        require(_amount > 0, 'amount cannot be 0');

        daiToken.transferFrom(msg.sender, address(this), _amount);

        //update stakingBalance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Add users to stakers array only if they havent staked already
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }


    //2. Issueing Dapp Tokens to Investors who staked their Dai Tokens
    function issueTokens() public {

        require(msg.sender == owner, 'caller of this function must be the owner');
        // We loop through the stakers array and award dapp tokens to all of them
        for (uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];

            // check the amount of dai tokens each recipient staked
            uint balance = stakingBalance[recipient];

            /**
            So below we transfer dapp tokens to the investor based on how
            many dai tokens he staked, so if he staked 100 dai, we transfer
            100 dapp to the investor. This is the reason we are using thesame
            balance variable as arguments in the dappToken.transfer. If for every
            100 dai token staked we are to give investor 200 dapp tokens, then we
            should have transfered balance 2x of dapp tokens is dappToken.transfer(recipient, 200)

            And we also want to be able to transfer dapp to investor only
            if they still have their dai tokens in the Token Farm, we dont want to give them
            dapp Tokens when they have withdrawn/unstake their dai tokens. Hence if(balance > 0)
             */
            
            if (balance > 0){
                dappToken.transfer(recipient, balance);
            }
            
        }
    }

    //3. Unstaking Tokens (Withdraw)

    function unstakeTokens() public {
        // Fetch Staking Balance
        uint balance = stakingBalance[msg.sender];

        //Require amount is greater than zero
        require(balance > 0, 'staking balance cannot be 0');

        //Transfer Mock Dai to the investor
        daiToken.transfer(msg.sender, balance);

        //Reset Staking Balance of Investor to 0
        stakingBalance[msg.sender] = 0;

        //Update Staking status
        isStaking[msg.sender] = false;

    }


}