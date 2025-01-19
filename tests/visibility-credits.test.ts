import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  handleCreatorFeeClaimed,
  handleCreatorVisibilitySet,
  handleCreditsTrade,
  handleCreditsTransfer,
  handleReferrerPartnerSet
} from '../src/visibility-credits'
import {
  createCreatorFeeClaimedEvent,
  createCreatorVisibilitySetEvent,
  createCreditsTradeEvent,
  createCreditsTransferEvent,
  createReferrerPartnerSetEvent
} from './visibility-credits-utils'

let creator = Address.fromString('0x0000000000000000000000000000000000000001')
let metadata = 'test'
let from = Address.fromString('0x0000000000000000000000000000000000000002')
let to = Address.fromString('0x0000000000000000000000000000000000000003')
let visibilityId = 'x-test' // 0x782d74657374
let tradeCost = BigInt.fromI32(10000)
let creatorFee = BigInt.fromI32(200)
let referrerFee = BigInt.fromI32(125)
let partnerFee = BigInt.fromI32(25)
let protocolFee = BigInt.fromI32(150)
let referrer = Address.fromString('0x0000000000000000000000000000000000000004')
let partner = Address.fromString('0x0000000000000000000000000000000000000005')
let amount = BigInt.fromI32(3)
let newTotalSupply = BigInt.fromI32(5)
let newCurrentPrice = BigInt.fromU64(
  10000000000000000 + 15000000000 * 5 ** 2 + 25000000000000 * 5
)

