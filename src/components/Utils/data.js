export const canisterData = {
    ICP: {
        symbol: "ICP",
        pair: "ICP/USD",
        mainnetledgerId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        localledgerId: process.env.CANISTER_ID_ICP_LEDGER,
        mainntetIndexId: "qhbym-qaaaa-aaaaa-aaafq-cai",
        localIndexId: process.env.CANISTER_ID_ICP_INDEX

    },
    ckBTC: {
        symbol: "ckBTC",
        pair: "ckBTC/USD",
        mainnetLedgerId: "mxzaz-hqaaa-aaaar-qaada-cai",
        localLedgerId: process.env.CANISTER_ID_CKBTC_LEDGER,
        localIndexId: process.env.CKBTC_INDEX_CANISTER_ID,
        mainnetIndexId: "n5wcd-faaaa-aaaar-qaaea-cai"
    }
}