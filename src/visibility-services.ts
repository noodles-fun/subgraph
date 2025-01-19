import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  ServiceCreated as ServiceCreatedEvent,
  ServiceExecutionAccepted as ServiceExecutionAcceptedEvent,
  ServiceExecutionCanceled as ServiceExecutionCanceledEvent,
  ServiceExecutionDisputed as ServiceExecutionDisputedEvent,
  ServiceExecutionRequested as ServiceExecutionRequestedEvent,
  ServiceExecutionResolved as ServiceExecutionResolvedEvent,
  ServiceExecutionValidated as ServiceExecutionValidatedEvent,
  ServiceUpdated as ServiceUpdatedEvent
} from '../generated/VisibilityServices/VisibilityServices'
import {
  ServiceCreated,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated,
  Visibility,
  VisibilityService,
  VisibilityServiceExecution
} from '../generated/schema'

export function handleServiceCreated(event: ServiceCreatedEvent): void {
  let visibility = Visibility.load(Bytes.fromUTF8(event.params.visibilityId))
  if (!visibility) {
    visibility = Visibility.loadInBlock(
      Bytes.fromUTF8(event.params.visibilityId)
    )
  }
  if (!visibility) {
    visibility = new Visibility(Bytes.fromUTF8(event.params.visibilityId))
    visibility.visibilityId = event.params.visibilityId
    visibility.currentPrice = BigInt.fromI32(0)
    visibility.totalSupply = BigInt.fromI32(0)
  }
  visibility.save()

  let visibilityService = new VisibilityService(
    Bytes.fromUTF8(event.params.nonce.toString())
  )
  visibilityService.serviceNonce = event.params.nonce
  visibilityService.visibility = visibility.id
  visibilityService.serviceType = event.params.serviceType
  visibilityService.creditsCostAmount = event.params.creditsCostAmount
  visibilityService.enabled = true
  visibilityService.save()

  let entity = new ServiceCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nonce = event.params.nonce
  entity.serviceType = event.params.serviceType
  entity.visibility = visibility.id
  entity.creditsCostAmount = event.params.creditsCostAmount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleServiceExecutionAccepted(
  event: ServiceExecutionAcceptedEvent
): void {
  let serviceExecution = VisibilityServiceExecution.load(
    Bytes.fromUTF8(
      event.params.serviceNonce
        .toString()
        .concat('-')
        .concat(event.params.executionNonce.toString())
    )
  )
  if (!serviceExecution) {
    VisibilityServiceExecution.loadInBlock(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
  }

  if (serviceExecution) {
    serviceExecution.state = 'ACCEPTED'
    serviceExecution.responseData = event.params.responseData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionAccepted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.responseData = event.params.responseData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionCanceled(
  event: ServiceExecutionCanceledEvent
): void {
  let serviceExecution = VisibilityServiceExecution.load(
    Bytes.fromUTF8(
      event.params.serviceNonce
        .toString()
        .concat('-')
        .concat(event.params.executionNonce.toString())
    )
  )
  if (!serviceExecution) {
    VisibilityServiceExecution.loadInBlock(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
  }

  if (serviceExecution != null) {
    serviceExecution.state = 'REFUNDED'
    serviceExecution.cancelData = event.params.cancelData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.userAddress = event.params.from
  entity.cancelData = event.params.cancelData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionDisputed(
  event: ServiceExecutionDisputedEvent
): void {
  let serviceExecution = VisibilityServiceExecution.load(
    Bytes.fromUTF8(
      event.params.serviceNonce
        .toString()
        .concat('-')
        .concat(event.params.executionNonce.toString())
    )
  )
  if (!serviceExecution) {
    VisibilityServiceExecution.loadInBlock(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
  }

  if (serviceExecution) {
    serviceExecution.state = 'DISPUTED'
    serviceExecution.disputeData = event.params.disputeData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionDisputed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.disputeData = event.params.disputeData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionRequested(
  event: ServiceExecutionRequestedEvent
): void {
  let service = VisibilityService.load(
    Bytes.fromUTF8(event.params.serviceNonce.toString())
  )
  if (!service) {
    service = VisibilityService.loadInBlock(
      Bytes.fromUTF8(event.params.serviceNonce.toString())
    )
  }
  if (service) {
    let serviceExecution = new VisibilityServiceExecution(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
    serviceExecution.state = 'REQUESTED'
    serviceExecution.service = service.id
    serviceExecution.executionNonce = event.params.executionNonce
    serviceExecution.requester = event.params.requester
    serviceExecution.requestData = event.params.requestData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.requester = event.params.requester
  entity.requestData = event.params.requestData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionResolved(
  event: ServiceExecutionResolvedEvent
): void {
  let serviceExecution = VisibilityServiceExecution.load(
    Bytes.fromUTF8(
      event.params.serviceNonce
        .toString()
        .concat('-')
        .concat(event.params.executionNonce.toString())
    )
  )
  if (!serviceExecution) {
    VisibilityServiceExecution.loadInBlock(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
  }

  if (serviceExecution) {
    if (event.params.refund) {
      serviceExecution.state = 'REFUNDED'
    } else {
      serviceExecution.state = 'VALIDATED'
    }
    serviceExecution.resolveData = event.params.resolveData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.refund = event.params.refund
  entity.resolveData = event.params.resolveData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionValidated(
  event: ServiceExecutionValidatedEvent
): void {
  let serviceExecution = VisibilityServiceExecution.load(
    Bytes.fromUTF8(
      event.params.serviceNonce
        .toString()
        .concat('-')
        .concat(event.params.executionNonce.toString())
    )
  )
  if (!serviceExecution) {
    VisibilityServiceExecution.loadInBlock(
      Bytes.fromUTF8(
        event.params.serviceNonce
          .toString()
          .concat('-')
          .concat(event.params.executionNonce.toString())
      )
    )
  }

  if (serviceExecution) {
    serviceExecution.state = 'VALIDATED'
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let entity = new ServiceExecutionValidated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceUpdated(event: ServiceUpdatedEvent): void {
  let visibilityService = VisibilityService.load(
    Bytes.fromUTF8(event.params.nonce.toString())
  )
  if (!visibilityService) {
    visibilityService = VisibilityService.loadInBlock(
      Bytes.fromUTF8(event.params.nonce.toString())
    )
  }
  if (visibilityService) {
    visibilityService.enabled = event.params.enabled
    visibilityService.save()
  }

  let entity = new ServiceUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nonce = event.params.nonce
  entity.enabled = event.params.enabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
