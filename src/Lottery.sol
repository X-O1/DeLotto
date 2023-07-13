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

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUMBER_OF_WORDS = 1;
    uint256 private constant LOTTERY_ENDING_THRESHOLD = 20 ether;
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

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Lottery__NotOwner();
        _;
    }

    // ENTER THE LOTTERY
    function enterLottery() public payable {
        require(s_lotteryState == LotteryState.OPEN, "Lottery is not open.");
        require(
            checkIfUserAlreadyEnteredLottery() == false,
            "This address was already used. 1 entry per address."
        );
        require(msg.sender != i_owner, "Contract owner can not enter lottery.");
        require(msg.value >= MINIMUM_DEPOSIT, "Not enough Eth deposited!");

        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_players.push(payable(msg.sender));

        if (address(this).balance < LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.OPEN;
        } else if (address(this).balance >= LOTTERY_ENDING_THRESHOLD) {
            s_lotteryState = LotteryState.CALCULATING;
        }
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
    function getWinningIndex() public onlyOwner returns (uint256) {
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

    // WITHRAW FUNDS TO WINNINGS ADDRESS
    function sendWinningsAndResetLottery()
        public
        onlyOwner
        returns (address Winner)
    {
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
        return winner;
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