describe('VisibilityCredits', () => {
  beforeAll(() => {})

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('CreatorFeeClaimed', () => {
    let newCreatorFeeClaimedEvent = createCreatorFeeClaimedEvent(
      creator,
      creatorFee
    )
    handleCreatorFeeClaimed(newCreatorFeeClaimedEvent)

    assert.entityCount('CreatorFeeClaimed', 1)
    assert.fieldEquals(
      'CreatorFeeClaimed',
      'auto',
      'creator',
      '0x0000000000000000000000000000000000000001'
    )
    assert.fieldEquals('CreatorFeeClaimed', 'auto', 'amount', '200')
  })

  test('CreatorVisibilitySet', () => {
    let newCreatorVisibilitySetEvent = createCreatorVisibilitySetEvent(
      visibilityId,
      creator,
      metadata
    )
    handleCreatorVisibilitySet(newCreatorVisibilitySetEvent)

    assert.entityCount('Visibility', 1)
    assert.fieldEquals(
      'Visibility',
      Bytes.fromUTF8('x-test').toHex(),
      'currentPrice',
      '0'
    )
    assert.fieldEquals(
      'Visibility',
      Bytes.fromUTF8('x-test').toHex(),
      'totalSupply',
      '0'
    )
    assert.fieldEquals(
      'Visibility',
      Bytes.fromUTF8('x-test').toHex(),
      'creator',
      '0x0000000000000000000000000000000000000001'
    )
    assert.fieldEquals(
      'Visibility',
      Bytes.fromUTF8('x-test').toHex(),
      'metadata',
      'test'
    )
  })

  test('CreditsTrade', () => {
    let newCreditsTradeEvent = createCreditsTradeEvent(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromString(visibilityId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBoolean(true), // isBuy
        ethereum.Value.fromUnsignedBigInt(tradeCost),
        ethereum.Value.fromUnsignedBigInt(creatorFee),
        ethereum.Value.fromUnsignedBigInt(protocolFee),
        ethereum.Value.fromUnsignedBigInt(referrerFee),
        ethereum.Value.fromUnsignedBigInt(partnerFee),
        ethereum.Value.fromAddress(referrer),
        ethereum.Value.fromAddress(partner),
        ethereum.Value.fromUnsignedBigInt(newTotalSupply)
      ])
    )
    handleCreditsTrade(newCreditsTradeEvent)

    assert.entityCount('CreditsTrade', 1)
    assert.fieldEquals(
      'CreditsTrade',
      'auto',
      'userAddress',
      '0x0000000000000000000000000000000000000002'
    )
    assert.fieldEquals(
      'CreditsTrade',
      'auto',
      'visibility',
      Bytes.fromUTF8('x-test').toHex()
    )

    assert.fieldEquals(
      'Visibility',
      Bytes.fromUTF8('x-test').toHex(),
      'currentPrice',
      newCurrentPrice.toString()
    )

    assert.entityCount('VisibilityBalance', 1)
    assert.fieldEquals(
      'VisibilityBalance',
      Bytes.fromUTF8(
        'x-test-0x0000000000000000000000000000000000000002'
      ).toHex(),
      'balance',
      '3'
    )

    newCreditsTradeEvent = createCreditsTradeEvent(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromString(visibilityId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBoolean(false), // isBuy
        ethereum.Value.fromUnsignedBigInt(tradeCost),
        ethereum.Value.fromUnsignedBigInt(creatorFee),
        ethereum.Value.fromUnsignedBigInt(protocolFee),
        ethereum.Value.fromUnsignedBigInt(referrerFee),
        ethereum.Value.fromUnsignedBigInt(partnerFee),
        ethereum.Value.fromAddress(referrer),
        ethereum.Value.fromAddress(partner),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))
      ])
    )
    handleCreditsTrade(newCreditsTradeEvent)

    assert.entityCount('VisibilityBalance', 1)
    assert.fieldEquals(
      'VisibilityBalance',
      Bytes.fromUTF8(
        'x-test-0x0000000000000000000000000000000000000002'
      ).toHex(),
      'balance',
      '0'
    )
  })

  test('CreditsTransfer', () => {
    let newCreditsTradeEvent = createCreditsTradeEvent(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromString(visibilityId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBoolean(true), // isBuy
        ethereum.Value.fromUnsignedBigInt(tradeCost),
        ethereum.Value.fromUnsignedBigInt(creatorFee),
        ethereum.Value.fromUnsignedBigInt(protocolFee),
        ethereum.Value.fromUnsignedBigInt(referrerFee),
        ethereum.Value.fromUnsignedBigInt(partnerFee),
        ethereum.Value.fromAddress(referrer),
        ethereum.Value.fromAddress(partner),
        ethereum.Value.fromUnsignedBigInt(newTotalSupply)
      ])
    )
    handleCreditsTrade(newCreditsTradeEvent)

    let newCreditsTransferEvent = createCreditsTransferEvent(
      visibilityId,
      from,
      to,
      amount.minus(BigInt.fromI32(1))
    )
    handleCreditsTransfer(newCreditsTransferEvent)

    assert.entityCount('CreditsTransfer', 1)
    assert.entityCount('VisibilityBalance', 2)

    assert.fieldEquals(
      'VisibilityBalance',
      Bytes.fromUTF8(
        'x-test-0x0000000000000000000000000000000000000002'
      ).toHex(),
      'balance',
      '1'
    )
    assert.fieldEquals(
      'VisibilityBalance',
      Bytes.fromUTF8(
        'x-test-0x0000000000000000000000000000000000000003'
      ).toHex(),
      'balance',
      '2'
    )
  })

  test('ReferrerPartnerSet', () => {
    let newReferrerPartnerSetEvent = createReferrerPartnerSetEvent(
      referrer,
      partner
    )
    handleReferrerPartnerSet(newReferrerPartnerSetEvent)

    assert.entityCount('ReferrerPartnerSet', 1)
    assert.fieldEquals(
      'ReferrerPartnerSet',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', // default mock tx hash / 0xa16081f360e3847006db660bae1c6d1b2e17ec2a
      'referrer',
      '0x0000000000000000000000000000000000000004'
    )
    assert.fieldEquals(
      'ReferrerPartnerSet',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'partner',
      '0x0000000000000000000000000000000000000005'
    )
  })
})
