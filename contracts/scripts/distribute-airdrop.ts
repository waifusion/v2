const { BigNumber } = require("@ethersproject/bignumber");
const { ethers } = require("hardhat");
// const airdropInfo2 = require("../snapshots/waifu-12092465.json");
const airdropInfo = require("../snapshots/extras/2year-18086715.json");

async function main() {
  const [deployer] = await ethers.getSigners();

  const address = await deployer.getAddress();
  console.log("Deploying account:", address);
  console.log(
    "Deploying account balance:",
    (await deployer.getBalance()).toString(),
    "\n"
  );
  
  // TODO: MAKE SURE USING RIGHT KEY AND JSON TO DISTRO

  // ASSIGN THE JSON WITH KEY-VALUE MAP OF ADDRESS: AMOUNT TO AIRDROP IT BELOW
  // CHANGE ADDRESS BELOW AND CHANGE TOKEN ID YOU WISH TO AIRDROP BELOW

  const airdrop = await ethers.getContractAt("Airdrop1155", "0x918eaa82ee6f07e46c82d04e34ebc352a56317c2") // uwu
  // const airdrop = await ethers.getContractAt("Airdrop1155", "0xa3b041ee6b56bccbc54a3048417d82fe67736f62") // lamps

  // ID HERE
  let NFT_ID = 4;

  console.log("doneeee")
  let addresses = Object.keys(airdropInfo);
  let total = 0;
  for (let i = 0; i < addresses.length; i++) {
    total += airdropInfo[addresses[i]]
  }
  console.log("Total to send: ", total)
  

  let nonce = await ethers.provider.getTransactionCount(await deployer.getAddress(), "pending");
  console.log(nonce)
  let batchSize = 100;
  for (let i = 0; i < addresses.length; i += batchSize) {
    let sendAddresses = [];
    let sendIds = [];
    let sendAmounts = [];
    let max = i+batchSize > addresses.length ? addresses.length : i+batchSize
    let ids = Array(max-i).fill(NFT_ID)
    let batchBalances = await airdrop.balanceOfBatch(addresses.slice(i, max), ids); 
    for (let ii = i; ii < max; ii++) {
      let balance = batchBalances[ii-i]
      let extraToMint = 1 > balance;
      if (!extraToMint) {
        continue
      }
      console.log(`Missed: ${addresses[ii]}: ${balance} vs. ${airdropInfo[addresses[ii]]}`)
      sendAddresses.push(addresses[ii])
      sendIds.push(NFT_ID)
      // sendAmounts.push(airdropInfo[addresses[ii]])
      sendAmounts.push(1)
    }
    if (sendAddresses.length == 0) {
      continue
    }
    console.log(i)
    console.log(sendAddresses.length)
    let tx = await airdrop.mintManyUpTo(
      sendAddresses, sendIds, sendAmounts,
      {
        nonce: BigNumber.from(nonce),
        gasLimit: 5000000,
      }
    );
    await tx.wait();
    nonce++;

  }
}

main()
  .then(() => {
    console.log("\nDeployment completed successfully ✓");
    process.exit(0);
  })
  .catch((error) => {
    console.log("\nDeployment failed ✗");
    console.error(error);
    process.exit(1);
  });
