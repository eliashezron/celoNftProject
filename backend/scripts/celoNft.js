const hre = require("hardhat")

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT")
  const myNFT = await MyNFT.deploy()

  await myNFT.deployed()

  console.log("MyNFT deployed to:", myNFT.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

address = "0x9BC6b2edc0C93e6CA73E5715aE9abf61053377fb"
