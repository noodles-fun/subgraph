import { newMockEvent } from 'matchstick-as'
import { ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts'
import {
  ServiceCreated,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionInformation,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated
} from '../generated/VisibilityServices/VisibilityServices'

export function createServiceCreatedEvent(
  originator: Address,
  nonce: BigInt,
  serviceType: string,
  visibilityId: string,
  creditsCostAmount: BigInt
): ServiceCreated {
  let serviceCreatedEvent = changetype<ServiceCreated>(newMockEvent())

  serviceCreatedEvent.parameters = new Array()

  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'originator',
      ethereum.Value.fromAddress(originator)
    )
  )

  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam('nonce', ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceType',
      ethereum.Value.fromString(serviceType)
    )
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'creditsCostAmount',
      ethereum.Value.fromUnsignedBigInt(creditsCostAmount)
    )
  )

  return serviceCreatedEvent
}

export function createServiceExecutionAcceptedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  responseData: string
): ServiceExecutionAccepted {
  let serviceExecutionAcceptedEvent =
    changetype<ServiceExecutionAccepted>(newMockEvent())

  serviceExecutionAcceptedEvent.parameters = new Array()

  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      'responseData',
      ethereum.Value.fromString(responseData)
    )
  )

  return serviceExecutionAcceptedEvent
}

export function createServiceExecutionCanceledEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  from: Address,
  cancelData: string
): ServiceExecutionCanceled {
  let serviceExecutionCanceledEvent =
    changetype<ServiceExecutionCanceled>(newMockEvent())

  serviceExecutionCanceledEvent.parameters = new Array()

  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam('cancelData', ethereum.Value.fromString(cancelData))
  )

  return serviceExecutionCanceledEvent
}

export function createServiceExecutionDisputedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  disputeData: string
): ServiceExecutionDisputed {
  let serviceExecutionDisputedEvent =
    changetype<ServiceExecutionDisputed>(newMockEvent())

  serviceExecutionDisputedEvent.parameters = new Array()

  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      'disputeData',
      ethereum.Value.fromString(disputeData)
    )
  )

  return serviceExecutionDisputedEvent
}

export function createServiceExecutionInformationEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  user: Address,
  fromCreator: boolean,
  fromRequester: boolean,
  fromDisputeResolver: boolean,
  informationData: string
): ServiceExecutionInformation {
  let serviceExecutionInformationEvent =
    changetype<ServiceExecutionInformation>(newMockEvent())

  serviceExecutionInformationEvent.parameters = new Array()

  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  )

  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'fromCreator',
      ethereum.Value.fromBoolean(fromCreator)
    )
  )

  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'fromRequester',
      ethereum.Value.fromBoolean(fromRequester)
    )
  )

  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'fromDisputeResolver',
      ethereum.Value.fromBoolean(fromDisputeResolver)
    )
  )

  serviceExecutionInformationEvent.parameters.push(
    new ethereum.EventParam(
      'informationData',
      ethereum.Value.fromString(informationData)
    )
  )

  return serviceExecutionInformationEvent
}

export function createServiceExecutionRequestedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  requester: Address,
  requestData: string
): ServiceExecutionRequested {
  let serviceExecutionRequestedEvent =
    changetype<ServiceExecutionRequested>(newMockEvent())

  serviceExecutionRequestedEvent.parameters = new Array()

  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam('requester', ethereum.Value.fromAddress(requester))
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      'requestData',
      ethereum.Value.fromString(requestData)
    )
  )

  return serviceExecutionRequestedEvent
}

export function createServiceExecutionResolvedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  refund: boolean,
  resolveData: string
): ServiceExecutionResolved {
  let serviceExecutionResolvedEvent =
    changetype<ServiceExecutionResolved>(newMockEvent())

  serviceExecutionResolvedEvent.parameters = new Array()

  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam('refund', ethereum.Value.fromBoolean(refund))
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      'resolveData',
      ethereum.Value.fromString(resolveData)
    )
  )

  return serviceExecutionResolvedEvent
}

export function createServiceExecutionValidatedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt
): ServiceExecutionValidated {
  let serviceExecutionValidatedEvent =
    changetype<ServiceExecutionValidated>(newMockEvent())

  serviceExecutionValidatedEvent.parameters = new Array()

  serviceExecutionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      'executionNonce',
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )

  return serviceExecutionValidatedEvent
}

export function createServiceUpdatedEvent(
  nonce: BigInt,
  enabled: boolean
): ServiceUpdated {
  let serviceUpdatedEvent = changetype<ServiceUpdated>(newMockEvent())

  serviceUpdatedEvent.parameters = new Array()

  serviceUpdatedEvent.parameters.push(
    new ethereum.EventParam('nonce', ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceUpdatedEvent.parameters.push(
    new ethereum.EventParam('enabled', ethereum.Value.fromBoolean(enabled))
  )

  return serviceUpdatedEvent
}
