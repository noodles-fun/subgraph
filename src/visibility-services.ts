import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  BuyBack as BuyBackEvent,
  BuyBackPoolUpdated as BuyBackPoolUpdatedEvent,
  ServiceBuyBackUpdated as ServiceBuyBackUpdatedEvent,
  ServiceCreated as ServiceCreatedEvent,
  ServiceWithETHCreated as ServiceWithETHCreatedEvent,
  ServiceExecutionAccepted as ServiceExecutionAcceptedEvent,
  ServiceExecutionCanceled as ServiceExecutionCanceledEvent,
  ServiceExecutionDisputed as ServiceExecutionDisputedEvent,
  ServiceExecutionInformation as ServiceExecutionInformationEvent,
  ServiceExecutionRequested as ServiceExecutionRequestedEvent,
  ServiceExecutionResolved as ServiceExecutionResolvedEvent,
  ServiceExecutionValidated as ServiceExecutionValidatedEvent,
  ServiceUpdated as ServiceUpdatedEvent
} from '../generated/VisibilityServices/VisibilityServices'
import {
  BuyBack,
  BuyBackPoolUpdated,
  ServiceBuyBackUpdated,
  ServiceCreated,
  ServiceWithETHCreated,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionInformation,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated,
  User,
  Visibility,
  VisibilityService,
  VisibilityServiceExecution
} from '../generated/schema'

