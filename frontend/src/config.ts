const NETWORK_ID = "testnet";
const MASTER_ACCOUNT = "daic-dev-1770225642.testnet";

export const NEAR_CONFIG = {
    networkId: NETWORK_ID,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
    daoContract: `dao.${MASTER_ACCOUNT}`,
    didRegistryContract: `did.${MASTER_ACCOUNT}`,
    provenanceContract: `provenance.${MASTER_ACCOUNT}`,
};
