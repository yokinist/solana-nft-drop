# solana-nft-drop

## Tech Stack

- TypeScript, Next.js, Metaplex, Candy Machine v2, Tailwind CSS
- App works on only Solana devnet

## How to get started

1. Please edit your environment variables

```bash
# rename env file
$ mv .env.sample .env
```

2. Start frontend server

```bash
# install dependencies
$ yarn

# start frontend server
$ yarn dev
```

## How to deploy contract

```bash
$ ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts upload -e devnet -k ~/.config/solana/devnet.json -cp config.json ./assets
# If you want to update contract `ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts update_candy_machine -e devnet -k ~/.config/solana/devnet.json -cp config.json`
```

more: https://docs.metaplex.com/token-metadata/getting-started
