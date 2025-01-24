import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
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
  User,
  Visibility,
  VisibilityBalance
} from '../generated/schema'
// import { log } from 'matchstick-as'

export function isZeroAddr(addr: Bytes): boolean {
  return addr.toHexString() == '0x0000000000000000000000000000000000000000'
}

export const A = BigInt.fromU64(15000000000) // 0.000000015 ether;
export const B = BigInt.fromU64(25000000000000) // 0.000025 ether;
export const BASE_PRICE = BigInt.fromU64(10000000000000000) // 0.01 ether;

export function computeNewCurrentPrice(totalSupply: BigInt): BigInt {
  // newCurrentPrice = BASE_PRICE + (A * (totalSupply ** 2)) + (B * totalSupply);
  let newCurrentPrice = BASE_PRICE.plus(A.times(totalSupply.pow(2))).plus(
    B.times(totalSupply)
  )

  return newCurrentPrice
}

export function visibilityBalanceValue(
  visibilityTotalSupply: BigInt,
  amount: BigInt
): BigDecimal {
  let fromSupply = visibilityTotalSupply.minus(amount)

  if (amount == BigInt.fromI32(0)) {
    return BigDecimal.fromString('0')
  }

  // The ending index of the credit unit being considered.
  // toSupply = fromSupply + amount - 1;
  let toSupply: BigInt = fromSupply.plus(amount).minus(BigInt.fromI32(1))

  let sumSquares: BigInt
  let sumFirstN: BigInt

  if (fromSupply == BigInt.fromI32(0)) {
    // S2(n) calculates the cumulative sum of squares from k = 1 to n:
    //   S2(n) = ∑_{k=1}^{n} k² = n(n + 1)(2n + 1) / 6

    //  sumSquares = (toSupply * (toSupply + 1) * (2 * toSupply + 1)) / 6;
    sumSquares = toSupply
      .times(toSupply.plus(BigInt.fromI32(1)))
      .times(BigInt.fromI32(2).times(toSupply).plus(BigInt.fromI32(1)))
      .div(BigInt.fromI32(6))

    // S1(n) calculates the cumulative sum from k = 1 to n:
    //   S1(n) = ∑_{k=1}^{n} k = n(n + 1) / 2

    // sumFirstN = (toSupply * (toSupply + 1)) / 2;
    sumFirstN = toSupply
      .times(toSupply.plus(BigInt.fromI32(1)))
      .div(BigInt.fromI32(2))
  } else {
    //    S2(n) = ∑_{k=1}^{n} k² = S2(n) = ∑_{k=1}^{j-1} k² + ∑_{k=j}^{n} k²
    // Thus the sum of squares from fromSupply to toSupply is:
    //    ∑_{k=fromSupply}^{toSupply} k² = ∑_{k=1}^{toSupply} k² - ∑_{k=1}^{fromSupply - 1} k²
    //    ∑_{k=fromSupply}^{toSupply} k² =    S2(toSupply)    -        S2(fromSupply - 1)
    //    ∑_{k=fromSupply}^{toSupply} k² =    toSupply(toSupply + 1)(2*toSupply + 1) / 6 - ((fromSupply-1)((fromSupply -1) + 1)(2*(fromSupply -1) + 1)) / 6

    // sumSquaresTo = (toSupply * (toSupply + 1) * (2 * toSupply + 1)) / 6;
    let sumSquaresTo: BigInt = toSupply
      .times(toSupply.plus(BigInt.fromI32(1)))
      .times(BigInt.fromI32(2).times(toSupply).plus(BigInt.fromI32(1)))
      .div(BigInt.fromI32(6))

    // sumSquaresFrom = ((fromSupply - 1) * fromSupply * (2 * fromSupply - 1)) / 6;
    let sumSquaresFrom: BigInt = fromSupply
      .minus(BigInt.fromI32(1))
      .times(fromSupply)
      .times(BigInt.fromI32(2).times(fromSupply).minus(BigInt.fromI32(1)))
      .div(BigInt.fromI32(6))

    sumSquares = sumSquaresTo.minus(sumSquaresFrom)

    // Similarly,
    //   S1(n) = ∑_{k=1}^{n} k = ∑_{k=1}^{j-1} k + ∑_{k=j}^{n} k
    // Thus the sum from fromSupply to toSupply is:
    //   ∑_{k=fromSupply}^{toSupply} k = ∑_{k=1}^{n} k  - ∑_{k=1}^{j-1} k
    //   ∑_{k=fromSupply}^{toSupply} k = S1(toSupply)   - S1(fromSupply - 1)
    //   ∑_{k=fromSupply}^{toSupply} k = toSupply(toSupply + 1) / 2 - (fromSupply - 1)((fromSupply - 1) + 1) / 2

    // sumFirstNTo = (toSupply * (toSupply + 1)) / 2;
    let sumFirstNTo: BigInt = toSupply
      .times(toSupply.plus(BigInt.fromI32(1)))
      .div(BigInt.fromI32(2))

    // sumFirstNFrom = ((fromSupply - 1) * fromSupply) / 2;
    let sumFirstNFrom: BigInt = fromSupply
      .minus(BigInt.fromI32(1))
      .times(fromSupply)
      .div(BigInt.fromI32(2))

    sumFirstN = sumFirstNTo.minus(sumFirstNFrom)
  }

  // Total cost is the sum of base prices and the bonding curve contributions
  // totalCost = (BASE_PRICE * amount) + (A * sumSquares) + (B * sumFirstN);
  let totalCost: BigInt = BASE_PRICE.times(amount)
    .plus(A.times(sumSquares))
    .plus(B.times(sumFirstN))

  const WEI_PER_ETHER = BigDecimal.fromString('1000000000000000000')

  return totalCost.toBigDecimal().div(WEI_PER_ETHER)
}

