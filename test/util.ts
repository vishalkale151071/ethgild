import chai from 'chai'
import { ethers } from 'hardhat'
import { ContractTransaction, Contract, BigNumber } from 'ethers'
const { assert } = chai
import { Result } from "ethers/lib/utils";

export const chainlinkXauUsd = '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6';
export const chainlinkEthUsd = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

export const eighteenZeros = '000000000000000000'
export const xauOne = '100000000'

export const deployEthGild = async () => {
    const oracleFactory = await ethers.getContractFactory(
      'Oracle'
    )
    const xauOracle = await oracleFactory.deploy()
    await xauOracle.deployed()
    await xauOracle.setDecimals(8)
    await xauOracle.setRoundData(1, {
      answer: BigNumber.from('200000000000'),
      startedAt: BigInt(14065411),
      updatedAt: BigInt(14065415),
      answeredInRound: 1,
    })

    const ethOracle = await oracleFactory.deploy()
    await ethOracle.deployed()
    await ethOracle.setDecimals(8)
    await ethOracle.setRoundData(1, {
      answer: BigNumber.from('234500000000'),
      startedAt: BigInt(14065411),
      updatedAt: BigInt(14065415),
      answeredInRound: 1,
    })

    const ethGildFactory = await ethers.getContractFactory(
        'EthGild'
    )
    const ethGild = await ethGildFactory.deploy({
      chainlinkXauUsd: xauOracle.address,
      chainlinkEthUsd: ethOracle.address,
    })
    await ethGild.deployed()

    return [ethGild, xauOracle, ethOracle]
}

export const expectedReferencePrice = ethers.BigNumber.from('117250000')

export const assertError = async (f:Function, s:string, e:string) => {
    let didError = false
    try {
        await f()
    } catch (e) {
        assert(e.toString().includes(s), `error string ${e} does not include ${s}`)
        didError = true
    }
    assert(didError, e)
  }

  export const expectedName = 'EthGild'
  export const expectedSymbol = 'ETHg'
  export const expectedUri = 'https://ethgild.crypto/#/id/{id}'

/// @param tx - transaction where event occurs
/// @param eventName - name of event
/// @param contract - contract object holding the address, filters, interface
/// @returns Event arguments, can be deconstructed by array index or by object key
export const getEventArgs = async (
    tx: ContractTransaction,
    eventName: string,
    contract: Contract
  ): Promise<Result> => {
    const events = (await tx.wait()).events || []
    const filter = (contract.filters[eventName]().topics || [])[0]
    const eventObj = events.find(
      (x) =>
        x.topics[0] == filter
        && x.address == contract.address
    );

    if (!eventObj) {
      throw new Error(`Could not find event with name ${eventName}`);
    }

    return contract.interface.decodeEventLog(eventName, eventObj.data);
  };

export const generate1155ID = (referencePrice: BigNumber, xauDecimals: number):BigNumber => {
  return BigNumber.from(referencePrice.toBigInt() << BigInt(8) | BigInt(xauDecimals))
}
export const expected1155ID = generate1155ID(expectedReferencePrice, 8)
