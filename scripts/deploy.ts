import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("MyERC1155Token");
  const token = await Token.deploy("token-uri");

  await token.deployed();

  console.log(`Deployed to ${token.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
