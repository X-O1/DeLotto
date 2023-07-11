// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract EnterLottery {
    address[] private s_listOfLotteryPlayers;
    mapping(address => uint256) private s_checkIfPlayerEntered;
    uint256 private currentLotteryBalance = address(this).balance;
    uint256 private LOTTERY_ENDING_THRESHOLD = 20 ether;
    uint256 private MINIMUM_DEPOSIT = 0.01 ether;
    uint256 private CURRENT_POOL_BALANCE_AFTER_USER_DEPOSIT =
        address(this).balance + msg.value;

    // How a player enters the Lottery
    function playerDeposit() public payable {
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
        s_listOfLotteryPlayers.push(msg.sender);
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

    // Getters
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
