import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  CreatorFeeClaimed as CreatorFeeClaimedEvent,
  CreatorVisibilitySet as CreatorVisibilitySetEvent,
  CreditsTrade as CreditsTradeEvent,
  CreditsTransfer as CreditsTransferEvent,
  ReferrerPartnerSet as ReferrerPartnerSetEvent
} from '../generated/VisibilityCredits/VisibilityCredits'
import {
  CreatorFeeClaimed,
  CreatorVisibilitySet,
  CreditsTrade,
  CreditsTransfer,
  ReferrerPartnerSet,
  Visibility,
  VisibilityBalance
} from '../generated/schema'
// import { log } from 'matchstick-as'

export function computeNewCurrentPrice(totalSupply: BigInt): BigInt {
  const A = BigInt.fromU64(15000000000) // 0.000000015 ether;
  const B = BigInt.fromU64(25000000000000) // 0.000025 ether;
  const BASE_PRICE = BigInt.fromU64(10000000000000000) // 0.01 ether;

  // BASE_PRICE + (A * (totalSupply ** 2)) + (B * totalSupply);
  return BASE_PRICE.plus(A.times(totalSupply.pow(2))).plus(B.times(totalSupply))
}

export function handleCreatorFeeClaimed(event: CreatorFeeClaimedEvent): void {
  let entity = new CreatorFeeClaimed('auto')
  entity.creator = event.params.creator
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreatorVisibilitySet(
  event: CreatorVisibilitySetEvent
): void {
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
  visibility.creator = event.params.creator
  visibility.metadata = event.params.metadata
  visibility.save()

  /////

  let entity = new CreatorVisibilitySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibility = visibility.id
  entity.creator = event.params.creator
  entity.metadata = event.params.metadata

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreditsTrade(event: CreditsTradeEvent): void {
  let visibility = Visibility.load(
    Bytes.fromUTF8(event.params.tradeEvent.visibilityId)
  )
  if (!visibility) {
    visibility = Visibility.loadInBlock(
      Bytes.fromUTF8(event.params.tradeEvent.visibilityId)
    )
  }
  if (!visibility) {
    visibility = new Visibility(
      Bytes.fromUTF8(event.params.tradeEvent.visibilityId)
    )
    visibility.visibilityId = event.params.tradeEvent.visibilityId
  }
  visibility.currentPrice = computeNewCurrentPrice(
    event.params.tradeEvent.newTotalSupply
  )
  visibility.totalSupply = event.params.tradeEvent.newTotalSupply
  visibility.save()

  let visibilityBalance = VisibilityBalance.load(
    Bytes.fromUTF8(
      event.params.tradeEvent.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.tradeEvent.from.toHexString())
    )
  )
  if (!visibilityBalance) {
    visibilityBalance = VisibilityBalance.loadInBlock(
      Bytes.fromUTF8(
        event.params.tradeEvent.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.tradeEvent.from.toHexString())
      )
    )
  }
  if (!visibilityBalance) {
    visibilityBalance = new VisibilityBalance(
      Bytes.fromUTF8(
        event.params.tradeEvent.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.tradeEvent.from.toHexString())
      )
    )
    visibilityBalance.visibility = visibility.id
    visibilityBalance.userAddress = event.params.tradeEvent.from
    visibilityBalance.balance = BigInt.fromI32(0)
  }

  visibilityBalance.balance = event.params.tradeEvent.isBuy
    ? visibilityBalance.balance.plus(event.params.tradeEvent.amount)
    : visibilityBalance.balance.minus(event.params.tradeEvent.amount)

  visibilityBalance.save()

  let entity = new CreditsTrade('auto')
  entity.userAddress = event.params.tradeEvent.from
  entity.userInBigInt = BigInt.fromByteArray(event.params.tradeEvent.from)
  entity.visibility = visibility.id
  entity.amount = event.params.tradeEvent.amount
  entity.isBuy = event.params.tradeEvent.isBuy
  entity.buyCost = event.params.tradeEvent.isBuy
    ? event.params.tradeEvent.tradeCost
        .plus(event.params.tradeEvent.creatorFee)
        .plus(event.params.tradeEvent.protocolFee)
        .plus(event.params.tradeEvent.referrerFee)
        .plus(event.params.tradeEvent.partnerFee)
    : BigInt.fromI32(0)
  entity.sellReimbursement = event.params.tradeEvent.isBuy
    ? BigInt.fromI32(0)
    : event.params.tradeEvent.tradeCost
        .minus(event.params.tradeEvent.creatorFee)
        .minus(event.params.tradeEvent.protocolFee)
        .minus(event.params.tradeEvent.referrerFee)
        .minus(event.params.tradeEvent.partnerFee)

  entity.tradeCost = event.params.tradeEvent.tradeCost
  entity.creatorFee = event.params.tradeEvent.creatorFee
  entity.protocolFee = event.params.tradeEvent.protocolFee
  entity.referrerFee = event.params.tradeEvent.referrerFee
  entity.partnerFee = event.params.tradeEvent.partnerFee
  entity.referrer = event.params.tradeEvent.referrer
  entity.partner = event.params.tradeEvent.partner
  entity.newTotalSupply = event.params.tradeEvent.newTotalSupply
  entity.newCurrentPrice = computeNewCurrentPrice(
    event.params.tradeEvent.newTotalSupply
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreditsTransfer(event: CreditsTransferEvent): void {
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

  let visibilityBalanceFrom = VisibilityBalance.load(
    Bytes.fromUTF8(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.from.toHexString())
    )
  )
  if (!visibilityBalanceFrom) {
    visibilityBalanceFrom = VisibilityBalance.loadInBlock(
      Bytes.fromUTF8(
        event.params.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.from.toHexString())
      )
    )
  }
  if (!visibilityBalanceFrom) {
    visibilityBalanceFrom = new VisibilityBalance(
      Bytes.fromUTF8(
        event.params.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.from.toHexString())
      )
    )
    visibilityBalanceFrom.visibility = visibility.id
    visibilityBalanceFrom.userAddress = event.params.from
    visibilityBalanceFrom.balance = BigInt.fromI32(0)
  }

  let visibilityBalanceTo = VisibilityBalance.load(
    Bytes.fromUTF8(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.to.toHexString())
    )
  )

  if (!visibilityBalanceTo) {
    visibilityBalanceTo = VisibilityBalance.loadInBlock(
      Bytes.fromUTF8(
        event.params.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.to.toHexString())
      )
    )
  }
  if (!visibilityBalanceTo) {
    visibilityBalanceTo = new VisibilityBalance(
      Bytes.fromUTF8(
        event.params.visibilityId
          .toString()
          .concat('-')
          .concat(event.params.to.toHexString())
      )
    )
    visibilityBalanceTo.visibility = visibility.id
    visibilityBalanceTo.userAddress = event.params.to
    visibilityBalanceTo.balance = BigInt.fromI32(0)
  }

  visibilityBalanceFrom.balance = visibilityBalanceFrom.balance.minus(
    event.params.amount
  )
  visibilityBalanceTo.balance = visibilityBalanceTo.balance.plus(
    event.params.amount
  )

  visibilityBalanceFrom.save()
  visibilityBalanceTo.save()

  let entity = new CreditsTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibility = visibility.id
  entity.userAddress = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferrerPartnerSet(event: ReferrerPartnerSetEvent): void {
  let entity = new ReferrerPartnerSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.referrer = event.params.referrer
  entity.partner = event.params.partner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
