// SPDX-License-Identifier: MIT

// Contract Objectives:
// Chooses a random winner using Chainlink VRF

// Chainlink Subscpition ID: 3579

pragma solidity ^0.8.18;

import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract ChooseWinner {
    // State Variables
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUMBER_OF_WORDS = 1;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;

    constructor(
        address vrfCoordinator,
        bytes23 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    // Choose random Lottery winner
    // function chooseWinner() private {
    //     uint256 requestId = i_vrfCoordinator.requestRandomWords(
    //         i_gasLane, // gas lane
    //         i_subscriptionId, // subscription id
    //         REQUEST_CONFIRMATIONS, // how many confirmation to consider random # good
    //         i_callbackGasLimit, // to make sure we dont overspend
    //         NUMBER_OF_WORDS // how many random numbers we get
    //     );
    // }

    // function fulfillRandomWords(
    //     uint256 requestId,
    //     uint256[] memory randomWords
    // ) internal override {}
}
