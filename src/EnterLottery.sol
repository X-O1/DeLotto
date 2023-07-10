// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {EthPriceConverter} from "./EthPriceConverter.sol";

contract EnterLottery {
    using EthPriceConverter for uint256;

    address[] private s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 public currentLotteryBalance = address(this).balance;
    uint256 private TICKET_COST_MINIMUM = 20 * 10 ** 18;
    uint256 public LOTTERY_ENDING_THRESHOLD = 20 ether;
    uint256 private MAX_DEPOSIT = LOTTERY_ENDING_THRESHOLD;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function playerDeposit() public payable {
        require(
            address(this).balance <= LOTTERY_ENDING_THRESHOLD,
            "Lottery is not active, threshold met."
        );
        for (uint256 i = 0; i < s_listOfLotteryPlayers.length; i++) {
            require(
                msg.sender != s_listOfLotteryPlayers[i],
                "This address was already used. 1 entry per address."
            );
        }
        require(msg.value <= MAX_DEPOSIT, "Ether max deposit limit reached!");
        require(
            msg.value.getConversionRate(s_priceFeed) >= TICKET_COST_MINIMUM,
            "Not enough Eth deposited!"
        );
        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_listOfLotteryPlayers.push(msg.sender);
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
