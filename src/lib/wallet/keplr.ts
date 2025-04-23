import { KeplrProvider, ThorchainTransferParams } from "../../types/wallets";
import {
  AssetRuneNative,
  defaultClientConfig,
} from "@xchainjs/xchain-thorchain";
import { Registry } from '@cosmjs/proto-signing'
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { defaultRegistryTypes, SigningStargateClient, AminoTypes } from "@cosmjs/stargate";
import { base64ToBech32, bech32ToBase64 } from "@xchainjs/xchain-cosmos-sdk";

const rpc = "https://rpc-thorchain.keplr.app"

export const KeplrThorchainConfig = {
  chainId: "thorchain-1",
  chainName: "THORChain",
  chainSymbolImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/chain.png",
  rpc: "https://rpc-thorchain.keplr.app",
  rest: "https://thornode.ninerealms.com",
  bip44: {
    coinType: 931
  },
  bech32Config: {
    bech32PrefixAccAddr: "thor",
    bech32PrefixAccPub: "thorpub",
    bech32PrefixValAddr: "thorvaloper",
    bech32PrefixValPub: "thorvaloperpub",
    bech32PrefixConsAddr: "thorvalcons",
    bech32PrefixConsPub: "thorvalconspub"
  },
  currencies: [
    {
      coinDenom: "RUNE",
      coinMinimalDenom: "rune",
      coinDecimals: 8,
      coinGeckoId: "thorchain",
      coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/rune.png"
    }
  ],
  feeCurrencies: [
    {
      coinDenom: "RUNE",
      coinMinimalDenom: "rune",
      coinDecimals: 8,
      coinGeckoId: "thorchain",
      coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/thorchain/rune.png",
      gasPriceStep: {
        low: 0.02,
        average: 0.02,
        high: 0.03
      }
    }
  ],
  features: []
};

const types = new AminoTypes({
  "/types.MsgSend": {
    aminoType: `thorchain/MsgSend`,
    toAmino: (params: any) => ({
      from_address: base64ToBech32(params.fromAddress, 'thor'),
      to_address: base64ToBech32(params.toAddress, 'thor'),
      amount: [...params.amount],
    }),
    fromAmino: (params: any) => ({
      fromAddress: bech32ToBase64(params.from_address),
      toAddress: bech32ToBase64(params.to_address),
      amount: [...params.amount],
    }),
  },
  "/types.MsgDeposit": {
    aminoType: `thorchain/MsgDeposit`,
    toAmino: (params: any) => ({
      signer: base64ToBech32(params.signer, 'thor'),
      memo: params.memo,
      coins: [...params.coins],
    }),
    fromAmino: (params: any) => ({
      signer: bech32ToBase64(params.signer),
      memo: params.memo,
      coins: [...params.coins],
    }),
  },
});

export async function buildAndSignTransaction(params: ThorchainTransferParams, provider: KeplrProvider, type: 'transfer' | 'deposit') {

  if (type !== 'deposit' && type !== 'transfer') {
    throw new Error('Invalid transaction type');
  }

  const offlineSigner = provider.getOfflineSignerOnlyAmino(KeplrThorchainConfig.chainId, { preferNoSetFee: true });

  const registry = new Registry([
    ...defaultRegistryTypes,
    ...defaultClientConfig.registryTypes,
  ]);

  const cosmJS = await SigningStargateClient.connectWithSigner(
    rpc,
    offlineSigner as any,
    {
      registry,
      aminoTypes: types
    },
  );

  const fee = {
    amount: [],
    gas: "200000",
  };

  let msg: any = {
    type: 'thorchain/MsgDeposit',
    value: {
      signer: params.from,
      memo: params.memo,
      coins: [{
        amount: String(params.amount.amount),
        asset: 'THOR.RUNE'
      }],
    },
  };

  if (type === 'transfer') {

    if (!params.recipient) {
      throw new Error('Missing recipient it is required for transfer');
    }

    msg = {
      type: 'thorchain/MsgSend',
      value: {
        from_address: params.from,
        to_address: params.recipient,
        amount: [{ amount: String(params.amount.amount), denom: 'rune' }],
      },
    };

  }

  const msgSign = [types.fromAmino(msg)]

  let signatures, authInfoBytes;

  try {
    const result = await cosmJS.sign(
      params.from,
      msgSign,
      fee,
      params.memo,
    );
    signatures = result.signatures;
    authInfoBytes = result.authInfoBytes;
  } catch (error) {
    throw Error("Sign transaction failed");
  }

  try {

    let formatedMsg = msg

    if (type === 'deposit') {
      formatedMsg = {
        ...msg,
        value: {
          ...msg.value,
          coins: [{
            amount: String(params.amount.amount),
            asset: {
              chain: AssetRuneNative.chain,
              symbol: AssetRuneNative.symbol,
              ticker: AssetRuneNative.ticker,
              synth: false,
              trade: false,
            }
          }]
        }
      }
    }

    const tx = TxRaw.encode({
      authInfoBytes: authInfoBytes,
      signatures: signatures,
      bodyBytes: registry.encode({
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          memo: params.memo,
          messages: [formatedMsg].map((msg) => types.fromAmino(msg))
        }
      })
    }).finish();

    const txResponse = await cosmJS.broadcastTx(tx);
    return txResponse.transactionHash;
  } catch (error) {
    console.log(error);
    throw Error("Broadcast transaction failed");
  }
}
