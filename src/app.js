// Imports
const { ethers, BigNumber } = require("ethers");

// Ethers.js state variables
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  {
    inputs: [],
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
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "WinnerSelected",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fundingAddress",
        type: "address",
      },
    ],
    name: "checkIfPlayerEntered",
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
    name: "getLotteryEndingThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getRoomLeftInPool",
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
];
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const entryFee = BigNumber.from("250000000000000000");

// Front-end elements
const walletConnectButton = document.querySelector(".wallet");
const lotteryBalance = document.querySelector(".lottery-balance");
const enterLotteryButton = document.querySelector(".enter-lottery-button");

window.onload = () => {
  updateLotteryBalance();
};
// Connect site to a node (MetaMask)
const connect = async () => {
  if (window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });

      ethereum.on("accountsChanged", (newAccounts) => {
        const playerAccounts = getListOfPlayers();
        console.log("Accounts changed", newAccounts[0]);

        if (newAccounts[0] == undefined) {
          walletConnectButton.innerHTML = "Connect Wallet";
          enterLotteryButton.innerHTML = "Enter Lottery!";
          enterLotteryButton.style.fontSize = "46px";
        }

        for (let i = 0; i < playerAccounts.length; i++) {
          if (newAccounts[0] !== playerAccounts[i]) {
            enterLotteryButton.innerHTML = "Enter Lottery!";
            enterLotteryButton.style.fontSize = "46px";
          } else {
            updateFrontEnd();
          }
        }
      });

      walletConnectButton.innerHTML = "Connected";
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please install MetaMask";
  }
};

// Enter the Lottery
const execute = async () => {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  if (window.ethereum !== "undefined") {
    try {
      const overrides = {
        value: entryFee,
      };
      const enterLotteryTransaction = await contract.enterLottery(overrides);
      await enterLotteryTransaction.wait();

      // Update front-end elements
      updateLotteryBalance();
      updateFrontEnd();
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};

const updateFrontEnd = () => {
  enterLotteryButton.innerHTML = "Entered! Best of Luck!";
  enterLotteryButton.style.fontSize = "39px";
};
const getListOfPlayers = () => {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const listOfPlayers = contract.getListOfPlayers();
  return listOfPlayers;
};
const updateLotteryBalance = async () => {
  const balance = await provider.getBalance(contractAddress);
  lotteryBalance.innerHTML = `\nLottery Balance: ${ethers.utils.formatEther(
    balance
  )} Ether\n`;
};

module.exports = {
  connect,
  execute,
  getListOfPlayers,
  updateFrontEnd,
  updateLotteryBalance,
};
