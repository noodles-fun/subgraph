import { Transfer as TransferEvent } from '../generated/PointsSBT/PointsSBT'
import { Sbt, User } from '../generated/schema'

export function handleTransfer(event: TransferEvent): void {
  let user = User.load(event.params.to)
  if (!user) {
    user = User.loadInBlock(event.params.to)
  }
  if (!user) {
    user = new User(event.params.to)
    user.save()
  }

  let entity = new Sbt(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.owner = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
