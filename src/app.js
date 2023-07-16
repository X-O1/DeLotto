// ethers.js
const { ethers, BigNumber } = require("ethers");
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
const contract = new ethers.Contract(contractAddress, abi, signer);
const entryFee = BigNumber.from("250000000000000000");

// Front-end elements
const walletConnectButton = document.querySelector(".wallet");
const balanceInfo = document.querySelector(".balance-info");

// Connect site to a node (MetaMask)
const connect = async () => {
  if (window.ethereum !== "undifined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    walletConnectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    walletConnectButton.innerHTML = "Please install MetaMask";
  }
};

// Enter the Lottery
const execute = async () => {
  if (window.ethereum !== "undifined") {
    try {
      const overrides = {
        value: entryFee,
      };
      await contract.enterLottery(overrides);
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};
// View the current Lottery balance
const getLotteryBalance = async () => {
  const balance = await provider.getBalance(contractAddress);
  balanceInfo.innerHTML = `\nETH Balance of the Lottery --> ${ethers.utils.formatEther(
    balance
  )} ETH\n`;
};

module.exports = {
  connect,
  execute,
  getLotteryBalance,
};