export function handleBuyBack(event: BuyBackEvent): void {
  let visibility = Visibility.load(Bytes.fromUTF8(event.params.visibilityId))
  if (!visibility) {
    visibility = Visibility.loadInBlock(
      Bytes.fromUTF8(event.params.visibilityId)
    )
  }
  if (visibility) {
    let entity = new BuyBack(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.visibility = visibility.id
    entity.weiCost = event.params.totalWeiCost
    entity.creditsAmount = event.params.creditsAmount

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
  }
}

export function handleBuyBackPoolUpdated(event: BuyBackPoolUpdatedEvent): void {
  let visibility = Visibility.load(Bytes.fromUTF8(event.params.visibilityId))
  if (!visibility) {
    visibility = Visibility.loadInBlock(
      Bytes.fromUTF8(event.params.visibilityId)
    )
  }
  if (visibility) {
    visibility.buyBackEthBalance = event.params.isBuyBack
      ? visibility.buyBackEthBalance.minus(event.params.weiAmount)
      : visibility.buyBackEthBalance.plus(event.params.weiAmount)
    visibility.save()

    let entity = new BuyBackPoolUpdated(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.visibility = visibility.id
    entity.isBuyBack = event.params.isBuyBack
    entity.weiAmount = event.params.weiAmount
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
  }
}

export function handleServiceBuyBackUpdated(
  event: ServiceBuyBackUpdatedEvent
): void {
  let visibilityService = VisibilityService.load(
    Bytes.fromUTF8(event.params.nonce.toString())
  )
  if (!visibilityService) {
    visibilityService = VisibilityService.loadInBlock(
      Bytes.fromUTF8(event.params.nonce.toString())
    )
  }
  if (visibilityService) {
    visibilityService.buyBackCreditsShare = event.params.buyBackCreditsShare
    visibilityService.save()
  }

  let entity = new ServiceBuyBackUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nonce = event.params.nonce
  entity.buyBackCreditsShare = event.params.buyBackCreditsShare
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceCreated(event: ServiceCreatedEvent): void {
  let user = User.load(event.params.originator)
  if (!user) {
    user = User.loadInBlock(event.params.originator)
  }
  if (!user) {
    user = new User(event.params.originator)
    user.save()
  }

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
    visibility.claimableFeeBalance = BigInt.fromI32(0)
    visibility.buyBackEthBalance = BigInt.fromI32(0)
  }
  visibility.save()

  let visibilityService = new VisibilityService(
    Bytes.fromUTF8(event.params.nonce.toString())
  )
  visibilityService.serviceNonce = event.params.nonce
  visibilityService.paymentType = 'VISIBILITY_CREDITS'
  visibilityService.originator = user.id
  visibilityService.visibility = visibility.id
  visibilityService.serviceType = event.params.serviceType
  visibilityService.creditsCostAmount = event.params.creditsCostAmount
  visibilityService.enabled = true
  visibilityService.weiCostAmount = BigInt.fromI32(0)
  visibilityService.buyBackCreditsShare = BigInt.fromI32(0)
  visibilityService.save()

  let entity = new ServiceCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.originator = user.id
  entity.nonce = event.params.nonce
  entity.serviceType = event.params.serviceType
  entity.visibility = visibility.id
  entity.creditsCostAmount = event.params.creditsCostAmount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleServiceWithETHCreated(
  event: ServiceWithETHCreatedEvent
): void {
  let user = User.load(event.params.originator)
  if (!user) {
    user = User.loadInBlock(event.params.originator)
  }
  if (!user) {
    user = new User(event.params.originator)
    user.save()
  }

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
    visibility.claimableFeeBalance = BigInt.fromI32(0)
    visibility.buyBackEthBalance = BigInt.fromI32(0)
  }
  visibility.save()

  let visibilityService = new VisibilityService(
    Bytes.fromUTF8(event.params.nonce.toString())
  )
  visibilityService.serviceNonce = event.params.nonce
  visibilityService.paymentType = 'ETH'
  visibilityService.originator = user.id
  visibilityService.visibility = visibility.id
  visibilityService.serviceType = event.params.serviceType
  visibilityService.creditsCostAmount = BigInt.fromI32(0)
  visibilityService.enabled = true
  visibilityService.weiCostAmount = event.params.weiCostAmount
  visibilityService.buyBackCreditsShare = event.params.buyBackCreditsShare
  visibilityService.save()

  let entity = new ServiceWithETHCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.originator = user.id
  entity.nonce = event.params.nonce
  entity.serviceType = event.params.serviceType
  entity.visibility = visibility.id
  entity.buyBackCreditsShare = event.params.buyBackCreditsShare
  entity.weiCostAmount = event.params.weiCostAmount
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
    let canceler = User.load(event.params.from)
    if (!canceler) {
      canceler = User.loadInBlock(event.params.from)
    }
    if (!canceler) {
      canceler = new User(event.params.from)
      canceler.save()
    }
    serviceExecution.canceler = canceler.id

    serviceExecution.state = 'REFUNDED'
    serviceExecution.cancelData = event.params.cancelData
    serviceExecution.lastUpdated = event.block.timestamp
    serviceExecution.save()
  }

  let user = User.load(event.params.from)
  if (!user) {
    user = User.loadInBlock(event.params.from)
  }
  if (!user) {
    user = new User(event.params.from)
    user.save()
  }

  let entity = new ServiceExecutionCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.user = user.id
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

export function handleServiceExecutionInformation(
  event: ServiceExecutionInformationEvent
): void {
  let user = User.load(event.params.user)
  if (!user) {
    user = User.loadInBlock(event.params.user)
  }
  if (!user) {
    user = new User(event.params.user)
    user.save()
  }

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
    let entity = new ServiceExecutionInformation(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.serviceNonce = event.params.serviceNonce
    entity.executionNonce = event.params.executionNonce
    entity.serviceExecution = serviceExecution.id
    entity.user = user.id
    entity.fromCreator = event.params.fromCreator
    entity.fromRequester = event.params.fromRequester
    entity.fromDisputeResolver = event.params.fromDisputeResolver
    entity.informationData = event.params.informationData
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
  }
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

    let user = User.load(event.params.requester)
    if (!user) {
      user = User.loadInBlock(event.params.requester)
    }
    if (!user) {
      user = new User(event.params.requester)
      user.save()
    }

    serviceExecution.state = 'REQUESTED'
    serviceExecution.service = service.id
    serviceExecution.executionNonce = event.params.executionNonce
    serviceExecution.requester = user.id
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
