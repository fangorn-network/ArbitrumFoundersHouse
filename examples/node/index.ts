import { createWalletClient, http, type Hex } from "viem";
import { Address, privateKeyToAccount } from "viem/accounts";
// import { atob } from "node:buffer";
import { createFangornMiddleware } from "../../packages/fetch/src/middleware.js";
import { FangornConfig } from "fangorn-sdk";
// import { createRequire } from "node:module";
import { FheInputData, FhenixEncryptionService } from "./fhenix.js";


// const require = createRequire(import.meta.url);
// const { FheInputData, FhenixEncryptionService } = require("fangorn-sdk");

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};

const envChain = process.env.CHAIN!;
const config = envChain == "arbitrumSepolia" ? FangornConfig.ArbitrumSepolia : FangornConfig.BaseSepolia;

async function nodeExample() {

    const account = privateKeyToAccount(getEnv("EVM_PRIVATE_KEY") as Hex);
    const resourceServerUrl = getEnv("RESOURCE_SERVER_URL");
    const pinataJwt = getEnv("PINATA_JWT");
    const pinataGateway = getEnv("PINATA_GATEWAY");

    const walletClient = createWalletClient({
        account,
        chain: config.chain,
        transport: http(config.rpcUrl),
    });

    const encryptionService = await FhenixEncryptionService.init(
        walletClient,
        config.rpcUrl,
    );

    const middleware = await createFangornMiddleware(
        walletClient,
        config,
        pinataJwt,
        pinataGateway
    );

    const tag = "bloodtypes";
    const data: FheInputData =
    {
        tag,
        value: [0n],
    };
    const encrypted = await encryptionService.encrypt(data);
    const owner = "0x147c24c5Ea2f1EE1ac42AD16820De23bBba45Ef6" as Address;
    const datasourceName = "local-fhe-demo";

    const result = await middleware.fetchResource({
        params: {
            owner,
            name: datasourceName,
            tag,
        },
        baseUrl: resourceServerUrl,
        body: {
            "fheQueryParam": JSON.stringify(encrypted, (_, v) =>
                typeof v === 'bigint' ? v.toString() + 'n' : v
            )
        }
    });

    if (result.success) {
        console.log("Decrypted result:", JSON.stringify(result));
        process.exit(0)
    } else {
        console.error("Failed:", result.error);
    }
}

await nodeExample().catch(console.error);