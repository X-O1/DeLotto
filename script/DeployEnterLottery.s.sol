// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {EnterLottery} from "../src/EnterLottery.sol";

contract DeployEnterLottery is Script {
    function run() external returns (EnterLottery) {
        vm.startBroadcast();
        EnterLottery enterLottery = new EnterLottery();
        vm.stopBroadcast();
        return enterLottery;
    }
}
