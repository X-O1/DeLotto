// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {EthPriceConverter} from "./EthPriceConverter.sol";

contract EnterLottery {
    using EthPriceConverter for uint256;

    address private s_player;
    address[] private s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    address private lotteryEthPool;
    uint256 private TICKET_COST_MINIMUM = 20e18;
    AggregatorV3Interface private s_priceFeed;

    function deposit() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= TICKET_COST_MINIMUM,
            "Not enough Eth deposited!"
        );
        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_listOfLotteryPlayers.push(msg.sender);
    }
}
