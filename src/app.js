// Imports
const { ethers, BigNumber } = require("ethers");

// Front-end elements
const walletConnectButton = document.querySelector(".wallet");
const lotteryBalance = document.querySelector(".lottery-balance");
const enterLotteryButton = document.querySelector(".enter-lottery-button");

// Everytime site loads these functions will run first
window.onload = () => {
  updateLotteryBalance();
  updateFrontEndOnLoad();
};

// Returns list of all players addresses that have entered Lottery
const getListOfPlayers = async () => {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const provider = new ethers.providers.Web3Provider(window.ethereum);
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
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const listOfPlayers = await contract.getListOfPlayers();
  return listOfPlayers.map((player) => player.toLowerCase());
};

// Updates front-end everytime page reloads based on current wallet connected
const updateFrontEndOnLoad = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
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
        enterLotteryButton.innerHTML = "Enter Lottery!";
        enterLotteryButton.style.fontSize = "46px";
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

// Updates front-end every time wallet changes
const updateFrontEndEveryTimeWalletChanges = async () => {
  if (typeof window.ethereum !== undefined) {
    try {
      ethereum.on("accountsChanged", async (newAccounts) => {
        const playerAccounts = await getListOfPlayers();
        const accountEntered = await playerAccounts.includes(newAccounts[0]);
        console.log("Accounts changed", newAccounts[0]);

        if (newAccounts[0] === undefined) {
          walletConnectButton.innerHTML = "Connect Wallet";
          enterLotteryButton.innerHTML = "Enter Lottery!";
          enterLotteryButton.style.fontSize = "46px";
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
updateFrontEndEveryTimeWalletChanges();

// Connects site to a node (MetaMask)
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

// Enter the Lottery
const execute = async () => {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const entryFee = BigNumber.from("250000000000000000");
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
  const contract = new ethers.Contract(contractAddress, abi, signer);

  if (typeof window.ethereum !== "undefined") {
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
      error = console.log("This address has already entered the Lottery.");
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};

const updateFrontEnd = () => {
  enterLotteryButton.innerHTML = "Entered! Best of Luck!";
  enterLotteryButton.style.fontSize = "39px";
};

const updateLotteryBalance = async () => {
  try {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    lotteryBalance.innerHTML = `\nLottery Balance: ${ethers.utils.formatEther(
      balance
    )} Ether\n`;
  } catch (error) {
    error = console.log("ERROR: Failed to retrieve Lottery Balance.");
  }
};

module.exports = {
  connect,
  execute,
  getListOfPlayers,
  updateFrontEnd,
  updateLotteryBalance,
  updateFrontEndEveryTimeWalletChanges,
  updateFrontEndOnLoad,
};
