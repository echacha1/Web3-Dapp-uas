import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect, onDisconnect, onRefresh }) => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0.0000');
  const [network, setNetwork] = useState('Not Connected');
  const [chainId, setChainId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);


  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

 
  const getNetworkName = useCallback((chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      5: 'Goerli Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      56: 'BNB Smart Chain'
    };
    return networks[chainId] || `Network ${chainId}`;
  }, []);

  
  const formatBalanceLikeMetaMask = useCallback((balanceWei) => {
    if (!balanceWei || balanceWei === '0') {
      return '0.0000';
    }

    try {
      const ethValue = ethers.formatEther(balanceWei);
      const ethNum = parseFloat(ethValue);
      
      if (ethNum === 0) return '0.0000';
      if (ethNum < 0.0001) return ethNum.toExponential(4);
      if (ethNum < 1) return ethNum.toFixed(4);
      if (ethNum < 1000) return ethNum.toFixed(2);
      return ethNum.toFixed(0);
    } catch (error) {
      return '0.0000';
    }
  }, []);


  const updateWalletInfo = useCallback(async (address, provider) => {
    if (!address || !provider) return null;
    
    try {
      
      const balanceWei = await provider.getBalance(address);
      const formattedBalance = formatBalanceLikeMetaMask(balanceWei);
      
     
      const networkInfo = await provider.getNetwork();
      const chainIdNum = Number(networkInfo.chainId);
      const networkName = getNetworkName(chainIdNum);
      
      setBalance(formattedBalance);
      setNetwork(networkName);
      setChainId(chainIdNum);
      
     
      return {
        address,
        balance: formattedBalance,
        network: networkName,
        chainId: chainIdNum,
        provider
      };
    } catch (err) {
      console.error('❌ Error updating wallet info:', err);
      return null;
    }
  }, [formatBalanceLikeMetaMask, getNetworkName]);

 
  const checkInitialConnection = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const address = accounts[0].address;
        setAccount(address);
        setIsConnected(true);
        setProvider(provider);
        
        const data = await updateWalletInfo(address, provider);
        if (data && onConnect) {
          onConnect(data);
        }
      }
    } catch (err) {
      console.error('❌ Error checking initial connection:', err);
    }
  }, [updateWalletInfo, onConnect]);

  
  const setupEventListeners = useCallback(() => {
    if (!window.ethereum) return;
   
    window.ethereum.on('accountsChanged', async (accounts) => {
      console.log('🔄 Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // Disconnected
        handleDisconnect();
      } else {
       
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        setAccount(address);
        setIsConnected(true);
        setProvider(provider);
        
        const data = await updateWalletInfo(address, provider);
        if (data && onConnect) {
          onConnect(data);
        }
      }
      
      if (onRefresh) onRefresh();
    });
    
   
    window.ethereum.on('chainChanged', async (chainId) => {
      console.log('🔗 Chain changed to:', chainId);
      
      if (account) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const data = await updateWalletInfo(account, provider);
        if (data && onConnect) {
          onConnect(data);
        }
      }
      
      if (onRefresh) onRefresh();
    });
  }, [account, updateWalletInfo, onConnect, onRefresh]);

  
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask tidak ditemukan!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        setAccount(address);
        setIsConnected(true);
        setProvider(provider);
        
        const data = await updateWalletInfo(address, provider);
        if (data && onConnect) {
          onConnect(data);
        }
        
        setupEventListeners();
        console.log('✅ Wallet connected:', address);
      }
    } catch (err) {
      console.error('❌ Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('Koneksi ditolak oleh pengguna');
      } else {
        setError('Gagal menghubungkan wallet: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleDisconnect = () => {
    setAccount('');
    setBalance('0.0000');
    setNetwork('Not Connected');
    setChainId('');
    setIsConnected(false);
    setProvider(null);
    setError('');
    
    if (onDisconnect) {
      onDisconnect();
    }
    
    if (onRefresh) onRefresh();
  };

 
  const refreshBalance = async () => {
    if (!account || !window.ethereum) {
      setError('Wallet tidak terhubung');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const data = await updateWalletInfo(account, provider);
      
      if (data && onConnect) {
        onConnect(data);
      }
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ Error refreshing balance:', err);
      setError('Gagal refresh balance');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    checkInitialConnection();
    setupEventListeners();
    
    return () => {
      if (window.ethereum?.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [checkInitialConnection, setupEventListeners]);

  return (
    <div className="wallet-connect">
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {!isConnected ? (
        <div className="wallet-disconnected">
          <h3>Connect Your Wallet</h3>
          <p>Siapkan dompet Anda untuk menggunakan web3</p>
          <button 
            onClick={connectWallet}
            className="connect-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Connecting...
              </>
            ) : (
              <>
                <i className="fab fa-metamask"></i> Connect MetaMask
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-status connected">
            <i className="fas fa-check-circle"></i>
            <strong>Wallet Terhubung!</strong>
          </div>
          
          <div className="wallet-details">
            <div className="detail-item">
              <span className="label">Alamat:</span>
              <span className="value address">
                {formatAddress(account)}
                <button 
                  onClick={() => navigator.clipboard.writeText(account)}
                  className="copy-btn"
                  title="Copy address"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </span>
            </div>
            
            <div className="detail-item">
              <span className="label">Balance:</span>
              <span className="value balance">
                {balance} ETH
              </span>
            </div>
            
            <div className="detail-item">
              <span className="label">Network:</span>
              <span className="value network">
                {network} {chainId && `(${chainId})`}
              </span>
            </div>
          </div>
          
          <div className="wallet-actions">
            <button 
              onClick={refreshBalance}
              className="action-button refresh-button"
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-sync-alt"></i>
              )}
              {loading ? 'Refreshing...' : 'Refresh Balance'}
            </button>
            <button 
              onClick={handleDisconnect}
              className="action-button disconnect-button"
            >
              <i className="fas fa-sign-out-alt"></i>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;