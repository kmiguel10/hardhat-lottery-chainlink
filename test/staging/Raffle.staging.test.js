const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip()
    : describe("Raffle Unit tests", async function () {
          //Needs
          let raffle, deployer, raffleEntranceFee

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomwords", function () {
              it("works with chainlink VRF and Chainlink Keepers, we get a random winner", async function () {
                  //Enter the raffle
                  console.log("Setting up test...")
                  const startingTimestamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()

                  //setup listener before we enter the raffle just in case the blockchain moves really fast
                  console.log("Setting up Listener...")
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")

                          try {
                              //add asserts here
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted //there should be no players
                              assert.equal(recentWinner.toString(), accounts[0].address) //the deployer should be equal the winner
                              assert.equal(raffleState, 0) //state should be back to OPEN
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimestamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(e)
                          }
                      })
                      // Then entering the raffle
                      console.log("Entering Raffle...")
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance() //get starting balance

                      //This code wont complete until our listener has finished listening!
                  })
              })
          })
      })
