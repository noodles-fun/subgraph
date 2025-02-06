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
  Protocol,
  ReferrerPartnerSet,
  User,
  UserDayActivity,
  UsersDayActivity,
  Visibility,
  VisibilityBalance
} from '../generated/schema'
// import { log } from 'matchstick-as'

const WEI_PER_ETHER = BigDecimal.fromString('1000000000000000000')

export function isZeroAddr(addr: Bytes): boolean {
  return addr.toHexString() == '0x0000000000000000000000000000000000000000'
}

export const A = BigInt.fromU64(15)
export const B = BigInt.fromU64(25_000)
export const BASE_PRICE = BigInt.fromU64(10_000_000)

export function computeNewCurrentPrice(totalSupply: BigInt): BigInt {
  // newCurrentPrice = BASE_PRICE + (A * (totalSupply ** 2)) + (B * totalSupply);
  let newCurrentPrice = BASE_PRICE.plus(A.times(totalSupply.pow(2))).plus(
    B.times(totalSupply)
  )

  return newCurrentPrice
}

/*
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

  return totalCost.toBigDecimal().div(WEI_PER_ETHER)
}
*/
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
  /**
   * 1. Visibility updates
   */

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

  /**
   * 2. Users retrieval
   */

  let user = User.load(event.params.tradeEvent.from)
  if (!user) {
    user = User.loadInBlock(event.params.tradeEvent.from)
  }
  if (!user) {
    user = new User(event.params.tradeEvent.from)
    user.save()
  }

  let creator: User | null = null
  if (visibility.creator) {
    creator = User.load(visibility.creator as Bytes)
    if (!creator) {
      creator = User.loadInBlock(visibility.creator as Bytes)
    }
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

  /**
   * 3. Trader user balance update
   */

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
    visibilityBalance.cursorId = BigInt.fromString(
      `${event.block.timestamp.toString()}${event.logIndex.toString()}1`
    )
  }

  visibilityBalance.balance = event.params.tradeEvent.isBuy
    ? visibilityBalance.balance.plus(event.params.tradeEvent.amount)
    : visibilityBalance.balance.minus(event.params.tradeEvent.amount)

  visibilityBalance.lastUpdated = event.block.timestamp

  visibilityBalance.save()

  /**
   * 3. TVL update
   */

  let protocol = Protocol.load(Bytes.fromI32(0))
  if (!protocol) {
    protocol = Protocol.loadInBlock(Bytes.fromI32(0))
  }
  if (!protocol) {
    protocol = new Protocol(Bytes.fromI32(0))
    protocol.totalValueLocked = BigDecimal.fromString('0')
  }

  let tradeValue = event.params.tradeEvent.tradeCost
    .toBigDecimal()
    .div(WEI_PER_ETHER)

  protocol.totalValueLocked = event.params.tradeEvent.isBuy
    ? protocol.totalValueLocked.plus(tradeValue)
    : protocol.totalValueLocked.minus(tradeValue)

  protocol.save()

  /**
   * 4. Day activity updates
   */

  let date = new Date(event.block.timestamp.toI64() * 1000)
  date.setUTCMilliseconds(0)
  date.setUTCSeconds(0)
  date.setUTCMinutes(0)
  date.setUTCHours(0)
  let day = date.getUTCDate()
  let month = date.getUTCMonth() + 1
  let year = date.getUTCFullYear()
  let formattedDate = date.toISOString().split('T')[0]
  let dayTimestamp = date.getTime()

  let usersDayActivity = UsersDayActivity.load(Bytes.fromUTF8(formattedDate))
  if (!usersDayActivity) {
    usersDayActivity = UsersDayActivity.loadInBlock(
      Bytes.fromUTF8(formattedDate)
    )
  }
  if (!usersDayActivity) {
    usersDayActivity = new UsersDayActivity(Bytes.fromUTF8(formattedDate))
    usersDayActivity.day = formattedDate
    usersDayActivity.dayTimestamp = dayTimestamp
    usersDayActivity.nbActiveUsers = BigInt.fromI32(0)
    usersDayActivity.volume = BigInt.fromI32(0)
    usersDayActivity.protocolFees = BigInt.fromI32(0)
    usersDayActivity.creatorFees = BigInt.fromI32(0)
    usersDayActivity.referrerFees = BigInt.fromI32(0)
    usersDayActivity.partnerFees = BigInt.fromI32(0)
  }

  if (user) {
    let fee = event.params.tradeEvent.protocolFee
    let userDate = user.id.concat(Bytes.fromUTF8(formattedDate))
    let userDayActivity = UserDayActivity.load(userDate)
    if (!userDayActivity) {
      userDayActivity = UserDayActivity.loadInBlock(userDate)
    }
    if (!userDayActivity) {
      userDayActivity = new UserDayActivity(userDate)
      userDayActivity.user = user.id
      userDayActivity.day = formattedDate
      userDayActivity.dayTimestamp = dayTimestamp
      userDayActivity.isActiveUser = false
      userDayActivity.volume = BigInt.fromI32(0)
      userDayActivity.protocolFees = BigInt.fromI32(0)
      userDayActivity.creatorFees = BigInt.fromI32(0)
      userDayActivity.referrerFees = BigInt.fromI32(0)
      userDayActivity.partnerFees = BigInt.fromI32(0)

      userDayActivity.cursorId = BigInt.fromString(
        `${event.block.timestamp.toString()}${event.logIndex.toString()}2`
      )
    }
    userDayActivity.volume = userDayActivity.volume.plus(
      event.params.tradeEvent.tradeCost
    )
    usersDayActivity.volume = usersDayActivity.volume.plus(
      event.params.tradeEvent.tradeCost
    )
    userDayActivity.protocolFees = userDayActivity.protocolFees.plus(fee)
    usersDayActivity.protocolFees = usersDayActivity.protocolFees.plus(fee)
    if (
      event.params.tradeEvent.tradeCost.gt(
        BigInt.fromString('30000000000000000')
      )
    ) {
      if (!userDayActivity.isActiveUser) {
        usersDayActivity.nbActiveUsers = usersDayActivity.nbActiveUsers.plus(
          BigInt.fromI32(1)
        )
      }
      userDayActivity.isActiveUser = true
    }
    userDayActivity.save()
  }

  if (creator) {
    let fee = event.params.tradeEvent.creatorFee
    let creatorDate = creator.id.concat(Bytes.fromUTF8(formattedDate))
    let creatorDayActivity = UserDayActivity.load(creatorDate)
    if (!creatorDayActivity) {
      creatorDayActivity = UserDayActivity.loadInBlock(creatorDate)
    }
    if (!creatorDayActivity) {
      creatorDayActivity = new UserDayActivity(creatorDate)
      creatorDayActivity.user = creator.id
      creatorDayActivity.day = formattedDate
      creatorDayActivity.dayTimestamp = dayTimestamp
      creatorDayActivity.isActiveUser = false
      creatorDayActivity.volume = BigInt.fromI32(0)
      creatorDayActivity.protocolFees = BigInt.fromI32(0)
      creatorDayActivity.creatorFees = BigInt.fromI32(0)
      creatorDayActivity.referrerFees = BigInt.fromI32(0)
      creatorDayActivity.partnerFees = BigInt.fromI32(0)

      creatorDayActivity.cursorId = BigInt.fromString(
        `${event.block.timestamp.toString()}${event.logIndex.toString()}3`
      )
    }
    creatorDayActivity.creatorFees = creatorDayActivity.creatorFees.plus(fee)
    usersDayActivity.creatorFees = usersDayActivity.creatorFees.plus(fee)
    creatorDayActivity.save()
  }

  if (referrer) {
    let fee = event.params.tradeEvent.referrerFee
    let referrerDate = referrer.id.concat(Bytes.fromUTF8(formattedDate))
    let referrerDayActivity = UserDayActivity.load(referrerDate)
    if (!referrerDayActivity) {
      referrerDayActivity = UserDayActivity.loadInBlock(referrerDate)
    }
    if (!referrerDayActivity) {
      referrerDayActivity = new UserDayActivity(referrerDate)
      referrerDayActivity.user = referrer.id
      referrerDayActivity.day = formattedDate
      referrerDayActivity.dayTimestamp = dayTimestamp
      referrerDayActivity.isActiveUser = false
      referrerDayActivity.volume = BigInt.fromI32(0)
      referrerDayActivity.protocolFees = BigInt.fromI32(0)
      referrerDayActivity.creatorFees = BigInt.fromI32(0)
      referrerDayActivity.referrerFees = BigInt.fromI32(0)
      referrerDayActivity.partnerFees = BigInt.fromI32(0)

      referrerDayActivity.cursorId = BigInt.fromString(
        `${event.block.timestamp.toString()}${event.logIndex.toString()}4`
      )
    }
    referrerDayActivity.referrerFees =
      referrerDayActivity.referrerFees.plus(fee)
    usersDayActivity.referrerFees = usersDayActivity.referrerFees.plus(fee)
    referrerDayActivity.save()
  }

  if (partner) {
    let fee = event.params.tradeEvent.partnerFee
    let partnerDate = partner.id.concat(Bytes.fromUTF8(formattedDate))
    let partnerDayActivity = UserDayActivity.load(partnerDate)
    if (!partnerDayActivity) {
      partnerDayActivity = UserDayActivity.loadInBlock(partnerDate)
    }
    if (!partnerDayActivity) {
      partnerDayActivity = new UserDayActivity(partnerDate)
      partnerDayActivity.user = partner.id
      partnerDayActivity.day = formattedDate
      partnerDayActivity.dayTimestamp = dayTimestamp
      partnerDayActivity.isActiveUser = false
      partnerDayActivity.volume = BigInt.fromI32(0)
      partnerDayActivity.protocolFees = BigInt.fromI32(0)
      partnerDayActivity.creatorFees = BigInt.fromI32(0)
      partnerDayActivity.referrerFees = BigInt.fromI32(0)
      partnerDayActivity.partnerFees = BigInt.fromI32(0)

      partnerDayActivity.cursorId = BigInt.fromString(
        `${event.block.timestamp.toString()}${event.logIndex.toString()}5`
      )
    }
    partnerDayActivity.partnerFees = partnerDayActivity.partnerFees.plus(fee)
    usersDayActivity.partnerFees = usersDayActivity.partnerFees.plus(fee)
    partnerDayActivity.save()
  }

  usersDayActivity.save()

  /**
   * 5. CreditsTrade entity
   */

  let entity = new CreditsTrade('auto')
  entity.user = user.id
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
  entity.tradeValue = tradeValue
  entity.creatorFee = event.params.tradeEvent.creatorFee
  entity.protocolFee = event.params.tradeEvent.protocolFee
  entity.referrerFee = event.params.tradeEvent.referrerFee
  entity.partnerFee = event.params.tradeEvent.partnerFee
  if (referrer) entity.referrer = referrer.id
  if (partner) entity.partner = partner.id
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

    visibilityBalanceFrom.cursorId = BigInt.fromString(
      `${event.block.timestamp.toString()}${event.logIndex.toString()}6`
    )
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

    visibilityBalanceTo.cursorId = BigInt.fromString(
      `${event.block.timestamp.toString()}${event.logIndex.toString()}7`
    )
  }

  visibilityBalanceFrom.balance = visibilityBalanceFrom.balance.minus(
    event.params.amount
  )

  visibilityBalanceFrom.lastUpdated = event.block.timestamp

  visibilityBalanceTo.balance = visibilityBalanceTo.balance.plus(
    event.params.amount
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