export function handleCreatorFeeClaimed(event: CreatorFeeClaimedEvent): void {
  let visibility = Visibility.load(Bytes.fromUTF8(event.params.visibilityId))
  if (!visibility) {
    visibility = Visibility.loadInBlock(
      Bytes.fromUTF8(event.params.visibilityId)
    )
  }

  if (visibility) {
    visibility.claimableFeeBalance = visibility.claimableFeeBalance.minus(
      event.params.amount
    )
    visibility.save()

    let entity = new CreatorFeeClaimed('auto')

    let creator = User.load(event.params.creator)
    if (!creator) {
      creator = User.loadInBlock(event.params.creator)
    }
    if (!creator) {
      creator = new User(event.params.creator)
      creator.save()
    }

    let from = User.load(event.params.from)
    if (!creator) {
      from = User.loadInBlock(event.params.from)
    }
    if (!from) {
      from = new User(event.params.from)
      from.save()
    }

    entity.creator = creator.id
    entity.amount = event.params.amount
    entity.visibility = visibility.id
    entity.from = from.id

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
  }
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
    visibility.claimableFeeBalance = BigInt.fromI32(0)
  }

  let creator: User | null = null
  if (!isZeroAddr(event.params.creator)) {
    User.load(event.params.creator)
    if (!creator) {
      creator = User.loadInBlock(event.params.creator)
    }
    if (!creator) {
      creator = new User(event.params.creator)
      creator.save()
    }
  }

  visibility.creator = creator ? creator.id : null

  visibility.metadata = event.params.metadata
  visibility.save()

  /////

  let entity = new CreatorVisibilitySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibility = event.params.visibilityId
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
    visibility.claimableFeeBalance = BigInt.fromI32(0)
  }
  visibility.currentPrice = computeNewCurrentPrice(
    event.params.tradeEvent.newTotalSupply
  )
  visibility.totalSupply = event.params.tradeEvent.newTotalSupply
  visibility.claimableFeeBalance = visibility.claimableFeeBalance.plus(
    event.params.tradeEvent.creatorFee
  )
  visibility.save()

  let user = User.load(event.params.tradeEvent.from)
  if (!user) {
    user = User.loadInBlock(event.params.tradeEvent.from)
  }
  if (!user) {
    user = new User(event.params.tradeEvent.from)
    user.save()
  }

  let referrer: User | null = null
  if (!isZeroAddr(event.params.tradeEvent.referrer)) {
    referrer = User.load(event.params.tradeEvent.referrer)
    if (!referrer) {
      referrer = User.loadInBlock(event.params.tradeEvent.referrer)
    }
    if (!referrer) {
      referrer = new User(event.params.tradeEvent.referrer)
      referrer.save()
    }
  }

  let partner: User | null = null
  if (!isZeroAddr(event.params.tradeEvent.partner)) {
    partner = User.load(event.params.tradeEvent.partner)
    if (!partner) {
      partner = User.loadInBlock(event.params.tradeEvent.partner)
    }
    if (!partner) {
      partner = new User(event.params.tradeEvent.partner)
      partner.save()
    }
  }

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
    visibilityBalance.balance = BigInt.fromI32(0)
    visibilityBalance.user = user.id
  }

  visibilityBalance.balance = event.params.tradeEvent.isBuy
    ? visibilityBalance.balance.plus(event.params.tradeEvent.amount)
    : visibilityBalance.balance.minus(event.params.tradeEvent.amount)
  visibilityBalance.balanceValue = visibilityBalanceValue(
    visibility.totalSupply,
    visibilityBalance.balance
  )
  visibilityBalance.lastUpdated = event.block.timestamp

  visibilityBalance.save()

  let entity = new CreditsTrade('auto')
  entity.user = user.id
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
  entity.referrer = referrer ? referrer.id : null
  entity.partner = partner ? partner.id : null
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
    visibility.claimableFeeBalance = BigInt.fromI32(0)
  }
  visibility.save()

  let from = User.load(event.params.from)
  if (!from) {
    from = User.loadInBlock(event.params.from)
  }
  if (!from) {
    from = new User(event.params.from)
    from.save()
  }

  let to = User.load(event.params.to)
  if (!to) {
    to = User.loadInBlock(event.params.to)
  }
  if (!to) {
    to = new User(event.params.to)
    to.save()
  }

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
    visibilityBalanceFrom.user = from.id
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
    visibilityBalanceTo.user = to.id
    visibilityBalanceTo.balance = BigInt.fromI32(0)
  }

  visibilityBalanceFrom.balance = visibilityBalanceFrom.balance.minus(
    event.params.amount
  )
  visibilityBalanceFrom.balanceValue = visibilityBalanceValue(
    visibility.totalSupply,
    visibilityBalanceFrom.balance
  )
  visibilityBalanceFrom.lastUpdated = event.block.timestamp

  visibilityBalanceTo.balance = visibilityBalanceTo.balance.plus(
    event.params.amount
  )
  visibilityBalanceTo.balanceValue = visibilityBalanceValue(
    visibility.totalSupply,
    visibilityBalanceTo.balance
  )
  visibilityBalanceTo.lastUpdated = event.block.timestamp

  visibilityBalanceFrom.save()
  visibilityBalanceTo.save()

  let entity = new CreditsTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibility = visibility.id
  entity.from = from.id
  entity.to = to.id
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

  let referrer = User.load(event.params.referrer)
  if (!referrer) {
    referrer = User.loadInBlock(event.params.referrer)
  }
  if (!referrer) {
    referrer = new User(event.params.referrer)
    referrer.save()
  }

  let partner: User | null = null
  if (!isZeroAddr(event.params.partner)) {
    partner = User.load(event.params.partner)
    if (!partner) {
      partner = User.loadInBlock(event.params.partner)
    }
    if (!partner) {
      partner = new User(event.params.partner)
      partner.save()
    }
  }

  referrer.partner = partner ? partner.id : null

  entity.referrer = referrer.id
  entity.partner = partner ? partner.id : null

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
