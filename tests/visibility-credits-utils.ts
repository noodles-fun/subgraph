import { newMockEvent } from 'matchstick-as'
import { ethereum, Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  CreatorFeeClaimed,
  CreatorVisibilitySet,
  CreditsTrade,
  CreditsTransfer,
  ReferrerPartnerSet
} from '../generated/VisibilityCredits/VisibilityCredits'

export function createCreatorFeeClaimedEvent(
  creator: Address,
  amount: BigInt
): CreatorFeeClaimed {
  let creatorFeeClaimedEvent = changetype<CreatorFeeClaimed>(newMockEvent())

  creatorFeeClaimedEvent.parameters = new Array()

  creatorFeeClaimedEvent.parameters.push(
    new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator))
  )
  creatorFeeClaimedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creatorFeeClaimedEvent
}

export function createCreatorVisibilitySetEvent(
  visibilityId: string,
  creator: Address
): CreatorVisibilitySet {
  let creatorVisibilitySetEvent =
    changetype<CreatorVisibilitySet>(newMockEvent())

  creatorVisibilitySetEvent.parameters = new Array()

  creatorVisibilitySetEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  creatorVisibilitySetEvent.parameters.push(
    new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator))
  )

  return creatorVisibilitySetEvent
}

export function createCreditsTradeEvent(
  tradeEvent: ethereum.Tuple
): CreditsTrade {
  let creditsTradeEvent = changetype<CreditsTrade>(newMockEvent())

  creditsTradeEvent.parameters = new Array()

  creditsTradeEvent.parameters.push(
    new ethereum.EventParam('tradeEvent', ethereum.Value.fromTuple(tradeEvent))
  )

  return creditsTradeEvent
}

export function createCreditsTransferEvent(
  visibilityId: string,
  from: Address,
  to: Address,
  amount: BigInt
): CreditsTransfer {
  let creditsTransferEvent = changetype<CreditsTransfer>(newMockEvent())

  creditsTransferEvent.parameters = new Array()

  creditsTransferEvent.parameters.push(
    new ethereum.EventParam(
      'visibilityId',
      ethereum.Value.fromString(visibilityId)
    )
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creditsTransferEvent
}

export function createReferrerPartnerSetEvent(
  referrer: Address,
  partner: Address
): ReferrerPartnerSet {
  let referrerPartnerSetEvent = changetype<ReferrerPartnerSet>(newMockEvent())

  referrerPartnerSetEvent.parameters = new Array()

  referrerPartnerSetEvent.parameters.push(
    new ethereum.EventParam('referrer', ethereum.Value.fromAddress(referrer))
  )
  referrerPartnerSetEvent.parameters.push(
    new ethereum.EventParam('partner', ethereum.Value.fromAddress(partner))
  )

  return referrerPartnerSetEvent
}
