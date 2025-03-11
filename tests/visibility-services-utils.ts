import { newMockEvent } from 'matchstick-as'
import { ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts'
import {
  BuyBack,
  BuyBackPoolUpdated,
  ServiceBuyBackUpdated,
  ServiceCreated,
  ServiceWithETHCreated,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionEthPayment,
  ServiceExecutionInformation,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated
} from '../generated/VisibilityServices/VisibilityServices'

export function createBuyBackEvent(
  visibilityId: string,
  totalWeiCost: BigInt,
  creditsAmount: BigInt
): BuyBack {
  let buyBackEvent = changetype<BuyBack>(newMockEvent())

  buyBackEvent.parameters = new Array()

  buyBackEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  buyBackEvent.parameters.push(
    new ethereum.EventParam(
      'totalWeiCost',
      ethereum.Value.fromUnsignedBigInt(totalWeiCost)
    )
  )
  buyBackEvent.parameters.push(
    new ethereum.EventParam(
      'creditsAmount',
      ethereum.Value.fromUnsignedBigInt(creditsAmount)
    )
  )

  return buyBackEvent
}

export function createBuyBackPoolUpdatedEvent(
  visibilityId: string,
  isBuyBack: boolean,
  weiAmount: BigInt
): BuyBackPoolUpdated {
  let buyBackPoolUpdatedEvent = changetype<BuyBackPoolUpdated>(newMockEvent())

  buyBackPoolUpdatedEvent.parameters = new Array()

  buyBackPoolUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  buyBackPoolUpdatedEvent.parameters.push(
    new ethereum.EventParam('isBuyBack', ethereum.Value.fromBoolean(isBuyBack))
  )
  buyBackPoolUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'weiAmount',
      ethereum.Value.fromUnsignedBigInt(weiAmount)
    )
  )

  return buyBackPoolUpdatedEvent
}

export function createServiceBuyBackUpdatedEvent(
  nonce: BigInt,
  buyBackCreditsShare: BigInt
): ServiceBuyBackUpdated {
  let serviceBuyBackUpdatedEvent =
    changetype<ServiceBuyBackUpdated>(newMockEvent())

  serviceBuyBackUpdatedEvent.parameters = new Array()

  serviceBuyBackUpdatedEvent.parameters.push(
    new ethereum.EventParam('nonce', ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceBuyBackUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'buyBackCreditsShare',
      ethereum.Value.fromUnsignedBigInt(buyBackCreditsShare)
    )
  )

  return serviceBuyBackUpdatedEvent
}

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

export function createServiceWithETHCreatedEvent(
  originator: Address,
  nonce: BigInt,
  serviceType: string,
  visibilityId: string,
  buyBackCreditsShare: BigInt,
  weiCostAmount: BigInt
): ServiceWithETHCreated {
  let serviceWithETHCreatedEvent =
    changetype<ServiceWithETHCreated>(newMockEvent())

  serviceWithETHCreatedEvent.parameters = new Array()

  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'originator',
      ethereum.Value.fromAddress(originator)
    )
  )

  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam('nonce', ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'serviceType',
      ethereum.Value.fromString(serviceType)
    )
  )
  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'buyBackCreditsShare',
      ethereum.Value.fromUnsignedBigInt(buyBackCreditsShare)
    )
  )
  serviceWithETHCreatedEvent.parameters.push(
    new ethereum.EventParam(
      'weiCostAmount',
      ethereum.Value.fromUnsignedBigInt(weiCostAmount)
    )
  )

  return serviceWithETHCreatedEvent
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

export function createServiceExecutionEthPaymentEvent(
  serviceNonce: BigInt,
  protocolAmount: BigInt,
  creatorAmount: BigInt,
  buyBackAmount: BigInt
): ServiceExecutionEthPayment {
  let serviceExecutionEthPaymentEvent =
    changetype<ServiceExecutionEthPayment>(newMockEvent())

  serviceExecutionEthPaymentEvent.parameters = new Array()

  serviceExecutionEthPaymentEvent.parameters.push(
    new ethereum.EventParam(
      'serviceNonce',
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionEthPaymentEvent.parameters.push(
    new ethereum.EventParam(
      'protocolAmount',
      ethereum.Value.fromUnsignedBigInt(protocolAmount)
    )
  )
  serviceExecutionEthPaymentEvent.parameters.push(
    new ethereum.EventParam(
      'creatorAmount',
      ethereum.Value.fromUnsignedBigInt(creatorAmount)
    )
  )
  serviceExecutionEthPaymentEvent.parameters.push(
    new ethereum.EventParam(
      'buyBackAmount',
      ethereum.Value.fromUnsignedBigInt(buyBackAmount)
    )
  )

  return serviceExecutionEthPaymentEvent
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
