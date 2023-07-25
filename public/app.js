/** IMPORTS  */
const { ethers, BigNumber } = require("ethers");

/** SOLIDITY CONTRACTS */
const LOTTERY_CONTRACT = {
  address: "0x889bA6E45495e5aebaa522D68248cfB3125E3386",
  abi: [
    {
      inputs: [
        {
          internalType: "uint64",
          name: "subscriptionId",
          type: "uint64",
        },
        {
          internalType: "bytes32",
          name: "gasLane",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "entryFee",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "callbackGasLimit",
          type: "uint32",
        },
        {
          internalType: "address",
          name: "vrfCoordinatorV2",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "ChooseWinner_TransferFailed",
      type: "error",
    },
    {
      inputs: [],
      name: "Deposit_Failed",
      type: "error",
    },
    {
      inputs: [],
      name: "Lottery__NotOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "have",
          type: "address",
        },
        {
          internalType: "address",
          name: "want",
          type: "address",
        },
      ],
      name: "OnlyCoordinatorCanFulfill",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "EnteredLottery",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "rounds",
          type: "uint256",
        },
      ],
      name: "NumOfLotteryRounds",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
      ],
      name: "RequestedLotteryWinner",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amountWon",
          type: "uint256",
        },
      ],
      name: "WinnerSelected",
      type: "event",
    },
    {
      inputs: [],
      name: "chooseWinner",
      outputs: [
        {
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "enterLottery",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getListOfPlayers",
      outputs: [
        {
          internalType: "address payable[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLotteryState",
      outputs: [
        {
          internalType: "enum Lottery.LotteryState",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "fundingAddress",
          type: "address",
        },
      ],
      name: "getPlayersEntryDeposit",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          internalType: "uint256[]",
          name: "randomWords",
          type: "uint256[]",
        },
      ],
      name: "rawFulfillRandomWords",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  entryFee: BigNumber.from("10000000000000000"),
};

/** FRONT-END ELEMENTS */
const walletConnectButton = document.querySelector(".wallet");
const lotteryBalance = document.querySelector(".lottery-balance");
const lotteryBalanceTitle = document.querySelector(".lottery-balance-title");
const enterLotteryButton = document.querySelector(".enter-lottery-button");
const recentWinnerContainer = document.querySelector(".recent-winner");
const toggleLog = document.querySelector(".toggle-log");
const closeLog = document.querySelector(".close-log");
const lotteryLog = document.querySelector(".lottery-log");
const amountWonContainer = document.querySelector(".amount-won");
const recentWinnerTitle = document.querySelector(".recent-winner-title");
const ruleList = document.querySelector(".rule-list");
const toggleRules = document.querySelector(".toggle-rules");
const closeRules = document.querySelector(".close-rules");
const mediaQuery = window.matchMedia("(min-width: 1200px)");

// THESE FUNCTIONS WILL RUN EVERYTIME THE SITE LOADS
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await updateLotteryBalance();
    await updateFrontEndOnLoad();
    await listenForWinnerBeingSelected();
  } catch (error) {
    console.log(error);
  }
});

// RETURNS LIST OF ALL PLAYERS THAT ENTERED THE CURRENT LOTTERY
const getListOfPlayers = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT.address,
      LOTTERY_CONTRACT.abi,
      provider
    );
    const listOfPlayers = await contract.getListOfPlayers();
    return listOfPlayers.map((player) => player.toLowerCase());
  } else {
    return [];
  }
};

