// SPDX-License-Identifier: MIT

// Contract Objectives:
// Collects: all Eth deposited in the Lottery
// Withdraws: all ether to the winning lottery address
// Resets: the Lottery after winnings are withdrawn

pragma solidity ^0.8.18;

import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error NotOwner();

contract Lottery {
    // State Variables

    // address private immutable i_owner;

    address payable[] public s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 private LOTTERY_ENDING_THRESHOLD = 20 ether;
    uint256 private MINIMUM_DEPOSIT = 0.01 ether;
    uint256 private CURRENT_POOL_BALANCE_AFTER_USER_DEPOSIT =
        address(this).balance + msg.value;

    // Contructors
    // constructor() {
    //     i_owner = msg.sender;
    // }

    //Modifiers
    // modifier onlyOwner() {
    //     if (msg.sender != i_owner) revert NotOwner();
    //     _;
    // }
    modifier onlyWinner() {
        _;
    }

    // How a player enters the Lottery
    function enterLottery() public payable {
        require(
            checkIfUserAlreadyEnteredLottery() == false,
            "This address was already used. 1 entry per address."
        );
        require(
            address(this).balance <= LOTTERY_ENDING_THRESHOLD,
            "Lottery is not active, threshold met."
        );
        require(msg.value >= MINIMUM_DEPOSIT, "Not enough Eth deposited!");
        require(
            CURRENT_POOL_BALANCE_AFTER_USER_DEPOSIT <= LOTTERY_ENDING_THRESHOLD,
            "Max deposit limit reached!"
        );

        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_listOfLotteryPlayers.push(payable(msg.sender));
    }

    // Check if address has already entered the Lottery
    function checkIfUserAlreadyEnteredLottery() internal view returns (bool) {
        bool hasUserEntered;
        for (uint256 i = 0; i < s_listOfLotteryPlayers.length; i++) {
            if (msg.sender == s_listOfLotteryPlayers[i]) {
                hasUserEntered = true;
            } else {
                hasUserEntered = false;
            }
        }
        return hasUserEntered;
    }

    //  Withdraw winnings to Lottery winning address
    function withdrawToWinningAddress() public payable onlyWinner {}

    // Resets the Lottery. Call in withdraw function
    function resetLottery() private {}

    // Getters
    function getListOfLotteryPlayers()
        external
        view
        returns (address payable[] memory)
    {
        address payable[] memory listOfPlayers = new address payable[](
            s_listOfLotteryPlayers.length
        );

        for (uint256 i = 0; i < s_listOfLotteryPlayers.length; i++) {
            listOfPlayers[i] = s_listOfLotteryPlayers[i];
        }
        return (listOfPlayers);
    }

    function getCheckIfPlayerEntered(
        address fundingAddress
    ) external view returns (uint256) {
        return s_checkIfPlayerEntered[fundingAddress];
    }

    function getLotteryEndingThreshold() external view returns (uint256) {
        return LOTTERY_ENDING_THRESHOLD;
    }
}
