import React, { useState, useEffect } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import BalanceDisplay from './components/BalanceDisplay';
import TransactionList from './components/TransactionList';
import DonationList from './components/DonationList';
import DonationForm from './components/DonationForm';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe';

function App() {
  const [walletData, setWalletData] = useState({
    account: '',
    balance: '0.0000',
    network: 'Not Connected',
    isConnected: false,
    chainId: '',
    provider: null
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);


  const handleWalletConnect = (data) => {
    setWalletData({
      account: data.address,
      balance: data.balance,
      network: data.network,
      chainId: data.chainId,
      isConnected: true,
      provider: data.provider
    });
    setRefreshTrigger(prev => prev + 1);
  };


  const handleWalletDisconnect = () => {
    setWalletData({
      account: '',
      balance: '0.0000',
      network: 'Not Connected',
      isConnected: false,
      chainId: '',
      provider: null
    });
    setRefreshTrigger(prev => prev + 1);
  };


  const refreshAllData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💸 Web3 DAPP UAS</h1>
        <p>Aplikasi Crypto untuk Ujian Akhir Semester</p>
      </header>

      <main className="App-main">
        {}
        <section className="section wallet-section">
          <h2>🔗 Wallet Connection</h2>
          <WalletConnect 
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            onRefresh={refreshAllData}
          />
        </section>

        {}
        <section className="section balance-section">
          <h2>💰 Balance Information</h2>
          <BalanceDisplay 
            account={walletData.account}
            balance={walletData.balance}
            network={walletData.network}
            isConnected={walletData.isConnected}
            chainId={walletData.chainId}
          />
        </section>

        {}
        <section className="section donation-section">
          <h2>💝 Donation System</h2>
          <DonationForm 
            account={walletData.account}
            provider={walletData.provider}
            onSuccess={refreshAllData}
          />
          <DonationList 
            account={walletData.account}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {}
        <section className="section transaction-section">
          <h2>📋 Transaction History</h2>
          <TransactionList 
            account={walletData.account}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>

      <footer className="App-footer">
        <p>© 2024 - Web3 DAPP - Ujian Akhir Semester</p>
        <p className="footer-note">Pastikan MetaMask terinstall untuk menggunakan aplikasi ini</p>
      </footer>
    </div>
  );
}

export default App;