// UPDATES FRONT-END ON PAGE RELOAD BASED ON CURRENT WALLET CONNECTED
const updateFrontEndOnLoad = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const playerAccounts = await getListOfPlayers();
      const connectedAddress = await signer.getAddress();
      const connectedAddressLowerCase = connectedAddress.toLowerCase();
      const accountEntered = await playerAccounts.includes(
        connectedAddressLowerCase
      );
      if (connectedAddress === undefined) {
        walletConnectButton.innerHTML = "Connect Wallet";
        enterLotteryButton.innerHTML = "Connect Wallet to enter!";
        mediaQuery.matches
          ? (enterLotteryButton.style.fontSize = "36px")
          : (enterLotteryButton.style.fontSize = "30px");
      } else if (accountEntered) {
        updateFrontEnd();
        walletConnectButton.innerHTML = "Connected";
      } else {
        enterLotteryButton.innerHTML = "Enter Lottery!";
        mediaQuery.matches
          ? (enterLotteryButton.style.fontSize = "46px")
          : (enterLotteryButton.style.fontSize = "42px");
        walletConnectButton.innerHTML = "Connected";
      }
    } catch (error) {
      error = console.log("ERROR: No wallet is Connected.");
    }
  } else {
    walletConnectButton.innerHTML = "Install Metamask to Connect";
    enterLotteryButton.innerHTML = "Install Metamask to Enter";
    lotteryBalance.innerHTML = "Connect to View";
    lotteryBalance.style.fontSize = "20px";
  }
};

// UPDATES FRONT-END ON WALLET CHANGE
const updateFrontEndWhenWalletChanges = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      ethereum.on("accountsChanged", async (newAccounts) => {
        const playerAccounts = await getListOfPlayers();
        const accountEntered = await playerAccounts.includes(newAccounts[0]);
        console.log("Accounts changed", newAccounts[0]);

        if (newAccounts[0] === undefined) {
          walletConnectButton.innerHTML = "Connect Wallet";
          enterLotteryButton.innerHTML = "Connect Wallet to enter!";
          mediaQuery.matches
            ? (enterLotteryButton.style.fontSize = "36px")
            : (enterLotteryButton.style.fontSize = "30px");
        } else if (accountEntered) {
          updateFrontEnd();
          await listenForWinnerBeingSelected();
        } else {
          enterLotteryButton.innerHTML = "Enter Lottery!";
          mediaQuery.matches
            ? (enterLotteryButton.style.fontSize = "46px")
            : (enterLotteryButton.style.fontSize = "42px");
          await listenForWinnerBeingSelected();
        }
        updateLotteryBalance();
      });
    } catch (error) {
      error = console.log("ERROR: No wallet is Connected.");
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};
updateFrontEndWhenWalletChanges();

// CONNECTS SITE TO A NODE (METAMASK)
const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      walletConnectButton.innerHTML = "Connected";
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please Install MetaMask";
  }
};

// ENTERS PLAYER INTO THE LOTTERY
const playerEnterLottery = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        LOTTERY_CONTRACT.address,
        LOTTERY_CONTRACT.abi,
        signer
      );
      const playerAccounts = await getListOfPlayers();
      const connectedAddress = await signer.getAddress();
      const connectedAddressLowerCase = connectedAddress.toLowerCase();
      const accountEntered = await playerAccounts.includes(
        connectedAddressLowerCase
      );
      if (!accountEntered) {
        enterLotteryButton.innerHTML = "ENTERING...";
      }

      const overrides = {
        value: LOTTERY_CONTRACT.entryFee,
      };
      const enterLotteryTransaction = await contract.enterLottery(overrides);
      await enterLotteryTransaction.wait();

      // Update front-end elements
      updateLotteryBalance();
      updateFrontEnd();

      // Waits for a winner to be selected and then displays winner on front-end
      await listenForWinnerBeingSelected();
      await listenForLotteryWinner();
    } catch (error) {
      error = console.log(
        "ERROR: Wallet not connected or this address has already entered the Lottery."
      );
      updateFrontEndOnLoad();
    }
  } else {
    walletConnectButton.innerHTML = "Please Install Metamask";
  }
};

