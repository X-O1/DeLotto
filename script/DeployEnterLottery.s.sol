// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {EnterLottery} from "../src/EnterLottery.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployEnterLottery is Script {
    function run() external returns (EnterLottery) {
        HelperConfig helperConfig = new HelperConfig();
        address ethUsdPriceFeed = helperConfig.activeNetworkConfig();

        vm.startBroadcast();
        EnterLottery enterLottery = new EnterLottery(ethUsdPriceFeed);
        vm.stopBroadcast();
        return enterLottery;
    }
}
