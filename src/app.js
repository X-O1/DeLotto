/** IMPORTS  */
const { ethers, BigNumber } = require("ethers");

/** GLOBAL VARIABLES */
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
let hours;
let minutes;
let seconds;

/** SOLIDITY CONTRACTS */
const LOTTERY_CONTRACT = {
  address: "0x2346aa2139c4c7E8d1ddc3AF81fe900D486215EF",
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
      name: "chooseWinnner",
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
      inputs: [
        {
          internalType: "address",
          name: "fundingAddress",
          type: "address",
        },
      ],
      name: "getIfPlayerHasEntered",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
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
const enterLotteryButton = document.querySelector(".enter-lottery-button");
const recentWinnerContainer = document.querySelector(".recent-winner");
const toggleLog = document.querySelector(".toggle-log");
const closeLog = document.querySelector(".close-log");
const lotteryLog = document.querySelector(".lottery-log");
const amountWonContainer = document.querySelector(".amount-won");
const recentWinnerTitle = document.querySelector(".recent-winner-title");
const hoursContaienr = document.querySelector(".timer .hours");
const minutesContainer = document.querySelector(".timer .minutes");
const secondsContaienr = document.querySelector(".timer .seconds");

// THESE FUNCTIONS WILL RUN EVERYTIME THE SITE LOADS
window.onload = () => {
  updateLotteryBalance();
  updateFrontEndOnLoad();
};

// RETURNS LIST OF ALL PLAYERS THAT ENTERED THE CURRENT LOTTERY
const getListOfPlayers = async () => {
  const contract = new ethers.Contract(
    LOTTERY_CONTRACT.address,
    LOTTERY_CONTRACT.abi,
    provider
  );
  const listOfPlayers = await contract.getListOfPlayers();
  return listOfPlayers.map((player) => player.toLowerCase());
};

// UPDATES FRONT-END ON PAGE RELOAD BASED ON CURRENT WALLET CONNECTED
const updateFrontEndOnLoad = async () => {
  const playerAccounts = await getListOfPlayers();

  if (typeof window.ethereum !== undefined) {
    try {
      const connectedAddress = await signer.getAddress();
      const connectedAddressLowerCase = connectedAddress.toLowerCase();
      const accountEntered = await playerAccounts.includes(
        connectedAddressLowerCase
      );
      if (connectedAddress === undefined) {
        walletConnectButton.innerHTML = "Connect Wallet";
        enterLotteryButton.innerHTML = "Connect Wallet to enter Lottery!";
        enterLotteryButton.style.fontSize = "32px";
      } else if (accountEntered) {
        updateFrontEnd();
        walletConnectButton.innerHTML = "Connected";
      } else {
        enterLotteryButton.innerHTML = "Enter Lottery!";
        enterLotteryButton.style.fontSize = "46px";
        walletConnectButton.innerHTML = "Connected";
      }
    } catch (error) {
      error = console.log("ERROR: No wallet is Connected.");
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};

// UPDATES FRONT-END ON WALLET CHANGE
const updateFrontEndWhenWalletChanges = async () => {
  if (typeof window.ethereum !== undefined) {
    try {
      ethereum.on("accountsChanged", async (newAccounts) => {
        const playerAccounts = await getListOfPlayers();
        const accountEntered = await playerAccounts.includes(newAccounts[0]);
        console.log("Accounts changed", newAccounts[0]);

        if (newAccounts[0] === undefined) {
          walletConnectButton.innerHTML = "Connect Wallet";
          enterLotteryButton.innerHTML = "Connect Wallet to enter Lottery!";
          enterLotteryButton.style.fontSize = "32px";
        } else if (accountEntered) {
          updateFrontEnd();
        } else {
          enterLotteryButton.innerHTML = "Enter Lottery!";
          enterLotteryButton.style.fontSize = "46px";
        }
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
    walletConnectButton.innerHTML = "Please install MetaMask";
  }
};

// ENTERS PLAYER INTO THE LOTTERY
const playerEnterLottery = async () => {
  const contract = new ethers.Contract(
    LOTTERY_CONTRACT.address,
    LOTTERY_CONTRACT.abi,
    signer
  );

  if (typeof window.ethereum !== "undefined") {
    try {
      const overrides = {
        value: LOTTERY_CONTRACT.entryFee,
      };
      const enterLotteryTransaction = await contract.enterLottery(overrides);
      await enterLotteryTransaction.wait();

      // Waits for a winner to be selected and then displays winner on front-end
      listenForLotteryWinner();

      // Update front-end elements
      updateLotteryBalance();
      updateFrontEnd();
    } catch (error) {
      error = console.log(
        "ERROR: Wallet not connected or this address has already entered the Lottery."
      );
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};

/** EVENT LISTENERS */
// Find most recent lottery winner and display it on front-end
const listenForLotteryWinner = () => {
  const contract = new ethers.Contract(
    LOTTERY_CONTRACT.address,
    LOTTERY_CONTRACT.abi,
    signer
  );
  contract.on("WinnerSelected", (player, amountWon) => {
    let recentWinner = {
      player,
      amountWon,
    };
    recentWinnerContainer.innerHTML = recentWinner.player;
    amountWonContainer.innerHTML = `Won: ${ethers.utils.formatEther(
      recentWinner.amountWon
    )} Ether!`;

    lotteryLog.style.opacity = "1";
    toggleLog.style.display = "none";
    closeLog.style.display = "flex";
  });
};

// Timer countdown
const startTimer = async () => {
  let hours = 24;
  let minutes = 60;
  let seconds = 60;
  const contract = new contract.ethers.Contract(
    LOTTERY_CONTRACT.address,
    LOTTERY_CONTRACT.abi,
    provider
  );
  // if (getListOfPlayers().length === 1) {};
  if (seconds >= 60) {
    const secondsCountdown = setInterval(adjustSeconds, 1000);
  }
  if (seconds === 0) {
    adjustMinutes();
    seconds = 60;
  }
  if (minutes === 0) {
    adjustHours();
    minutes = 60;
  }
  contract.on("WinnerSelected", () => {});
};

const adjustHours = () => {
  hours--;
};
const adjustMinutes = () => {
  minutes--;
};
const adjustSeconds = () => {
  seconds--;
};

// Lottery Log display
toggleLog.addEventListener("click", () => {
  lotteryLog.style.opacity = "1";
  toggleLog.style.display = "none";
  closeLog.style.display = "flex";
  recentWinnerTitle.innerHTML = "Recent Winner";
  listenForLotteryWinner();
});
closeLog.addEventListener("click", () => {
  lotteryLog.style.opacity = "0";
  closeLog.style.display = "none";
  toggleLog.style.display = "flex";
});

/** MISC */
const updateFrontEnd = () => {
  enterLotteryButton.innerHTML = "Entered! Best of Luck!";
  enterLotteryButton.style.fontSize = "39px";
};

const updateLotteryBalance = async () => {
  try {
    const balance = await provider.getBalance(LOTTERY_CONTRACT.address);
    lotteryBalance.innerHTML = `\nLottery Balance: ${ethers.utils.formatEther(
      balance
    )} Ether\n`;
  } catch (error) {
    error = console.log("ERROR: Failed to retrieve Lottery Balance.");
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
};