/** EVENT LISTENERS */
// Find most recent lottery winner and display it on front-end
const listenForLotteryWinner = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT.address,
      LOTTERY_CONTRACT.abi,
      provider
    );
    try {
      contract.on("WinnerSelected", (player, amountWon) => {
        let recentWinner = {
          player,
          amountWon,
        };
        lotteryLog.style.opacity = "1";
        toggleLog.style.display = "none";
        closeLog.style.display = "flex";

        recentWinnerContainer.innerHTML = recentWinner.player;
        amountWonContainer.innerHTML = `Won: ${ethers.utils.formatEther(
          recentWinner.amountWon
        )} Ether!`;

        updateLotteryBalance();
        updateFrontEndOnLoad();
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please Install Metamask";
  }
};
const listenForWinnerBeingSelected = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT.address,
      LOTTERY_CONTRACT.abi,
      provider
    );
    contract.on("RequestedLotteryWinner", async () => {
      enterLotteryButton.innerHTML = "WINNER BEING SELECTED...";
      enterLotteryButton.style.fontSize = "36px";

      updateLotteryBalance();
    });
  } else {
    walletConnectButton.innerHTML = "Please Install Metamask";
  }
};

// Function to get the most recent winner on command
const getMostRecentWinner = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT.address,
      LOTTERY_CONTRACT.abi,
      provider
    );

    try {
      const eventFilter = contract.filters.WinnerSelected(null, null);
      const events = await contract.queryFilter(eventFilter);

      if (events.length > 0) {
        const mostRecentEvent = events[events.length - 1];
        const recentWinner = {
          player: mostRecentEvent.args.player,
          amountWon: mostRecentEvent.args.amountWon,
        };

        recentWinnerContainer.innerHTML = recentWinner.player;
        amountWonContainer.innerHTML = `Won: ${ethers.utils.formatEther(
          recentWinner.amountWon
        )} Ether!`;
      } else {
        recentWinnerContainer.innerHTML = "No recent winners.";
        amountWonContainer.innerHTML = "";
      }
    } catch (error) {
      console.log("Error while fetching the most recent winner:", error);
    }
  } else {
    walletConnectButton.innerHTML = "Please Install Metamask";
  }
};

// Toggle Rules Display
toggleRules.addEventListener("click", () => {
  ruleList.style.display = "block";
  closeRules.style.display = "flex";
  toggleRules.style.display = "none";
});
closeRules.addEventListener("click", () => {
  ruleList.style.display = "none";
  closeRules.style.display = "none";
  toggleRules.style.display = "flex";
});
// Lottery Log display
toggleLog.addEventListener("click", async () => {
  await getMostRecentWinner();
  lotteryLog.style.opacity = "1";
  toggleLog.style.display = "none";
  closeLog.style.display = "flex";
  typeof window.ethereum !== "undefined"
    ? (recentWinnerTitle.innerHTML = "Recent Winner")
    : (recentWinnerTitle.innerHTML = "Install Metamask to View");
});
closeLog.addEventListener("click", () => {
  lotteryLog.style.opacity = "0";
  closeLog.style.display = "none";
  toggleLog.style.display = "flex";
});

/** MISC */
const updateFrontEnd = async () => {
  enterLotteryButton.innerHTML = "Entered! Best of Luck!";
  enterLotteryButton.style.fontSize = "39px";
};

const updateLotteryBalance = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(LOTTERY_CONTRACT.address);
      lotteryBalanceTitle.innerHTML = `Lottery Prize`;
      lotteryBalance.innerHTML = `${ethers.utils.formatEther(balance)} Ether\n`;
    } catch (error) {
      error = console.log("ERROR: Failed to retrieve Lottery Balance.");
    }
  } else {
    walletConnectButton.innerHTML = "Please Install Metamask";
  }
};

// EXPORTS
module.exports = {
  connect,
  playerEnterLottery,
  getListOfPlayers,
  updateFrontEnd,
  updateLotteryBalance,
  updateFrontEndWhenWalletChanges,
  updateFrontEndOnLoad,
  getMostRecentWinner,
  listenForWinnerBeingSelected,
  listenForLotteryWinner,
};
