// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {EnterLottery} from "../../src/EnterLottery.sol";
import {DeployEnterLottery} from "../../script/DeployEnterLottery.s.sol";

contract EnterLotteryTest is Test {
    EnterLottery enterLottery;

    address USER = makeAddr("user");
    address USER2 = makeAddr("user2");
    address USER3 = makeAddr("user3");
    address USER4 = makeAddr("user4");
    address USER5 = makeAddr("user5");
    uint256 constant STARTING_BALANCE = 25 ether;
    uint256 constant SEND_VALUE = 5 ether;

    function setUp() external {
        DeployEnterLottery deployEnterLottery = new DeployEnterLottery();
        enterLottery = deployEnterLottery.run();
        vm.deal(USER, STARTING_BALANCE);
        vm.deal(USER2, STARTING_BALANCE);
        vm.deal(USER3, STARTING_BALANCE);
        vm.deal(USER4, STARTING_BALANCE);
        vm.deal(USER5, STARTING_BALANCE);
    }

    modifier funded() {
        vm.prank(USER);
        enterLottery.playerDeposit{value: SEND_VALUE}();
        vm.prank(USER2);
        enterLottery.playerDeposit{value: SEND_VALUE}();
        vm.prank(USER3);
        enterLottery.playerDeposit{value: SEND_VALUE}();
        // vm.prank(USER4);
        // enterLottery.playerDeposit{value: SEND_VALUE}();
        // vm.prank(USER5);
        // enterLottery.playerDeposit{value: SEND_VALUE}();
        _;
    }

    function testLotteryEndingThreshold() public funded {
        uint256 currentLotteryBalance = address(enterLottery).balance;
        assert(
            currentLotteryBalance <= enterLottery.getLotteryEndingThreshold()
        );
    }

    function testIsLotteryIsActive() public {
        assertEq(enterLottery.getIsLotteryActive(), true);
    }

    // function testPlayerDeposit() public funded {
    //     uint256 currentLotteryBalance = address(enterLottery).balance;
    //     assertEq(currentLotteryBalance, SEND_VALUE);
    // }
}
