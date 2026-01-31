const express = require('express');
const router = express.Router();
let dummyTransactions = [
    {
        id: 1,
        donor: "0x742d35Cc6634C0532925a3b844Bc9e7595f8bE21",
        amount: "0.5",
        currency: "ETH",
        message: "Semoga bermanfaat untuk yang membutuhkan",
        timestamp: "2026-01-25T10:30:00Z",
        txHash: "0x8a7d56e92f6bc8b6a8f8b6c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8"
    },
    {
        id: 2,
        donor: "0x892d35Cc6634C0532925a3b844Bc9e7595f8bE32",
        amount: "0.25",
        currency: "ETH",
        message: "Donasi untuk kebaikan",
        timestamp: "2026-01-26T14:45:00Z",
        txHash: "0x9b8e67f03g7cd9c7b9g9c7d9e9f9b9c9d9e9f9b9c9d9e9f9b9c9d9e9f9b9c9d"
    },
    {
        id: 3,
        donor: "0x1234567890AbCdEf1234567890AbCdEf12345678",
        amount: "1.0",
        currency: "ETH",
        message: "Sukses selalu untuk projectnya!",
        timestamp: "2026-01-27T09:15:00Z",
        txHash: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1"
    },
    {
        id: 4,
        donor: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
        amount: "0.1",
        currency: "ETH",
        message: "Terus berkarya!",
        timestamp: "2026-01-28T16:20:00Z",
        txHash: "0xdef789ghi012def789ghi012def789ghi012def789ghi012def789ghi012def7"
    },
    {
        id: 5,
        donor: "0x5678901234AbCdEf5678901234AbCdEf56789012",
        amount: "0.75",
        currency: "ETH",
        message: "Kontribusi kecil dari saya",
        timestamp: "2026-01-29T08:00:00Z",
        txHash: "0xghi345jkl678ghi345jkl678ghi345jkl678ghi345jkl678ghi345jkl678ghi3"
    }
];


router.get('/', (req, res) => {
    try {
        const totalAmount = dummyTransactions.reduce(
            (sum, tx) => sum + parseFloat(tx.amount), 
            0
        );
        res.json({
            success: true,
            message: 'Data transaksi berhasil diambil',
            data: dummyTransactions,
            summary: {
                totalTransactions: dummyTransactions.length,
                totalAmount: totalAmount.toFixed(2),
                currency: 'ETH'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil data transaksi',
            message: error.message
        });
    }
});


router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const transaction = dummyTransactions.find(tx => tx.id === parseInt(id));

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaksi tidak ditemukan',
                id: id
            });
        }

        res.json({
            success: true,
            message: 'Transaksi ditemukan',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil transaksi',
            message: error.message
        });
    }
});


router.post('/', (req, res) => {
    try {
        const { donor, amount, message, txHash, timestamp } = req.body;

       
        if (!donor || !amount || !txHash) {
            return res.status(400).json({
                success: false,
                error: 'Data tidak lengkap',
                required: ['donor', 'amount', 'txHash']
            });
        }

       
        const newTransaction = {
            id: dummyTransactions.length + 1,
            donor: donor,
            amount: parseFloat(amount).toFixed(2),
            currency: 'ETH',
            message: message || '',
            timestamp: timestamp || new Date().toISOString(),
            txHash: txHash,
            type: 'donation'
        };

      
        dummyTransactions.push(newTransaction);

        console.log('✅ Donasi baru ditambahkan:', newTransaction);

        res.status(201).json({
            success: true,
            message: 'Donasi berhasil disimpan',
            data: newTransaction,
            totalDonations: dummyTransactions.length
        });

    } catch (error) {
        console.error('❌ Error menyimpan donasi:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal menyimpan donasi',
            message: error.message
        });
    }
});


router.get('/stats/summary', (req, res) => {
    try {
        const donations = dummyTransactions.filter(tx => tx.type === 'donation' || tx.message);
        const totalAmount = donations.reduce(
            (sum, tx) => sum + parseFloat(tx.amount), 
            0
        );

        res.json({
            success: true,
            data: {
                totalDonations: donations.length,
                totalAmount: totalAmount.toFixed(2),
                averageAmount: donations.length > 0 ? (totalAmount / donations.length).toFixed(4) : '0',
                topDonor: donations.length > 0 ? donations.reduce((max, tx) => 
                    parseFloat(tx.amount) > parseFloat(max.amount) ? tx : max
                ) : null,
                currency: 'ETH'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil statistik',
            message: error.message
        });
    }
});

module.exports = router;