import chai from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import {
  deployNativeGild,
  expectedReferencePrice,
  expectedUri,
  priceOne,
} from "./util";
import type { NativeGild } from "../typechain/NativeGild";
import type { TestPriceOracle } from "../typechain/TestPriceOracle";

chai.use(solidity);
const { expect, assert } = chai;

describe("erc1155 usage", async function () {
  it("should construct well", async function () {
    const [ethGild, priceOracle] = (await deployNativeGild()) as [
      NativeGild,
      TestPriceOracle
    ];

    const id = 12345;

    const erc1155Uri = await ethGild.uri(id);

    assert(
      erc1155Uri === expectedUri,
      "erc1155 did not construct with correct uri"
    );
  });

  it("should only send itself", async function () {
    const signers = await ethers.getSigners();

    const [ethGild, priceOracle] = (await deployNativeGild()) as [
      NativeGild,
      TestPriceOracle
    ];

    const gildAmount = ethers.BigNumber.from(1000);
    await ethGild.gild(0, { value: gildAmount });

    const expectedErc20Balance = gildAmount
      .mul(expectedReferencePrice)
      .div(priceOne);
    const expectedErc20BalanceAfter = expectedErc20Balance;
    const expectedErc1155Balance = expectedErc20Balance;
    const expectedErc1155BalanceAfter = expectedErc1155Balance.div(2);
    const expected1155ID = await priceOracle.price();

    const erc20Balance = await ethGild["balanceOf(address)"](
      signers[0].address
    );
    assert(
      erc20Balance.eq(expectedErc20Balance),
      `wrong erc20 balance ${expectedErc20Balance} ${erc20Balance}`
    );

    const erc1155Balance = await ethGild["balanceOf(address,uint256)"](
      signers[0].address,
      expected1155ID
    );
    assert(
      erc1155Balance.eq(expectedErc1155Balance),
      `wrong erc1155 balance ${expectedErc20Balance} ${erc1155Balance}`
    );

    await ethGild.safeTransferFrom(
      signers[0].address,
      signers[1].address,
      expected1155ID,
      expectedErc1155BalanceAfter,
      []
    );

    const erc20BalanceAfter = await ethGild["balanceOf(address)"](
      signers[0].address
    );
    assert(
      erc20BalanceAfter.eq(expectedErc20BalanceAfter),
      `wrong erc20 balance after ${expectedErc20BalanceAfter} ${erc20BalanceAfter}`
    );

    const erc20BalanceAfter2 = await ethGild["balanceOf(address)"](
      signers[1].address
    );
    assert(
      erc20BalanceAfter2.eq(0),
      `wrong erc20 balance after 2 0 ${erc20BalanceAfter2}`
    );

    const erc1155BalanceAfter = await ethGild["balanceOf(address,uint256)"](
      signers[0].address,
      expected1155ID
    );
    assert(
      erc1155BalanceAfter.eq(expectedErc1155BalanceAfter),
      `wrong erc1155 balance after ${expectedErc1155BalanceAfter} ${erc1155BalanceAfter}`
    );

    const erc1155BalanceAfter2 = await ethGild["balanceOf(address,uint256)"](
      signers[1].address,
      expected1155ID
    );
    assert(
      erc1155BalanceAfter2.eq(expectedErc1155BalanceAfter),
      `wrong erc1155 balance 2 after ${expectedErc1155BalanceAfter} ${erc1155BalanceAfter2}`
    );
  });
});