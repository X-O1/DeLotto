// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {EthPriceConverter} from "./EthPriceConverter.sol";

contract EnterLottery {
    EnterLottery enterLottery;
    using EthPriceConverter for uint256;

    address[] private s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 private currentLotteryBalance = address(this).balance;
    uint256 private TICKET_COST_MINIMUM = 20 * 10 ** 18;
    uint256 private LOTTERY_ENDING_THRESHOLD = 20 ether;
    uint256 public MAX_DEPOSIT = LOTTERY_ENDING_THRESHOLD;

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function playerDeposit() public payable {
        require(
            checkIfUserAlreadyEnteredLottery() == false,
            "This address was already used. 1 entry per address."
        );
        require(
            address(this).balance <= LOTTERY_ENDING_THRESHOLD,
            "Lottery is not active, threshold met."
        );
        require(
            msg.value.getConversionRate(s_priceFeed) >= TICKET_COST_MINIMUM,
            "Not enough Eth deposited!"
        );
        require(msg.value <= MAX_DEPOSIT, "Max deposit limit reached!");

        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_listOfLotteryPlayers.push(msg.sender);
    }

    function checkIfUserAlreadyEnteredLottery() private view returns (bool) {
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

    //GETTERS
    function getListOfLotteryPlayers(
        uint256 index
    ) external view returns (address) {
        return s_listOfLotteryPlayers[index];
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
