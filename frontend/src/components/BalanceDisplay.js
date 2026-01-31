import React from 'react';

const BalanceDisplay = ({ 
  account,
  balance = '0.0000',
  network = 'Not Connected',
  isConnected = false,
  chainId = ''
}) => {
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const calculateUSD = (ethAmount) => {
    const ethPrice = 3500;
    const usdValue = parseFloat(ethAmount) * ethPrice;
    return usdValue.toFixed(2);
  };

  return (
    <div className="balance-display">
      {!isConnected ? (
        <div className="donation-placeholder">
          <p>💰 Hubungkan wallet untuk melihat balance</p>
        </div>
      ) : (
        <div className="balance-cards-grid">
          {}
          <div className="balance-card">
            <div className="card-header">📍 Alamat Wallet</div>
            <div className="card-content">
              <div className="card-value mono">{formatAddress(account)}</div>
            </div>
          </div>

          {}
          <div className="balance-card">
            <div className="card-header">💎 Saldo ETH</div>
            <div className="card-content">
              <div className="card-value large">{balance}</div>
              <div className="card-unit">ETH</div>
            </div>
          </div>

          {}
          <div className="balance-card">
            <div className="card-header">💵 Nilai USD</div>
            <div className="card-content">
              <div className="card-value">${calculateUSD(balance)}</div>
              <div className="card-unit">@$3,500/ETH</div>
            </div>
          </div>

          {}
          <div className="balance-card">
            <div className="card-header">🔗 Network</div>
            <div className="card-content">
              <div className="card-value">{network}</div>
              <div className="card-unit">Chain ID: {chainId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;