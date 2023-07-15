const { ethers } = require("ethers");

const connect = async () => {
  if (window.ethereum !== "undifined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    walletConnectButton.innerHTML = "Connected";
    walletStatusLight.style.backgroundColor = "#49E9A6";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    walletConnectButton.innerHTML = "Please install MetaMask";
  }
};
const execute = async () => {
  if (window.ethereum !== "undifined") {
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
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
    const signer = provider.getSigner(); // this will get the connected account
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      await contract.enterLottery();
    } catch (error) {
      console.log(error);
    }
  } else {
    walletConnectButton.innerHTML = "Please install Metamask";
  }
};

module.exports = {
  connect,
  execute,
};
