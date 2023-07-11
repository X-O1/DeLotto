// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {Lottery} from "../src/Lottery.sol";

contract DeployLottery is Script {
    function run() external returns (Lottery) {
        vm.startBroadcast();
        Lottery lottery = new Lottery();
        vm.stopBroadcast();
        return lottery;
    }
}
