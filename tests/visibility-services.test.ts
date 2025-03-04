import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from 'matchstick-as/assembly/index'
import { BigInt, Address, Bytes } from '@graphprotocol/graph-ts'
import {
  createBuyBackEvent,
  createBuyBackPoolUpdatedEvent,
  createServiceBuyBackUpdatedEvent,
  createServiceCreatedEvent,
  createServiceExecutionAcceptedEvent,
  createServiceExecutionCanceledEvent,
  createServiceExecutionDisputedEvent,
  createServiceExecutionInformationEvent,
  createServiceExecutionRequestedEvent,
  createServiceExecutionResolvedEvent,
  createServiceExecutionValidatedEvent,
  createServiceUpdatedEvent,
  createServiceWithETHCreatedEvent
} from './visibility-services-utils'
import {
  handleBuyBack,
  handleBuyBackPoolUpdated,
  handleServiceBuyBackUpdated,
  handleServiceCreated,
  handleServiceExecutionAccepted,
  handleServiceExecutionCanceled,
  handleServiceExecutionDisputed,
  handleServiceExecutionInformation,
  handleServiceExecutionRequested,
  handleServiceExecutionResolved,
  handleServiceExecutionValidated,
  handleServiceUpdated,
  handleServiceWithETHCreated
} from '../src/visibility-services'

let creator = Address.fromString('0x0000000000000000000000000000000000000001')
let requester1 = Address.fromString(
  '0x0000000000000000000000000000000000000011'
)
let requester2 = Address.fromString(
  '0x0000000000000000000000000000000000000022'
)
let servNonce1 = BigInt.fromI32(1)
let execNonce11 = BigInt.fromI32(11)
let execNonce12 = BigInt.fromI32(12)
let servNonce2 = BigInt.fromI32(2)
let execNonce21 = BigInt.fromI32(11)
let serviceType1 = 'x-post1'
let serviceType2 = 'x-post2'
let visibilityId = 'x-test'
let creditsCostAmount = BigInt.fromI32(5)
let buyBackCreditsShare = BigInt.fromI32(500000)
let weiCostAmount = BigInt.fromI32(55555555)

