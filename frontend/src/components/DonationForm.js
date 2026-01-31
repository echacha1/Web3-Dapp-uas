import React, { useState } from 'react';
import { ethers } from 'ethers';

const DONATION_ABI = [
  "function donate(string memory _message) public payable",
  "function getAllDonors() view returns (tuple(address,uint256,uint256,string)[])",
  "event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string message)"
];

const DonationForm = ({ account, provider, onSuccess }) => {
  const [amount, setAmount] = useState('0.01');
  const [message, setMessage] = useState('Semoga membantu!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const contractAddress = '0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('Silakan hubungkan wallet terlebih dahulu');
      return;
    }
    
    if (!window.ethereum) {
      setError('MetaMask tidak ditemukan');
      return;
    }
    
    if (!contractAddress) {
      setError('Contract address belum dikonfigurasi');
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      setError('Jumlah donasi harus lebih dari 0');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const browserProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, DONATION_ABI, signer);
      
      const tx = await contract.donate(message, {
        value: ethers.parseEther(amount)
      });
      
      console.log('📝 Transaksi dikirim:', tx.hash);
      

      const etherscanUrl = `https://sepolia.etherscan.io/tx/${tx.hash}`;
      
      setMessage('Menunggu konfirmasi...');
      
    
      const receipt = await tx.wait();
      console.log('✅ Transaksi dikonfirmasi:', receipt);
      
    
      setAmount('0.01');
      setMessage('Terima kasih atas donasinya!');
      
      
      alert(`✅ Donasi berhasil!\n\n📝 TX Hash: ${tx.hash}\n💰 Amount: ${amount} ETH\n💬 Message: "${message}"`);
      
      
      window.open(etherscanUrl, '_blank');
      
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err) {
      console.error('❌ Error:', err);
      
      let errorMessage = 'Gagal mengirim donasi';
      if (err.message.includes('insufficient funds')) {
        errorMessage = 'Saldo tidak cukup. Pastikan Anda memiliki ETH di jaringan Sepolia.';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaksi ditolak oleh pengguna';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form-container">
      <h3 className="form-title">
        <i className="fas fa-hand-holding-heart"></i>
        Kirim Donasi
      </h3>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="donation-form">
        <div className="form-group">
          <label htmlFor="amount">
            <i className="fas fa-coins"></i> Jumlah ETH
          </label>
          <div className="amount-input-group">
            <input
              type="number"
              id="amount"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              disabled={loading}
              className="amount-input"
            />
            <span className="amount-label">ETH</span>
          </div>
          <small className="amount-hint">
            ≈ ${(parseFloat(amount) * 3500).toFixed(2)} USD
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="message">
            <i className="fas fa-comment"></i> Pesan
          </label>
          <input
            type="text"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan Anda..."
            disabled={loading}
            className="message-input"
            maxLength="100"
          />
          <small className="char-count">
            {message.length}/100 karakter
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="contract">
            <i className="fas fa-file-contract"></i> Kontrak Donasi
          </label>
          <input
            type="text"
            value={contractAddress}
            readOnly
            className="contract-input"
          />
          <small className="contract-hint">
            Sepolia Testnet - {contractAddress.substring(0, 8)}...{contractAddress.substring(contractAddress.length - 8)}
          </small>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !account}
          className="submit-button"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Mengirim Donasi...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Kirim Donasi
            </>
          )}
        </button>
        
        {!account && (
          <div className="wallet-warning">
            <i className="fas fa-exclamation-circle"></i>
            Hubungkan wallet terlebih dahulu untuk berdonasi
          </div>
        )}
      </form>
      
      <div className="form-info">
        <p>
          <i className="fas fa-info-circle"></i>
          Donasi akan dikirim ke kontrak di jaringan Sepolia Testnet.
          Anda memerlukan Sepolia ETH untuk transaksi.
        </p>
      </div>
    </div>
  );
};

export default DonationForm;