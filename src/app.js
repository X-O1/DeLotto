/** IMPORTS  */
const { ethers, BigNumber } = require("ethers");

/** ETHERS.JS GLOBAL VARIABLES */
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

/** SOLIDITY CONTRACTS */
const LOTTERY_CONTRACT = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  abi: [
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
  ],
  entryFee: BigNumber.from("250000000000000000"),
};

/** FRONT-END ELEMENTS */
const walletConnectButton = document.querySelector(".wallet");
const lotteryBalance = document.querySelector(".lottery-balance");
const enterLotteryButton = document.querySelector(".enter-lottery-button");
const recentWinnerContainer = document.querySelector(".recent-winner");
const toggleLog = document.querySelector(".toggle-log");
const closeLog = document.querySelector(".close-log");
const lotteryLog = document.querySelector(".lottery-log");

// THESE FUNCTIONS WILL RUN EVERYTIME THE SITE LOADS
window.onload = () => {
  updateLotteryBalance();
  updateFrontEndOnLoad();
  listenForLotteryWinner();
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
const updateFrontEndEveryTimeWalletChanges = async () => {
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
updateFrontEndEveryTimeWalletChanges();

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
const execute = async () => {
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
    // console.log(`The Recent Lottery Winner was ${recentWinner.player}`);
    recentWinnerContainer.innerHTML = `Recent Winner: ${
      recentWinner.player
    } Won: ${ethers.utils.formatEther(recentWinner.amountWon)} Ether`;
  });
};

// Lottery Log display
toggleLog.addEventListener("click", () => {
  lotteryLog.style.opacity = "1";
  toggleLog.style.display = "none";
  closeLog.style.display = "flex";
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
  execute,
  getListOfPlayers,
  updateFrontEnd,
  updateLotteryBalance,
  updateFrontEndEveryTimeWalletChanges,
  updateFrontEndOnLoad,
};
