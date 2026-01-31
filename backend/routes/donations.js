const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

const SEPOLIA_RPC_URLS = [
    process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc2.sepolia.org",
    "https://sepolia.gateway.tenderly.co",
    "wss://ethereum-sepolia-rpc.publicnode.com"
];


const DONATION_CONTRACT_ABI = [

    "function getAllDonors() external view returns (tuple(address donorAddress, uint256 amount, uint256 timestamp, string message)[])",
    "function getDonorCount() external view returns (uint256)",
    "function getTotalDonations() external view returns (uint256)",
    "function getContractBalance() external view returns (uint256)",
    "function getDonorInfo(uint256 _index) external view returns (tuple(address donorAddress, uint256 amount, uint256 timestamp, string message))",
    "function getAverageDonation() external view returns (uint256)",
    "function getLargestDonation() external view returns (uint256)",
    
    
    "function donate(string memory _message) external payable",
    "function withdrawFunds(uint256 _amount) external",
    
    
    "function owner() external view returns (address)",
    
    
    "event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string message)"
];

async function getProvider() {
    for (const rpcUrl of SEPOLIA_RPC_URLS) {
        try {
            console.log(`🔗 Connecting to: ${rpcUrl}`);
            const provider = new ethers.JsonRpcProvider(rpcUrl, {
                chainId: 11155111,
                name: 'sepolia'
            });
            

            const network = await provider.getNetwork();
            const blockNumber = await provider.getBlockNumber();
            
            console.log(`✅ Connected to Sepolia via ${rpcUrl.split('//')[1].split('/')[0]}`);
            console.log(`📦 Chain ID: ${network.chainId}, Block: ${blockNumber}`);
            
            return provider;
        } catch (error) {
            console.log(`❌ Failed ${rpcUrl}: ${error.message}`);
            continue;
        }
    }
    throw new Error('All RPC endpoints failed');
}


async function getContract() {
    try {
        const provider = await getProvider();
        const contractAddress = "0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe";
        
        return new ethers.Contract(contractAddress, DONATION_CONTRACT_ABI, provider);
    } catch (error) {
        console.error('Error getting contract:', error);
        return null;
    }
}

const DUMMY_DATA = {
    success: true,
    message: "Using live contract data",
    contractAddress: "0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe",
    donorCount: 0,
    totalDonations: "0",
    contractBalance: "0",
    donations: [],
    stats: {
        averageDonation: "0",
        largestDonation: "0"
    }
};

router.get('/', async (req, res) => {
    try {
        const contract = await getContract();
        
        if (!contract) {
            return res.status(500).json({
                success: false,
                message: "Failed to connect to blockchain",
                ...DUMMY_DATA
            });
        }

    
        const [donorCount, totalDonations, contractBalance, allDonors] = await Promise.all([
            contract.getDonorCount(),
            contract.getTotalDonations(),
            contract.getContractBalance(),
            contract.getAllDonors().catch(() => []) 
        ]);

        
        const formattedDonations = allDonors.map((donor, index) => ({
            id: index,
            donor: donor.donorAddress,
            amount: ethers.formatEther(donor.amount),
            amountWei: donor.amount.toString(),
            timestamp: new Date(Number(donor.timestamp) * 1000).toISOString(),
            message: donor.message || "No message",
            transactionUrl: `https://sepolia.etherscan.io/address/${donor.donorAddress}`
        }));

      
        const averageDonation = await contract.getAverageDonation().catch(() => 0);
        const largestDonation = await contract.getLargestDonation().catch(() => 0);

        res.json({
            success: true,
            message: "Data retrieved successfully from blockchain",
            contractAddress: contract.target,
            network: "Sepolia Testnet",
            donorCount: Number(donorCount),
            totalDonations: ethers.formatEther(totalDonations),
            contractBalance: ethers.formatEther(contractBalance),
            donations: formattedDonations,
            stats: {
                averageDonation: ethers.formatEther(averageDonation),
                largestDonation: ethers.formatEther(largestDonation)
            }
        });

    } catch (error) {
        console.error("Error fetching donations:", error);
        
        res.status(500).json({
            success: false,
            message: "Error reading from contract",
            error: error.message,
            ...DUMMY_DATA
        });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const contract = await getContract();
        
        if (!contract) {
            return res.json({
                success: false,
                message: "Using dummy stats - RPC connection failed",
                totalDonations: "0",
                donorCount: 0,
                averageDonation: "0",
                largestDonation: "0",
                contractBalance: "0"
            });
        }

        const [donorCount, totalDonations, contractBalance, averageDonation, largestDonation] = await Promise.all([
            contract.getDonorCount(),
            contract.getTotalDonations(),
            contract.getContractBalance(),
            contract.getAverageDonation().catch(() => 0),
            contract.getLargestDonation().catch(() => 0)
        ]);

        res.json({
            success: true,
            totalDonations: ethers.formatEther(totalDonations),
            donorCount: Number(donorCount),
            averageDonation: ethers.formatEther(averageDonation),
            largestDonation: ethers.formatEther(largestDonation),
            contractBalance: ethers.formatEther(contractBalance),
            network: "Sepolia Testnet"
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        res.json({
            success: false,
            message: "Using dummy stats",
            totalDonations: "0",
            donorCount: 0,
            averageDonation: "0",
            largestDonation: "0",
            contractBalance: "0"
        });
    }
});


router.get('/address/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const contract = await getContract();
        
        if (!contract) {
            return res.json({
                success: false,
                message: "RPC connection failed",
                donations: []
            });
        }

        
        const allDonors = await contract.getAllDonors().catch(() => []);
        const userDonations = allDonors.filter(donor => 
            donor.donorAddress.toLowerCase() === address.toLowerCase()
        );

        res.json({
            success: true,
            address: address,
            donationCount: userDonations.length,
            totalDonated: ethers.formatEther(
                userDonations.reduce((sum, donor) => sum + donor.amount, 0n)
            ),
            donations: userDonations.map((donor, index) => ({
                amount: ethers.formatEther(donor.amount),
                message: donor.message,
                timestamp: new Date(Number(donor.timestamp) * 1000).toISOString()
            }))
        });

    } catch (error) {
        console.error("Error fetching address donations:", error);
        res.json({
            success: false,
            message: "Error fetching donations for address",
            donations: []
        });
    }
});


router.get('/info', async (req, res) => {
    try {
        const contract = await getContract();
        
        if (!contract) {
            return res.json({
                success: false,
                message: "RPC connection failed",
                contractAddress: "0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe",
                network: "Sepolia Testnet",
                owner: "Unknown"
            });
        }

        const owner = await contract.owner().catch(() => "Unknown");

        res.json({
            success: true,
            contractAddress: contract.target,
            network: "Sepolia Testnet",
            owner: owner,
            etherscanUrl: `https://sepolia.etherscan.io/address/${contract.target}`,
            abiFunctions: DONATION_CONTRACT_ABI.length
        });

    } catch (error) {
        console.error("Error fetching contract info:", error);
        res.json({
            success: false,
            contractAddress: "0xd12c087aA33B4572770C9a2c148Dc52E224cF9Fe",
            network: "Sepolia Testnet",
            owner: "Unknown"
        });
    }
});

module.exports = router;