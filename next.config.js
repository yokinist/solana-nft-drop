const { CANDY_MACHINE_ID, SOLANA_NETWORK, SOLANA_RPC_HOST } = process.env;

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    CANDY_MACHINE_ID,
    SOLANA_NETWORK,
    SOLANA_RPC_HOST,
  },
};
