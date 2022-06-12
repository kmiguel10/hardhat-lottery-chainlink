const { ethers } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE = "../nextjs-lottery-chainlink/constants/contractAddresses.json"
const FRONT_END_ABI_FILE = "../nextjs-lottery-chainlink/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front-end....")
        updateContractAddresses()
        updateAbi()
    }
}

async function updateAbi() {
    console.log("ChainId", network.config.chainId.toString(), network)
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    //get raffle contract - pass to front end
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))

    console.log("ChainId", chainId)

    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(raffle.address)) {
            currentAddresses[chainId].push(raffle.address)
        }
    }
    {
        //if chainId does not exist in currentAddresses , then add a new array
        currentAddresses[chainId] = [raffle.address]
    }

    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

module.exports.tags = ["all", "frontend"]
