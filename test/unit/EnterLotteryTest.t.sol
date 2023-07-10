// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {EnterLottery} from "../../src/EnterLottery.sol";
import {DeployEnterLottery} from "../../script/DeployEnterLottery.s.sol";

contract EnterLotteryTest is Test {
    EnterLottery enterLottery;

    address USER = makeAddr("user");
    address USER2 = makeAddr("user2");
    uint256 private constant STARTING_BALANCE = 25 ether;
    uint256 private constant SEND_VALUE = 5 ether;

    function setUp() external {
        DeployEnterLottery deployEnterLottery = new DeployEnterLottery();
        enterLottery = deployEnterLottery.run();
        vm.deal(USER, STARTING_BALANCE);
        vm.deal(USER2, STARTING_BALANCE);
    }

    modifier funded() {
        vm.prank(USER);
        enterLottery.playerDeposit{value: SEND_VALUE}();
        _;
    }

    function testIfAddressHasAlreadyEnteredLottery() public funded {
        vm.expectRevert();
        vm.prank(USER);
        enterLottery.playerDeposit{value: SEND_VALUE}();
    }

    function testIfUserCanDepositAfterLotteryEnds() public {
        uint256 lotteryEndingThreshold = enterLottery
            .getLotteryEndingThreshold();

        vm.prank(USER);
        enterLottery.playerDeposit{value: lotteryEndingThreshold}();
        vm.prank(USER2);
        vm.expectRevert();
        enterLottery.playerDeposit{value: SEND_VALUE}();
    }
}
