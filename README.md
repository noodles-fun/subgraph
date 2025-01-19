# Noodles.Fun — Feed Your KOLs! 🍜

**Noodles.Fun** turns Twitter (X) accounts into special bonding curve tokens. Trade these tokens and use them to pay for promotion services on X, such as shoutouts or pinned tweets. A fun way to support and engage with KOLs!

## How It Works

1. **Every Twitter Account Has a Token:** Each token represents a unique bonding curve for a Twitter (X) account.
2. **Trade Instantly:** Use a bonding curve to buy or sell tokens. No need for liquidity pools or order books.
3. **Spend Tokens for Promotions:** The X account owner can accept tokens as payment for services, such as tweets or pinned posts.

## Subgraphs

* Abstract mainnet: Coming soon
* Abstract testnet: <https://thegraph.com/explorer/subgraphs/3Z4xUtmadHbNTYpzk9d4pPpHJnsA9FXsYjwJx1aQ9zAC?view=Query&chain=arbitrum-one>

### Query example

```graphql
{
  visibilities(first: 5) {
    id
    creator
    currentPrice
    totalSupply
  }
  visibilityBalances(first: 5) {
    id
    visibility {
      id
    }
    user
    balance
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
