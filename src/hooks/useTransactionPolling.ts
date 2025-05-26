import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';
import { getTransactionExplorerUrl } from '../lib/utils';
import { ChatMessageDto, NodeListingDto, WhitelistRequestDto } from '@hippocampus-web3/runebond-client';

interface TransactionPollingState {
    isPolling: boolean;
    currentTxId: string | null;
    toastId: string | number | null;
    address: string | null;
    transactionType: 'listing' | 'whitelist' | 'enableBond' | 'bond' | 'unbond' | 'message' | 'subscription' | null;
    transactionData: any;
    nodeAddress: string | null;
}

interface UseTransactionPollingProps {
    onTransactionConfirmed?: (type: TransactionPollingState['transactionType'], additionalInfo?: { 
        nodeAddress?: string;
        txId?: string;
    }) => void;
}

export const useTransactionPolling = ({ onTransactionConfirmed }: UseTransactionPollingProps = {}) => {
    const [state, setState] = useState<TransactionPollingState>({
        isPolling: false,
        currentTxId: null,
        toastId: null,
        address: null,
        transactionType: null,
        transactionData: null,
        nodeAddress: null
    });

    const startPolling = useCallback((txId: string, message: string, address: string, type: TransactionPollingState['transactionType'], data: any, nodeAddress: string | null) => {
        const explorerUrl = getTransactionExplorerUrl(txId);
        const toastContent = React.createElement(
            'div',
            null,
            React.createElement('p', null, message),
            React.createElement(
                'a',
                {
                    href: explorerUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-blue-500 hover:text-blue-700 underline text-sm'
                },
                'View on Explorer'
            )
        );

        const toastId = toast.loading(toastContent, {
            position: "top-right",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            progress: undefined,
        });

        setState({
            isPolling: true,
            currentTxId: txId,
            toastId,
            address,
            transactionType: type,
            transactionData: data,
            nodeAddress: nodeAddress
        });
    }, []);

    const stopPolling = useCallback(() => {
        if (state.toastId !== null) {
            toast.dismiss(state.toastId);
        }
        setState({
            isPolling: false,
            currentTxId: null,
            toastId: null,
            address: null,
            transactionType: null,
            transactionData: null,
            nodeAddress: null
        });
    }, [state.toastId]);

    const verifyTransaction = useCallback(async (listedNodes: NodeListingDto[], requests: { operator: WhitelistRequestDto[], user: WhitelistRequestDto[] }, messages: ChatMessageDto[]) => {
        if (!state.transactionType || !state.transactionData) return false;

        const engine = RuneBondEngine.getInstance();

        switch (state.transactionType) {
            case 'listing':
                return listedNodes.some(node => node.txId === state.currentTxId);

            case 'whitelist': {
                const isOperatorWhitelistConfirmed = requests.operator.some(req =>
                    req.txId === state.currentTxId
                );
                const isUserWhitelistConfirmed = requests.user.some(req =>
                    req.txId === state.currentTxId
                );
                return isOperatorWhitelistConfirmed || isUserWhitelistConfirmed;
            }

            case 'enableBond': {
                const isOperatorEnableBondConfirmed = requests.operator.some(req =>
                    req.txId === state.currentTxId
                );
                const isUserEnableBondConfirmed = requests.user.some(req =>
                    req.txId === state.currentTxId
                );
                return isOperatorEnableBondConfirmed || isUserEnableBondConfirmed;
            }

            case 'bond':
            case 'unbond':
            case 'subscription':
                return await engine.isTransactionConfirmed(state.currentTxId!);

            case 'message':
                return messages.some(msg => msg.txId === state.currentTxId);

            default:
                return false;
        }
    }, [state.transactionType, state.transactionData, state.currentTxId]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (state.isPolling && state.currentTxId) {
            intervalId = setInterval(async () => {
                try {
                    const engine = RuneBondEngine.getInstance();
                    const listedNodes = await engine.getListedNodes();
                    const requests = await engine.getWhitelistRequests(state.address || '');
                    
                    let messages: ChatMessageDto[] = [];
                    if (state.transactionType === 'message' && state.nodeAddress) {
                        messages = await engine.getChatMessages(state.nodeAddress);
                    }

                    const isConfirmed = await verifyTransaction(listedNodes, requests, messages);

                    if (isConfirmed) {
                        toast.update(state.toastId!, {
                            render: "Transaction confirmed!",
                            type: "success",
                            isLoading: false,
                            autoClose: 3000,
                        });
                        
                        if (onTransactionConfirmed && state.transactionType) {
                            onTransactionConfirmed(state.transactionType, { 
                                nodeAddress: state.nodeAddress || undefined,
                                txId: state.currentTxId || undefined
                            });
                        }
                        
                        stopPolling();
                    }
                } catch (error) {
                    console.error('Error polling transaction status:', error);
                }
            }, 20000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [state.isPolling, state.currentTxId, state.toastId, stopPolling, verifyTransaction, onTransactionConfirmed, state.address, state.transactionType, state.nodeAddress]);

    return {
        startPolling,
        stopPolling,
        isPolling: state.isPolling
    };
}; 