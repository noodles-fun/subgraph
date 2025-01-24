import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Sbt } from '../generated/schema'
import { Transfer as TransferEvent } from '../generated/PointsSBT/PointsSBT'
import { handleTransfer } from '../src/points-sbt'
import { createTransferEvent } from './points-sbt-utils'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('PointsSBT', () => {
  beforeAll(() => {})

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('Transfer', () => {
    let tokenId = BigInt.fromI32(1)
    let to = Address.fromString('0x0000000000000000000000000000000000000003')
    let newTransferEvent = createTransferEvent(
      Address.fromString('0x0000000000000000000000000000000000000000'),
      to,
      tokenId
    )
    handleTransfer(newTransferEvent)

    assert.entityCount('Sbt', 1)
    assert.fieldEquals(
      'Sbt',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'owner',
      to.toHexString()
    )
  })
})
