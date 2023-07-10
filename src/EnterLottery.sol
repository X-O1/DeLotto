// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {EthPriceConverter} from "./EthPriceConverter.sol";

contract EnterLottery {
    using EthPriceConverter for uint256;

    address private s_player;
    address[] private s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 public currentLotteryBalance = address(this).balance;
    uint256 private TICKET_COST_MINIMUM = 20 * 10 ** 18;
    uint256 public LOTTERY_ENDING_THRESHOLD = 20 ether;
    AggregatorV3Interface private s_priceFeed;
    bool public isLotteryActive;

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function playerDeposit() public payable {
        if (currentLotteryBalance < LOTTERY_ENDING_THRESHOLD) {
            isLotteryActive = true;
        } else if (currentLotteryBalance >= LOTTERY_ENDING_THRESHOLD) {
            isLotteryActive = false;
        }
        // for (uint256 i = 0; i < s_listOfLotteryPlayers.length; i++) {
        require(
            isLotteryActive == true,
            "Lottery is not active, threshold met."
        );
        // require(
        //     s_player != s_listOfLotteryPlayers[i],
        //     "This address was already used. 1 entry per address."
        // );
        require(
            msg.value.getConversionRate(s_priceFeed) >= TICKET_COST_MINIMUM,
            "Not enough Eth deposited!"
        );
        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_listOfLotteryPlayers.push(msg.sender);
        // }
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

    function getIsLotteryActive() external view returns (bool) {
        return isLotteryActive;
    }
}
