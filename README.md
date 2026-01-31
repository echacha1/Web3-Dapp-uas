#  Web3 DAPP - Ujian Akhir Semester

Aplikasi Web3 Decentralized yang memungkinkan pengguna untuk terhubung dengan MetaMask wallet dan melakukan donasi menggunakan cryptocurrency di Sepolia Testnet.

## ✨ Features

- 🔗 **Wallet Connection** - Integrase MetaMask untuk koneksi wallet yang aman
- 💰 **Balance Display** - Tampilkan saldo ETH dan nilai USD real-time
- 💝 **Donation System** - Kirim donasi dengan pesan ke smart contract
- 📋 **Transaction History** - Lihat riwayat semua transaksi
- 📊 **Donation Statistics** - Dashboard statistik donasi (total donor, total amount, dll)
- 🔄 **Auto Refresh** - Data otomatis refresh setiap 30 detik
- 📱 **Responsive Design** - Tampilan sempurna di desktop dan mobile

## 🛠 Tech Stack

### Frontend
- **React** 18.x - JavaScript library untuk UI
- **ethers.js** v6 - Library untuk Web3 interaction
- **CSS3** - Styling dengan gradient dan animations

### Backend
- **Node.js** + **Express.js** - REST API server
- **ethers.js** v6 - Contract interaction

### Blockchain
- **Solidity** - Smart contract language
- **Sepolia Testnet** - Ethereum test network
- **MetaMask** - Wallet provider

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- **Node.js** v14+ dan npm
- **MetaMask** browser extension installed
- **Sepolia Testnet ETH** untuk gas fees (dapatkan dari [Sepolia Faucet](https://sepolia-faucet.pk910.de/))
- **Git** untuk version control

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Web3-dapp-uas
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

### 3. Setup Backend
```bash
cd ../backend
npm install
```

### 4. Setup Environment Variables

#### Frontend (.env)
```
REACT_APP_CONTRACT_ADDRESS=0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe
```

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
CONTRACT_ADDRESS=0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## 💻 Running the Project

### Development Mode

#### Terminal 1 - Backend Server
```bash
cd backend
node server.js
```
Backend akan berjalan di `http://localhost:5000`

#### Terminal 2 - Frontend Development
```bash
cd frontend
npm start
```
Frontend akan berjalan di `http://localhost:3000`

### Production Build
```bash
cd frontend
npm run build
```

## 📁 Project Structure

```
Web3-dapp-uas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BalanceDisplay.js      # Display wallet balance
│   │   │   ├── DonationForm.js        # Form untuk donasi
│   │   │   ├── DonationList.js        # List semua donasi
│   │   │   ├── TransactionList.js     # Riwayat transaksi
│   │   │   └── WalletConnect.js       # Wallet connection component
│   │   ├── App.js                     # Main app component
│   │   ├── App.css                    # Global styles
│   │   └── index.js                   # Entry point
│   ├── .env                           # Environment variables
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── donations.js               # Donation API endpoints
│   │   └── transactions.js            # Transaction API endpoints
│   ├── server.js                      # Express server
│   ├── .env                           # Backend environment variables
│   └── package.json
│
├── smart-contracts/
│   └── DonationContract.sol           # Smart contract source code
│
└── README.md
```

## 🔗 Smart Contract Details

### Contract Address (Sepolia Testnet)
```
0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe
```

### Main Function
```solidity
function donate(string _message) public payable
```
- **Parameter**: `_message` - Pesan donasi (max 256 karakter)
- **Value**: ETH yang ingin didonasikan
- **Event**: Emit `DonationReceived(donor, amount, message)`

## 🔌 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Donations
```
GET /api/donations
- Get semua donasi

GET /api/donations/stats
- Get statistik donasi (total donor, total amount, dll)

POST /api/donations/create
- Create donasi baru
- Body: { txHash, donor, amount, message }
```

### Transactions
```
GET /api/transactions
- Get semua transaksi
```

## 📖 Usage Guide

### 1. Koneksikan Wallet
- Klik tombol "Connect MetaMask" di Wallet Connection section
- Approve request di MetaMask popup
- Wallet akan terhubung dan menampilkan address & balance

### 2. Lihat Balance
- Balance section menampilkan:
  - Alamat wallet (shortened)
  - Saldo ETH
  - Nilai USD (@ $3,500/ETH)
  - Network yang terhubung

### 3. Lakukan Donasi
- Masukkan jumlah ETH di "Jumlah Donasi"
- Masukkan pesan (opsional) di "Pesan Donasi"
- Klik tombol "Kirim Donasi"
- Approve transaksi di MetaMask
- Tunggu konfirmasi blockchain

### 4. Lihat Riwayat
- **Donation List**: Lihat semua donasi yang masuk
- **Transaction History**: Lihat semua transaksi termasuk gas fees
- **User Donations**: Lihat donasi yang Anda lakukan

## ⚙️ Configuration

### Mengubah Contract Address
1. Update di `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS`
2. Update di `backend/.env`: `CONTRACT_ADDRESS`
3. Restart frontend dan backend

### Mengubah RPC Endpoint
1. Edit `backend/.env`: `SEPOLIA_RPC_URL`
2. Gunakan salah satu provider:
   - `https://ethereum-sepolia-rpc.publicnode.com` (recommended)
   - `https://sepolia.gateway.tenderly.co`
   - `https://1rpc.io/sepolia`

### Mengubah Network
1. Edit `frontend/src/components/WalletConnect.js`
2. Ubah chain ID di line: `if (chainId !== '0xaa36a7')`
3. Update contract address untuk network yang baru

## 🐛 Troubleshooting

### MetaMask tidak terdeteksi
- Pastikan MetaMask extension sudah installed
- Refresh halaman browser
- Cek browser console untuk error messages

### Cannot connect to RPC
- Cek internet connection
- Verifikasi RPC URL di `.env`
- Coba ganti RPC endpoint yang lain

### Transaksi pending terlalu lama
- Cek di [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Increase gas price jika perlu
- Wait untuk blockchain confirmation

### Balance tidak update
- Klik tombol Refresh di Wallet Connection
- Wait 30 detik untuk auto-refresh
- Check network connection

## 📦 Dependencies

### Frontend
```json
{
  "react": "^18.2.0",
  "ethers": "^6.16.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "ethers": "^6.16.0",
  "dotenv": "^16.0.0"
}
```

## 📝 Notes

- Semua transaksi ada di Sepolia Testnet (bukan Mainnet)
- Gunakan testnet ETH dari faucet untuk testing
- Contract address: `0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe`
- Data disimpan di backend server (bukan di blockchain)
- Auto-refresh setiap 30 detik

