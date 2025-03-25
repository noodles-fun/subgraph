# Noodles.Fun — Feed Your KOLs! 🍜

**Noodles.Fun** turns Twitter (X) accounts into special bonding curve tokens. Trade these tokens and use them to pay for promotion services on X, such as shoutouts or pinned tweets. A fun way to support and engage with KOLs!

## How It Works

1. **Every Twitter Account Has a Token:** Each token represents a unique bonding curve for a Twitter (X) account.
2. **Trade Instantly:** Use a bonding curve to buy or sell tokens. No need for liquidity pools or order books.
3. **Spend Tokens for Promotions:** The X account owner can accept tokens as payment for services, such as tweets or pinned posts.

## Subgraphs

* Abstract mainnet: [The Graph Network - auto pruned](https://thegraph.com/explorer/subgraphs/4aCcnWu6U2UhL6XrUKh2k45v4m8xVVF6S354PS2p9nsU?view=Query&chain=arbitrum-one) or [Goldsky - no prune](https://api.goldsky.com/api/public/project_cm3yp5wtflxub01wra3g2a0bc/subgraphs/noodles-abstract/v1.4.2/gn)
* Abstract testnet: [The Graph Network - auto pruned](https://api.studio.thegraph.com/query/94473/noodles-subgraph-testnet/version/latest) or [Goldsky - no prune](https://api.goldsky.com/api/public/project_cm3yp5wtflxub01wra3g2a0bc/subgraphs/noodles-subgraph-testnet/v1.4.1/gn)

### Query example

```graphql
{

  #### Profile view #######

  users {
    id # userAddress

    # holdings 
    balances {
      visibility {
        visibilityId
        creator {
          id
        }
        metadata
        totalSupply
      }
      balance
    }

    # as a creator 
    visibilities {
      visibilityId
      metadata
      trades {
        creatorFee # all creator fees
      }
    }
    claimedCreatorEarnings {
      amount # claimed creator fees
    }

   # as a referral 
   partner {
    id 
   }
   referralTradesEarnings {
      referrerFee
   }    

    # as a partner 
    referrersAsPartner {
      id # referrer addresses 
    }
    partnerTradesEarnings {
      partnerFee
    }
  }
  
  #### Visibility view #######
  
  visibilities {
    visibilityId
    metadata
    creator {
      id # userAddress
    }
    currentPrice
    totalSupply
  }
  visibilityBalances(orderBy: balance orderDirection: desc) {    
    visibility {
      visibilityId
    }
    user {
      id #userAddress
    }
    balance
  }
  creditsTrades {
    user {
      id # userAddress
    }
    referrer {
      id # referrerAddress, can be null
    }
    partner {
      id # partnerAddress, can be null
    }
    visibility {
      visibilityId
      totalSupply # newTotalSupply
      currentPrice # newcurrentPrice
    }
    amount
    isBuy
    buyCost # total paid by the user (include fees), if isBuy == true
    sellReimbursement # sent to the user (fees deducted), if isBuy == false
  }
}
```

## Development

### Setup

1. Create your subgraph with [The Graph Studio](https://thegraph.com/studio)

2. Install packages:

   ```bash
   npm install -g @graphprotocol/graph-cli
   npm install
   ```

3. Authenticate

   ```bash
   graph auth xxxxxx # auth key from The Graph Studio
   ```

4. Build

    ```bash
    npm run build
    ```

### Deploy

#### The Graph Studio

   ```bash
   graph deploy --node https://api.studio.thegraph.com/deploy/ noodles-subgraph-testnet # replace noodles-subgraph-testnet by your subgraph slug
   ```

#### Goldsky

  ```bash
   goldsky subgraph deploy noodles-subgraph-testnet/0.0.9 --path . # replace noodles-subgraph-testnet/0.0.9 by the slug and version you want
   ```

### Testing

1. Install Docker (if not already installed)

2. Run tests:

   ```bash
   npm run test
   ```
