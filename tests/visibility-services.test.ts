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
  createServiceCreatedEvent,
  createServiceExecutionAcceptedEvent,
  createServiceExecutionCanceledEvent,
  createServiceExecutionDisputedEvent,
  createServiceExecutionRequestedEvent,
  createServiceExecutionResolvedEvent,
  createServiceExecutionValidatedEvent,
  createServiceUpdatedEvent
} from './visibility-services-utils'
import {
  handleServiceCreated,
  handleServiceExecutionAccepted,
  handleServiceExecutionCanceled,
  handleServiceExecutionDisputed,
  handleServiceExecutionRequested,
  handleServiceExecutionResolved,
  handleServiceExecutionValidated,
  handleServiceUpdated
} from '../src/visibility-services'
import { ServiceCreated } from '../generated/schema'

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

describe('VisibilityServices', () => {
  beforeAll(() => {
    let newServiceCreatedEvent = createServiceCreatedEvent(
      servNonce1,
      serviceType1,
      visibilityId,
      creditsCostAmount
    )
    handleServiceCreated(newServiceCreatedEvent)

    newServiceCreatedEvent = createServiceCreatedEvent(
      servNonce2,
      serviceType2,
      visibilityId,
      creditsCostAmount.plus(BigInt.fromI32(1))
    )
    handleServiceCreated(newServiceCreatedEvent)

    let newServiceExecutionRequestedEvent =
      createServiceExecutionRequestedEvent(
        servNonce1,
        execNonce11,
        requester1,
        'requestData1'
      )
    handleServiceExecutionRequested(newServiceExecutionRequestedEvent)
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
      '2-11',
      'state',
      'REQUESTED'
    )
    assert.fieldEquals(
      'VisibilityServiceExecution',
      '2-11',
      'requestData',
      'requestData21'
    )
  })

  test('ServiceExecutionAccepted', () => {
    assert.fieldEquals(
      'VisibilityServiceExecution',
      '1-11',
      'state',
      'ACCEPTED'
    )
    assert.fieldEquals(
      'VisibilityServiceExecution',
      '1-11',
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
      '1-11',
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
      '1-12',
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
      '1-12',
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
      '2-11',
      'state',
      'VALIDATED'
    )
  })

  test('ServiceExecutionValidated', () => {
    let newServiceExecutionValidatedEvent =
      createServiceExecutionValidatedEvent(servNonce2, execNonce21)
    handleServiceExecutionValidated(newServiceExecutionValidatedEvent)

    assert.fieldEquals(
      'VisibilityServiceExecution',
      '2-11',
      'state',
      'VALIDATED'
    )
  })

  test('ServiceUpdated', () => {
    assert.fieldEquals('VisibilityService', '1', 'enabled', 'true')

    let newServiceCreatedEvent = createServiceUpdatedEvent(servNonce1, false)
    handleServiceUpdated(newServiceCreatedEvent)
    assert.fieldEquals('VisibilityService', '1', 'enabled', 'false')
  })
})
