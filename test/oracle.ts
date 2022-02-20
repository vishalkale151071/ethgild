import chai from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { deployNativeGild, expectedReferencePrice } from "./util";
import type { NativeGild } from "../typechain/NativeGild";
import type { TestPriceOracle } from "../typechain/TestPriceOracle";

chai.use(solidity);
const { expect, assert } = chai;

describe("oracle", async function () {
  it("should have an oracle", async function () {
    const [ethGild, priceOracle] = (await deployNativeGild()) as [
      NativeGild,
      TestPriceOracle
    ];

    const price = await priceOracle.price();

    assert(
      price.eq(expectedReferencePrice),
      `wrong referencePrice. got ${price}. expected ${expectedReferencePrice}`
    );
  });
});