describe('VisibilityServices', () => {
  beforeAll(() => {
    let newServiceCreatedEvent = createServiceCreatedEvent(
      creator,
      servNonce1,
      serviceType1,
      visibilityId,
      creditsCostAmount
    )
    handleServiceCreated(newServiceCreatedEvent)

    let newServiceWithEthCreatedEvent = createServiceWithETHCreatedEvent(
      creator,
      servNonce2,
      serviceType2,
      visibilityId,
      buyBackCreditsShare,
      weiCostAmount
    )
    handleServiceWithETHCreated(newServiceWithEthCreatedEvent)

    let newServiceBuyBackUpdatedEvent = createServiceBuyBackUpdatedEvent(
      servNonce2,
      buyBackCreditsShare.plus(BigInt.fromI32(1))
    )
    handleServiceBuyBackUpdated(newServiceBuyBackUpdatedEvent)

    let newServiceExecutionRequestedEvent =
      createServiceExecutionRequestedEvent(
        servNonce1,
        execNonce11,
        requester1,
        'requestData1'
      )
    handleServiceExecutionRequested(newServiceExecutionRequestedEvent)

    let newServiceExecutionInformationEvent =
      createServiceExecutionInformationEvent(
        servNonce1,
        execNonce11,
        creator,
        true,
        false,
        false,
        'infoData11'
      )
    handleServiceExecutionInformation(newServiceExecutionInformationEvent)

    let newServiceExecutionAcceptedEvent = createServiceExecutionAcceptedEvent(
      servNonce1,
      execNonce11,
      'responseData11'
    )
    handleServiceExecutionAccepted(newServiceExecutionAcceptedEvent)

    newServiceExecutionRequestedEvent = createServiceExecutionRequestedEvent(
      servNonce1,
      execNonce12,
      requester1,
      'requestData12'
    )
    handleServiceExecutionRequested(newServiceExecutionRequestedEvent)

    newServiceExecutionRequestedEvent = createServiceExecutionRequestedEvent(
      servNonce2,
      execNonce21,
      requester2,
      'requestData21'
    )
    handleServiceExecutionRequested(newServiceExecutionRequestedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test('ServiceCreated', () => {
    assert.entityCount('Visibility', 1)
    assert.entityCount('VisibilityService', 2)
  })

  test('ServiceExecutionRequested', () => {
    assert.entityCount('VisibilityServiceExecution', 3)
    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('2-11').toHex(),
      'state',
      'REQUESTED'
    )
    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('2-11').toHex(),
      'requestData',
      'requestData21'
    )
  })

  test('ServiceExecutionInformation', () => {
    assert.fieldEquals(
      'ServiceExecutionInformation',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'informationData',
      'infoData11'
    )
  })

  test('ServiceExecutionAccepted', () => {
    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('1-11').toHex(),
      'state',
      'ACCEPTED'
    )
    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('1-11').toHex(),
      'responseData',
      'responseData11'
    )
  })

  test('ServiceExecutionCancelled', () => {
    let newServiceExecutionCancelledEvent = createServiceExecutionCanceledEvent(
      servNonce1,
      execNonce11,
      creator,
      'cancelData1'
    )
    handleServiceExecutionCanceled(newServiceExecutionCancelledEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('1-11').toHex(),
      'state',
      'REFUNDED'
    )
  })

  test('ServiceExecutionDisputed', () => {
    let newServiceExecutionDisputedEvent = createServiceExecutionDisputedEvent(
      servNonce1,
      execNonce12,
      'disputeData1'
    )
    handleServiceExecutionDisputed(newServiceExecutionDisputedEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('1-12').toHex(),
      'state',
      'DISPUTED'
    )
  })

  test('ServiceExecutionResolved', () => {
    let newServiceExecutionResolvedRefundedEvent =
      createServiceExecutionResolvedEvent(
        servNonce1,
        execNonce12,
        true,
        'resolveDataRefunded'
      )
    handleServiceExecutionResolved(newServiceExecutionResolvedRefundedEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('1-12').toHex(),
      'state',
      'REFUNDED'
    )

    let newServiceExecutionResolvedValidatedEvent =
      createServiceExecutionResolvedEvent(
        servNonce2,
        execNonce21,
        false,
        'resolveDataValidated'
      )
    handleServiceExecutionResolved(newServiceExecutionResolvedValidatedEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('2-11').toHex(),
      'state',
      'VALIDATED'
    )
  })

  test('ServiceExecutionValidated & Buy Back', () => {
    let newServiceExecutionValidatedEvent =
      createServiceExecutionValidatedEvent(servNonce2, execNonce21)
    handleServiceExecutionValidated(newServiceExecutionValidatedEvent)

    let newBuyBackPoolEvent = createBuyBackPoolUpdatedEvent(
      visibilityId,
      false,
      weiCostAmount
    )
    handleBuyBackPoolUpdated(newBuyBackPoolEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      Bytes.fromUTF8('2-11').toHex(),
      'state',
      'VALIDATED'
    )

    assert.entityCount('BuyBackPoolUpdated', 1)

    let newBuyBackEvent = createBuyBackEvent(
      visibilityId,
      weiCostAmount,
      BigInt.fromI32(1000)
    )
    handleBuyBack(newBuyBackEvent)

    assert.entityCount('BuyBack', 1)
  })

  test('ServiceUpdated', () => {
    assert.fieldEquals(
      'VisibilityService',
      Bytes.fromUTF8('1').toHex(),
      'enabled',
      'true'
    )

    let newServiceCreatedEvent = createServiceUpdatedEvent(servNonce1, false)
    handleServiceUpdated(newServiceCreatedEvent)
    assert.fieldEquals(
      'VisibilityService',
      Bytes.fromUTF8('1').toHex(),
      'enabled',
      'false'
    )
  })
})
