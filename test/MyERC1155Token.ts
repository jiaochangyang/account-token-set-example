import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyERC1155Token", function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployMyERC1155TokenFixture() {
		// Contracts are deployed using the first signer/account by default
		const [account, otherAccount] = await ethers.getSigners();

		const MyERC1155Token = await ethers.getContractFactory("MyERC1155Token");
		const myERC1155Token = await MyERC1155Token.deploy("token-uri");

		return { myERC1155Token, account, otherAccount };
	}

	const tokenId1 = "0x01";
	const tokenId2 = "0x02";

	describe("Mint", function () {
		it("Should return an empty list when account owns no token", async function () {
			const { myERC1155Token, account } = await loadFixture(deployMyERC1155TokenFixture);
			const tokenIds = await myERC1155Token.connect(account).getTokenIdsFor(account.address);

			expect(tokenIds).to.have.members([]);
		});

		it("Should add tokenId on mint when value was 0", async function () {
			const { myERC1155Token, account } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			const tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);

			expect(tokenIds).to.have.deep.members([tokenId1]);
		});

		it("Should add multiple tokenId on mint when value was 0 for those tokenIds", async function () {
			const { myERC1155Token, account } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			await myERC1155Token.connect(account).mint(account.address, tokenId2, BigInt(100), []);
			const tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);

			expect(tokenIds).to.have.deep.members([tokenId1, tokenId2]);
		});
	});

	describe("Burn", function () {
		it("Should remove tokenId from list if burning all token amount to 0", async function () {
			const { myERC1155Token, account } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			let tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);
			expect(tokenIds).to.have.deep.members([tokenId1]);

			await myERC1155Token.connect(account).burn(account.address, tokenId1, BigInt(100));
			tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);

			expect(tokenIds).to.have.members([]);
		});

		it("Should not remove tokenId from list if burn token amount to non-zero value", async function () {
			const { myERC1155Token, account } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			let tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);
			expect(tokenIds).to.have.deep.members([tokenId1]);

			await myERC1155Token.connect(account).burn(account.address, tokenId1, BigInt(50));
			tokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);

			expect(tokenIds).to.have.members([tokenId1]);
		});
	});

	describe("Transfer", function () {
		it("Should not remove tokenId from sender list and should add tokenId in recipient list", async function () {
			const { myERC1155Token, account, otherAccount } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			let account1TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(account.address)).map(
				(t) => t._hex
			);

			let account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);

			expect(account1TokenIds).to.have.deep.members([tokenId1]);
			expect(account2TokenIds).to.have.deep.members([]);

			await myERC1155Token
				.connect(account)
				.safeTransferFrom(account.address, otherAccount.address, tokenId1, BigInt(50), []);
			account1TokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);
			expect(account1TokenIds).to.have.members([tokenId1]);

			account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);
			expect(account2TokenIds).to.have.members([tokenId1]);
		});

		it("Should remove tokenId from sender list and should add tokenId in recipient list", async function () {
			const { myERC1155Token, account, otherAccount } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			let account1TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(account.address)).map(
				(t) => t._hex
			);

			let account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);

			expect(account1TokenIds).to.have.deep.members([tokenId1]);
			expect(account2TokenIds).to.have.deep.members([]);

			await myERC1155Token
				.connect(account)
				.safeTransferFrom(account.address, otherAccount.address, tokenId1, BigInt(100), []);
			account1TokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);
			expect(account1TokenIds).to.have.members([]);

			account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);
			expect(account2TokenIds).to.have.members([tokenId1]);
		});

		it("Should not remove tokenId from sender list and should not add tokenId in recipient list", async function () {
			const { myERC1155Token, account, otherAccount } = await loadFixture(deployMyERC1155TokenFixture);
			await myERC1155Token.connect(account).mint(account.address, tokenId1, BigInt(100), []);
			await myERC1155Token.connect(account).mint(otherAccount.address, tokenId1, BigInt(100), []);
			let account1TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(account.address)).map(
				(t) => t._hex
			);

			let account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);

			expect(account1TokenIds).to.have.deep.members([tokenId1]);
			expect(account2TokenIds).to.have.deep.members([tokenId1]);

			await myERC1155Token
				.connect(account)
				.safeTransferFrom(account.address, otherAccount.address, tokenId1, BigInt(100), []);
			account1TokenIds = (await myERC1155Token.connect(account).getTokenIdsFor(account.address)).map((t) => t._hex);
			expect(account1TokenIds).to.have.members([]);

			account2TokenIds = (await myERC1155Token.connect(otherAccount).getTokenIdsFor(otherAccount.address)).map(
				(t) => t._hex
			);
			expect(account2TokenIds).to.have.members([tokenId1]);
		});
	});
});
