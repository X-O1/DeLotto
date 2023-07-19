// SPDX-License-Identifier: MIT

// Contract Objectives:
// Collect all Eth deposited in the Lottery
// Choose random Winner
// Reset Lottery after the Winner is selected
// Withdraw all ether to the winning lottery address

pragma solidity ^0.8.18;

/** IMPORTS */
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Lottery is VRFConsumerBaseV2 {
    /* Custom Errors */
    error ChooseWinner_TransferFailed();
    error Lottery__NotOwner();
    error Deposit_Failed();
    error Lottery_State_Not_Determined();
    error Lottery_UpkeepNotNeeded(
        uint256 currentBalance,
        uint256 numPlayers,
        LotteryState lotteryState
    );

    /*Type declarations */
    enum LotteryState {
        OPEN, // 0
        CALCULATING // 1
    }

    /* State Variables */
    address private immutable i_owner;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;
    uint256 private immutable i_entryFee;

    // uint256 private constant LOTTERY_ENDING_THRESHOLD = 1 ether;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address payable[] private s_players;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    mapping(address => bool) private s_hasEntered;
    LotteryState private s_lotteryState;
    address private s_recentWinner;
    uint256 private s_lastTimeStamp;
    uint256 private s_numberOfLotteryRounds;

    /** Events */
    event NumOfLotteryRounds(uint256 indexed rounds);
    event EnteredLottery(address indexed player);
    event WinnerSelected(address indexed player, uint256 indexed amountWon);
    event RequestedLotteryWinner(uint256 indexed requestId);

    /** Contructor */
    constructor(
        uint256 entryFee,
        uint256 interval,
        address vrfCoordinator,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_owner = msg.sender;
        i_interval = interval;
        i_entryFee = entryFee;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_numberOfLotteryRounds = 0;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    // ENTER THE LOTTERY
    function enterLottery() public payable {
        require(s_lotteryState == LotteryState.OPEN, "Lottery is not open.");
        require(
            !s_hasEntered[msg.sender],
            "This address was already used. 1 entry per address."
        );
        require(msg.sender != i_owner, "Contract owner can not enter lottery.");
        require(msg.value >= i_entryFee, "Not enough Eth deposited!");

        s_checkIfPlayerEntered[msg.sender] += msg.value;
        s_players.push(payable(msg.sender));

        emit EnteredLottery(msg.sender);

        // if (address(this).balance < LOTTERY_ENDING_THRESHOLD) {
        //     s_lotteryState = LotteryState.OPEN;
        // } else if (address(this).balance >= LOTTERY_ENDING_THRESHOLD) {
        //     s_lotteryState = LotteryState.CALCULATING;
        // } else {
        //     revert Lottery_State_Not_Determined();
        // }
    }

    // UPKEEP
    function checkUpKeep(
        bytes memory
    ) public view returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool timeHasPassed = (s_lastTimeStamp - block.timestamp) >= i_interval;
        bool lotteryIsOpen = s_lotteryState == LotteryState.OPEN;
        bool playersHaveEntered = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timeHasPassed &&
            lotteryIsOpen &&
            playersHaveEntered &&
            hasBalance);
        return (upkeepNeeded, "0x0");
    }

    // CHOOSE WINNER
    function performUpKeep(bytes calldata /* performData */) external {
        (bool upkeepNeeded, ) = checkUpKeep("");
        if (!upkeepNeeded) {
            revert Lottery_UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                LotteryState(s_lotteryState)
            );
        }
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedLotteryWinner(requestId);
    }

    // WITHRAW FUNDS TO WINNING ADDRESS
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        require(s_players.length > 0, "No players have entered the Lottery.");
        require(address(this).balance > 0, "No funds in lottery.");

        // Grab winning address
        uint256 winningIndex = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[winningIndex];
        s_recentWinner = recentWinner;
        // Reset the Lottery
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0);

        s_numberOfLotteryRounds = s_numberOfLotteryRounds++;

        // Emit events
        emit WinnerSelected(recentWinner, address(this).balance);
        emit NumOfLotteryRounds(s_numberOfLotteryRounds);
        // Send winnings
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert ChooseWinner_TransferFailed();
        }
    }

    /** Getter Functions */
    // function getRoomLeftInPool() external view returns (uint256) {
    //     require(
    //         s_lotteryState == LotteryState.OPEN,
    //         "No room left lottery is closed."
    //     );

    //     uint256 roomLeftInLottery = LOTTERY_ENDING_THRESHOLD -
    //         address(this).balance;
    //     return roomLeftInLottery;
    // }

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

    // function getLotteryEndingThreshold() external pure returns (uint256) {
    //     return LOTTERY_ENDING_THRESHOLD;
    // }
}
