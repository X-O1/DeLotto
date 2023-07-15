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
    error Lottery__NotOwner();

    /*Type declarations */
    enum LotteryState {
        OPEN, // 0
        CALCULATING // 1
    }

    /* State Variables */
    address private immutable i_owner;
    uint256 private constant LOTTERY_ENDING_THRESHOLD = 1 ether;
    uint256 private constant MINIMUM_DEPOSIT = 0.01 ether;
    address payable[] private s_players;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 private s_lotteryBalanceAfterUserDeposit =
        address(this).balance + msg.value;
    LotteryState private s_lotteryState;

    constructor() {
        s_lotteryState = LotteryState.OPEN;
        i_owner = msg.sender;
    }

    // ENTER THE LOTTERY
    function enterLottery() public payable {
        require(s_lotteryState == LotteryState.OPEN, "Lottery is not open.");
        for (uint256 i = 0; i < s_players.length; i++) {
            require(
                msg.sender != s_players[i],
                "This address was already used. 1 entry per address."
            );
        }
        require(msg.sender != i_owner, "Contract owner can not enter lottery.");
        require(msg.value >= MINIMUM_DEPOSIT, "Not enough Eth deposited!");
        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_players.push(payable(msg.sender));

        if (address(this).balance < LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.OPEN;
        } else if (address(this).balance >= LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.CALCULATING;
            sendWinningsAndResetLottery();
        }
    }

    // CHOOSE WINNER
    function getWinningIndex() internal returns (uint256) {
        require(
            address(this).balance >= LOTTERY_ENDING_THRESHOLD,
            "Lottery is still running, threshold hasn't been met."
        );
        s_lotteryState = LotteryState.CALCULATING;

        uint256 winningIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % s_players.length;

        return winningIndex;
    }

    // WITHRAW FUNDS TO WINNING ADDRESS
    function sendWinningsAndResetLottery() private {
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
    function getRoomLeftInPool() external view returns (uint256) {
        require(
            s_lotteryState == LotteryState.OPEN,
            "No room left lottery is closed."
        );

        uint256 roomLeftInLottery = LOTTERY_ENDING_THRESHOLD -
            address(this).balance;
        return roomLeftInLottery;
    }

    function getListOfPlayers()
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

    function checkIfPlayerEntered(
        address fundingAddress
    ) external view returns (uint256) {
        return s_checkIfPlayerEntered[fundingAddress];
    }

    function getLotteryEndingThreshold() external pure returns (uint256) {
        return LOTTERY_ENDING_THRESHOLD;
    }
}
