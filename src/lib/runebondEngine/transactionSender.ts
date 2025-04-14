import { ThorchainTransferParams } from '../../types/wallets';

export const sendTransaction = async (
    params: ThorchainTransferParams,
    method: 'transfer' | 'deposit',
    walletType: 'xdefi' | 'vultisig'
): Promise<string> => {

    if (walletType === 'xdefi') {
        return new Promise((resolve, reject) => {
            // Try XDEFI first
            if (window.xfi?.thorchain) {
                window.xfi.thorchain.request(
                    {
                        method,
                        params: [params],
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                return;
            }

            // Try Vultisi
            reject(new Error("No compatible wallet found. Please install XDEFI or Vultisig extension."));
        });
    }

    if (walletType === 'vultisig') {
        if (window.vultisig?.thorchain) {

            if (method === 'transfer') {
                const result = await window.vultisig.thorchain.request({
                    method: "send_transaction",
                    params: [
                        {
                            from: params.from,
                            to: params.recipient,
                            data: params.memo,
                            value: params.amount.amount.toString(),
                        },
                    ],
                })
                return result;
            }

            if (method === 'deposit') {
                const result = await window.vultisig.thorchain.request({
                    method: "deposit_transaction",
                    params: [{
                        from: params.from,
                        value: params.amount.amount.toString(),
                        data: params.memo,
                    }],
                });
                if (Object.keys(result).length === 0 && result.constructor === Object) {
                    throw Error("User cancel action"); // vulticonnect returns {} when user cancel action
                }
                return result;
            }
        }
    }

    throw new Error("No compatible wallet found. Please install XDEFI or Vultisig extension.");
}; 