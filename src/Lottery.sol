// SPDX-License-Identifier: MIT

// Contract Objectives:
// Collect all Eth deposited in the Lottery
// Choose random Winner
// Reset Lottery after the Winner is selected
// Withdraw all ether to the winning lottery address

pragma solidity ^0.8.18;

contract Lottery {
    /* Custom Errors */
    error ChooseWinner_TransferFailed();

    /*Type declarations */
    enum LotteryState {
        OPEN, // 0
        CALCULATING // 1
    }

    /* State Variables */
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUMBER_OF_WORDS = 1;
    uint256 private constant LOTTERY_ENDING_THRESHOLD = 20 ether;
    uint256 private constant MINIMUM_DEPOSIT = 0.01 ether;

    address payable[] private s_players;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 private s_lotteryBalanceAfterUserDeposit =
        address(this).balance + msg.value;

    LotteryState public s_lotteryState;

    constructor() {
        s_lotteryState = LotteryState.OPEN;
    }

    // ENTER THE LOTTERY
    function enterLottery() public payable {
        require(s_lotteryState == LotteryState.OPEN, "Lottery is not open.");
        require(
            checkIfUserAlreadyEnteredLottery() == false,
            "This address was already used. 1 entry per address."
        );
        require(msg.value >= MINIMUM_DEPOSIT, "Not enough Eth deposited!");

        if (address(this).balance < LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.OPEN;
        } else if (address(this).balance >= LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.CALCULATING;
        }

        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_players.push(payable(msg.sender));
    }

    // Check if address has already entered the Lottery
    function checkIfUserAlreadyEnteredLottery() internal view returns (bool) {
        bool hasUserEntered;
        for (uint256 i = 0; i < s_players.length; i++) {
            if (msg.sender == s_players[i]) {
                hasUserEntered = true;
            } else {
                hasUserEntered = false;
            }
        }
        return hasUserEntered;
    }

    // CHOOSE WINNER
    function getWinningIndex() public returns (uint256) {
        require(
            address(this).balance == LOTTERY_ENDING_THRESHOLD,
            "Lottery is still running, threshold hasn't been met."
        );
        s_lotteryState = LotteryState.CALCULATING;

        uint256 winningIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % s_players.length;

        return winningIndex;
    }

    // WITHRAW FUNDS TO WINNINGS ADDRESS
    function sendWinningsAndResetLottery() public {
        require(
            s_lotteryState == LotteryState.CALCULATING,
            "LOTTERY STILL RUNNING"
        );
        // Grab winning address
        uint256 winningIndex = Lottery.getWinningIndex();
        address payable winner = s_players[winningIndex];

        // Reset the Lottery
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0);

        // Send winnings
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert ChooseWinner_TransferFailed();
        }
    }

    /** Getter Functions */
    function getListOfLotteryPlayers()
        external
        view
        returns (address payable[] memory)
    {
        address payable[] memory listOfPlayers = new address payable[](
            s_players.length
        );

        for (uint256 i = 0; i < s_players.length; i++) {
            listOfPlayers[i] = s_players[i];
        }
        return (listOfPlayers);
    }

    function getCheckIfPlayerEntered(
        address fundingAddress
    ) external view returns (uint256) {
        return s_checkIfPlayerEntered[fundingAddress];
    }

    function getLotteryEndingThreshold() external pure returns (uint256) {
        return LOTTERY_ENDING_THRESHOLD;
    }
}
