import React, { useState, useEffect } from 'react';

function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, donations, other

    
    const fetchTransactions = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/transactions');
            const data = await response.json();
            
            console.log('Data dari backend:', data);
            
            if (data.success && Array.isArray(data.data)) {
                setTransactions(data.data);
            } else if (Array.isArray(data)) {
                setTransactions(data);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Gagal memuat transaksi');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

   
    useEffect(() => {
        fetchTransactions();
        
       
        const interval = setInterval(fetchTransactions, 30000);
        return () => clearInterval(interval);
    }, []);

   
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

   
    const formatAddress = (address) => {
        if (!address) return 'Unknown';
        if (typeof address !== 'string') return String(address).substring(0, 10);
        if (address.length <= 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };


    const filteredTransactions = transactions.filter(tx => {
        if (filterType === 'donations') {
            return tx.type === 'donation' || tx.message || tx.donor;
        } else if (filterType === 'other') {
            return tx.type !== 'donation' && !tx.message;
        }
        return true;
    });

    return (
        <div className="transaction-list-wrapper">
            <div className="transaction-header">
                <div className="header-content">
                    <h3>
                        <i className="fas fa-history"></i>
                        Riwayat Transaksi
                    </h3>
                    <p className="subtitle">Daftar donasi terbaru</p>
                </div>
                <button 
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="refresh-btn"
                    title="Refresh transaksi"
                >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                </button>
            </div>

            {}
            <div className="filter-buttons">
                <button 
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    Semua
                </button>
                <button 
                    className={`filter-btn ${filterType === 'donations' ? 'active' : ''}`}
                    onClick={() => setFilterType('donations')}
                >
                    <i className="fas fa-hand-holding-heart"></i>
                    Donasi
                </button>
                <button 
                    className={`filter-btn ${filterType === 'other' ? 'active' : ''}`}
                    onClick={() => setFilterType('other')}
                >
                    <i className="fas fa-exchange-alt"></i>
                    Lainnya
                </button>
            </div>

            {}
            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {}
            {loading ? (
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Memuat transaksi...</p>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>
                        {filterType === 'all' 
                            ? 'Belum ada transaksi' 
                            : `Belum ada transaksi ${filterType === 'donations' ? 'donasi' : 'lainnya'}`}
                    </p>
                    <small>Transaksi akan muncul di sini setelah Anda melakukan donasi</small>
                </div>
            ) : (
                <div className="transactions-container">
                    {filteredTransactions.map((tx, index) => (
                        <div key={tx.id || index} className="transaction-item">
                            {}
                            <div className="transaction-icon">
                                {tx.donor || tx.message ? (
                                    <i className="fas fa-hand-holding-heart donation-icon"></i>
                                ) : (
                                    <i className="fas fa-exchange-alt transfer-icon"></i>
                                )}
                            </div>

                            {}
                            <div className="transaction-info">
                                <div className="tx-header">
                                    <div className="tx-title">
                                        <strong>
                                            {tx.donor ? `Donasi dari ${formatAddress(tx.donor)}` : tx.from ? `Dari ${formatAddress(tx.from)}` : 'Transaksi'}
                                        </strong>
                                        {tx.message && (
                                            <span className="tx-message">{tx.message}</span>
                                        )}
                                    </div>
                                    <div className="tx-amount">
                                        <strong>{tx.amount || '0'} {tx.currency || 'ETH'}</strong>
                                    </div>
                                </div>

                                <div className="tx-details">
                                    {(tx.to || tx.recipient) && (
                                        <span className="detail-item">
                                            <i className="fas fa-arrow-right"></i>
                                            Ke: {formatAddress(tx.to || tx.recipient)}
                                        </span>
                                    )}
                                    <span className="detail-item date">
                                        <i className="fas fa-calendar-alt"></i>
                                        {formatDate(tx.timestamp || tx.date)}
                                    </span>
                                </div>

                                {}
                                {tx.txHash && (
                                    <div className="tx-hash">
                                        <a 
                                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="etherscan-link"
                                            title="Lihat di Etherscan"
                                        >
                                            <i className="fas fa-external-link-alt"></i>
                                            {formatAddress(tx.txHash)}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {}
            <div className="transaction-footer">
                <p>
                    <i className="fas fa-info-circle"></i>
                    Total transaksi: {filteredTransactions.length}
                </p>
            </div>
        </div>
    );
}

export default TransactionList;