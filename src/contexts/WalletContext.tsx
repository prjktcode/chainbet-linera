import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import SignClient from '@walletconnect/sign-client';
import { WalletConnectModal } from '@walletconnect/modal';
import type { SessionTypes } from '@walletconnect/types';
import { WalletState } from '@/types';

/**
 * WalletConnect Integration for Linera
 * 
 * Configuration:
 * - VITE_WALLET_CONNECT_PROJECT_ID: Required. Get from https://cloud.walletconnect.com/
 * - VITE_WC_NAMESPACE: Optional. Defaults to "linera". Use "eip155" for EVM chains.
 * 
 * Linera Namespace:
 * When Linera supports WalletConnect natively, use "linera" namespace.
 * For now, the namespace is configurable to allow testing with different chains.
 * 
 * If using a custom chain:
 * 1. Set VITE_WC_NAMESPACE to your chain's namespace (e.g., "linera" or "eip155")
 * 2. The app will attempt to connect using that namespace
 * 3. Account ID will be extracted from the session
 */

interface WalletContextType {
  accountId: string | null;
  isConnected: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '';
const WC_NAMESPACE = import.meta.env.VITE_WC_NAMESPACE || 'linera';

// Determine chain ID based on namespace
const getChainConfig = () => {
  if (WC_NAMESPACE === 'linera') {
    return {
      namespace: 'linera',
      chains: ['linera:mainnet'],
      methods: ['linera_sign', 'linera_signTransaction'],
      events: ['accountsChanged', 'chainChanged'],
    };
  }
  // Fallback to EIP155 (Ethereum) for testing
  return {
    namespace: 'eip155',
    chains: ['eip155:1'],
    methods: ['eth_sendTransaction', 'personal_sign'],
    events: ['accountsChanged', 'chainChanged'],
  };
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [modal, setModal] = useState<WalletConnectModal | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance] = useState(0); // Balance would be fetched from chain

  // Extract account ID from session
  const accountId = session
    ? (() => {
        const chainConfig = getChainConfig();
        const namespaceData = session.namespaces[chainConfig.namespace];
        if (namespaceData?.accounts?.length) {
          // Account format: namespace:chainId:address
          const account = namespaceData.accounts[0];
          const parts = account.split(':');
          return parts[parts.length - 1]; // Return just the address
        }
        return null;
      })()
    : null;

  const isConnected = !!session && !!accountId;

  // Initialize WalletConnect client
  useEffect(() => {
    const initClient = async () => {
      if (!PROJECT_ID) {
        console.warn('WalletConnect: No project ID configured. Set VITE_WALLET_CONNECT_PROJECT_ID in .env');
        return;
      }

      try {
        const client = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: 'ChainBet',
            description: 'Decentralized Sportsbook on Linera',
            url: window.location.origin,
            icons: [`${window.location.origin}/logo.png`],
          },
        });

        setSignClient(client);

        // Create modal for wallet selection
        const wcModal = new WalletConnectModal({
          projectId: PROJECT_ID,
          chains: getChainConfig().chains,
        });
        setModal(wcModal);

        // Check for existing session
        const existingSessions = client.session.getAll();
        if (existingSessions.length > 0) {
          setSession(existingSessions[0]);
        }

        // Listen for session events
        client.on('session_delete', () => {
          setSession(null);
        });

        client.on('session_expire', () => {
          setSession(null);
        });
      } catch (err) {
        console.error('Failed to initialize WalletConnect:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initClient();
  }, []);

  const connect = useCallback(async () => {
    if (!signClient || !modal) {
      // Fallback mock connection if WalletConnect isn't configured
      if (!PROJECT_ID) {
        console.warn('WalletConnect not configured. Using mock connection for development.');
        setSession({
          topic: 'mock-session',
          relay: { protocol: 'irn' },
          expiry: Date.now() + 86400000,
          acknowledged: true,
          controller: '',
          namespaces: {
            [WC_NAMESPACE]: {
              accounts: [`${WC_NAMESPACE}:mainnet:e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65`],
              methods: [],
              events: [],
            },
          },
          requiredNamespaces: {},
          optionalNamespaces: {},
          pairingTopic: '',
          self: { publicKey: '', metadata: { name: '', description: '', url: '', icons: [] } },
          peer: { publicKey: '', metadata: { name: '', description: '', url: '', icons: [] } },
        });
        return;
      }
      setError('WalletConnect not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chainConfig = getChainConfig();

      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          [chainConfig.namespace]: {
            methods: chainConfig.methods,
            chains: chainConfig.chains,
            events: chainConfig.events,
          },
        },
      });

      if (uri) {
        await modal.openModal({ uri });
        const newSession = await approval();
        setSession(newSession);
        modal.closeModal();
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please try again.');
      modal?.closeModal();
    } finally {
      setIsLoading(false);
    }
  }, [signClient, modal]);

  const disconnect = useCallback(async () => {
    if (!signClient || !session) {
      // Handle mock session disconnect
      setSession(null);
      return;
    }

    setIsLoading(true);

    try {
      await signClient.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: 'User disconnected' },
      });
      setSession(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      // Still clear session on error
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [signClient, session]);

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected,
        balance,
        connect,
        disconnect,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  // Provide backward-compatible interface
  return {
    connected: context.isConnected,
    address: context.accountId,
    balance: context.balance,
    connect: context.connect,
    disconnect: context.disconnect,
    isLoading: context.isLoading,
    error: context.error,
    // New interface
    accountId: context.accountId,
    isConnected: context.isConnected,
  };
}
