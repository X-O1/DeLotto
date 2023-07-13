// SPDX-License-Identifier: MIT

// Contract Objectives:
// Tests all functionality for the contract: EnterLottery.sol

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Lottery} from "../../src/Lottery.sol";
import {DeployLottery} from "../../script/DeployLottery.s.sol";

contract LotteryTest is Test {
    Lottery lottery;

    address USER = makeAddr("user");
    address USER2 = makeAddr("user2");
    uint256 private constant STARTING_BALANCE = 25 ether;
    uint256 private constant SEND_VALUE = 5 ether;

    function setUp() external {
        DeployLottery deployLottery = new DeployLottery();
        lottery = deployLottery.run();
        vm.deal(USER, STARTING_BALANCE);
        vm.deal(USER2, STARTING_BALANCE);
    }

    modifier funded() {
        vm.prank(USER);
        lottery.enterLottery{value: SEND_VALUE}();
        _;
    }

    function testUserCanOnlyEnterOncePerAddress() public funded {
        vm.expectRevert();
        vm.prank(USER);
        lottery.enterLottery{value: SEND_VALUE}();
    }

    function testIfUserCanDepositAfterLotteryEnds() public {
        // uint256 lotteryEndingThreshold = lottery.getLotteryEndingThreshold();

        vm.prank(USER);
        lottery.enterLottery{value: 19 ether}();
        // vm.expectRevert();
        vm.prank(USER2);
        lottery.enterLottery{value: 0.99999 ether}();
    }

    function testMinimumDeposit() public {
        vm.prank(USER2);
        vm.expectRevert();
        lottery.enterLottery{value: 0.001 ether}();
    }

    function testMaxDeposit() public funded {
        uint256 lotteryEndingThreshold = lottery.getLotteryEndingThreshold();

        vm.prank(USER2);
        vm.expectRevert();
        lottery.enterLottery{value: lotteryEndingThreshold}();
    }

    function testIfDataStrutureUpdates() public funded {
        uint256 checkIfPlayerEntered = lottery.getCheckIfPlayerEntered(USER);
        assertEq(checkIfPlayerEntered, SEND_VALUE);
    }
}
