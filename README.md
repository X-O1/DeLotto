# About

# DeLotto

This is a lottery smart contract written in Solidity. Participants can enter the lottery by depositing a certain amount of Ether. Once the lottery is closed, a winner is chosen randomly using Chainlink VRF. The entire deposited amount is then sent to the winning address. After the winner is chosen, the lottery resets for the next round.

## Dependencies

This contract depends on the `@chainlink/contracts` package, specifically `VRFCoordinatorV2Interface` and `VRFConsumerBaseV2`.

## Installation

To install dependencies, run:

```bash
npm install @chainlink/contracts
```

## Features

- The lottery has two main states: OPEN and CALCULATING. The lottery is open for entries in the OPEN state. When the winner is being calculated, the lottery moves into the CALCULATING state.
- Users can enter the lottery by depositing Ether. One address can only enter once in a lottery round. The contract owner cannot participate in the lottery.
- Once the lottery has enough participants, the contract owner can close the lottery and initiate the process to choose a winner.
- The lottery winner is chosen randomly using Chainlink's VRF.
- The total deposited amount is sent to the winner's address. The lottery then resets and opens for the next round.

## Functions

### enterLottery()

Allows a user to enter the lottery. The function is `payable`, and the user must send enough Ether to cover the entry fee. The user cannot be the contract owner or an address that has already entered.

### chooseWinner()

Closes the lottery and sends a request to Chainlink's VRF to get a random number. This function can only be called if there are players in the lottery and there are funds in the contract.

### fulfillRandomWords()

Called by the VRF Coordinator contract with the random number. This function calculates the winning index, selects the winner, transfers the winning amount, and resets the lottery.

### getLotteryState()

Returns the current state of the lottery.

### getPlayersEntryDeposit()

Returns the amount of Ether deposited by a specific address.

### getListOfPlayers()

Returns a list of addresses that have entered the current round of the lottery.

## Events

- `NumOfLotteryRounds`: Emitted after each round of the lottery, indicating the total number of lottery rounds so far.
- `EnteredLottery`: Emitted when a player enters the lottery, indicating the player's address.
- `WinnerSelected`: Emitted when a winner is chosen, indicating the winner's address and the amount won.
- `RequestedLotteryWinner`: Emitted when a random number is requested from Chainlink's VRF to determine the winner.

