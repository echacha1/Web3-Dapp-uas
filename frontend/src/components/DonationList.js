import React, { useState, useEffect } from 'react';

function DonationList({ account, provider }) {
    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
           
            const donationRes = await fetch('http://localhost:5000/api/donations');
            if (!donationRes.ok) throw new Error('Failed to fetch donations');
            const donationData = await donationRes.json();
            if (donationData.success && Array.isArray(donationData.data)) {
                setDonations(donationData.data);
            } else if (Array.isArray(donationData)) {
                setDonations(donationData);
            } else {
                setDonations([]);
            }

           
            const statsRes = await fetch('http://localhost:5000/api/donations/stats');
            if (!statsRes.ok) throw new Error('Failed to fetch stats');
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(statsData.data);
            } else if (statsData.donorCount !== undefined) {
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(`❌ Gagal mengambil data donasi: ${error.message}`);
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

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
            return dateStr || 'Unknown date';
        }
    };

    const shortenAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

  
    const userDonations = account && Array.isArray(donations)
        ? donations.filter(d => d.donor && d.donor.toLowerCase() === account.toLowerCase())
        : [];

    return (
        <div className="donation-list">
            <div className="donation-header">
                <h3>💝 Donation System (Sepolia Testnet)</h3>
                <button
                    onClick={fetchData}
                    className="refresh-button"
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {error && (
                <div className="error" style={{
                    color: '#ff6b6b',
                    padding: '15px',
                    backgroundColor: '#ffe0e0',
                    borderRadius: '8px',
                    marginBottom: '15px'
                }}>
                    {error}
                </div>
            )}

            {}
            {stats && (
                <div className="stats-dashboard" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '25px'
                }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        border: '1px solid #90caf9'
                    }}>
                        <p style={{ fontSize: '12px', color: '#1976d2', margin: 0 }}>Total Donors</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{stats.donorCount}</p>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        border: '1px solid #81c784'
                    }}>
                        <p style={{ fontSize: '12px', color: '#388e3c', margin: 0 }}>Total Donations</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{stats.totalAmount} ETH</p>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '8px',
                        border: '1px solid #ffb74d'
                    }}>
                        <p style={{ fontSize: '12px', color: '#f57c00', margin: 0 }}>Contract Balance</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{stats.contractBalance} ETH</p>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f3e5f5',
                        borderRadius: '8px',
                        border: '1px solid #ce93d8'
                    }}>
                        <p style={{ fontSize: '12px', color: '#7b1fa2', margin: 0 }}>Average Donation</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{stats.averageDonation} ETH</p>
                    </div>
                </div>
            )}

            {}
            {loading && donations.length === 0 ? (
                <div className="loading"><p>⏳ Loading donations...</p></div>
            ) : !Array.isArray(donations) || donations.length === 0 ? (
                <div className="empty" style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#888',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <p>💚 Belum ada donasi</p>
                </div>
            ) : (
                <>
                    <h4>📋 All Donations ({donations.length})</h4>
                    <div className="donations-container" style={{
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {donations.map(donation => (
                            <div key={donation.id || donation.txHash || Math.random()} className="donation-item" style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '10px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '12px' }}>
                                            From: <code>{shortenAddress(donation.donor)}</code>
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#333', fontStyle: 'italic' }}>
                                            "{donation.message || 'No message'}"
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                                            {formatDate(donation.timestamp)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                                        <p style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#28a745',
                                            margin: 0
                                        }}>
                                            {donation.amount || '0'} ETH
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {}
                    {account && (
                        <>
                            <h4 style={{ marginTop: '25px' }}>💚 Your Donations ({userDonations.length})</h4>
                            {userDonations.length === 0 ? (
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '8px',
                                    color: '#856404'
                                }}>
                                    ⚠️ Anda belum melakukan donasi
                                </div>
                            ) : (
                                <div className="user-donations-container" style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {userDonations.map(donation => (
                                        <div key={donation.id} style={{
                                            border: '1px solid #28a745',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '8px',
                                            backgroundColor: '#d4edda'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 5px 0', color: '#155724' }}>
                                                        {donation.message}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: '#155724', margin: 0 }}>
                                                        {formatDate(donation.timestamp)}
                                                    </p>
                                                </div>
                                                <p style={{
                                                    fontWeight: 'bold',
                                                    color: '#155724',
                                                    margin: 0
                                                }}>
                                                    {donation.amount} ETH
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default DonationList;