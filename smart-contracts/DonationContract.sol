// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DonationContract
 * @dev Smart contract untuk sistem donasi ETH
 * @notice Contract ini memungkinkan pengguna mendonasikan ETH dan mencatat riwayat donasi
 */

contract DonationContract {
    
    // ============ Data Structures ============
    
    struct Donor {
        address donorAddress;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    // ============ State Variables ============
    
    Donor[] private donors;              // Array untuk menyimpan semua donor
    uint256 public totalDonations;      // Total donasi yang diterima
    address public owner;               // Pemilik contract
    
    // Mapping untuk tracking donasi per alamat
    mapping(address => uint256) public donationCount;
    mapping(address => uint256) public totalDonatedByAddress;
    
    // ============ Events ============
    
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string message
    );
    
    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    event DonationRemoved(
        address indexed donor,
        uint256 amount,
        uint256 index
    );
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validDonation() {
        require(msg.value > 0, "Donation amount must be greater than 0");
        _;
    }
    
    modifier validIndex(uint256 _index) {
        require(_index < donors.length, "Index out of range");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        // totalDonations sudah default 0
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Fungsi untuk mendonasikan ETH
     * @param _message Pesan dari donor
     */
    function donate(string memory _message) 
        public 
        payable 
        validDonation 
    {
        // Cek panjang message (optimize gas)
        require(bytes(_message).length <= 256, "Message too long");
        
        donors.push(Donor({
            donorAddress: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: _message
        }));
        
        totalDonations += msg.value;
        donationCount[msg.sender]++;
        totalDonatedByAddress[msg.sender] += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp, _message);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Ambil semua data donor
     * @return Array dari semua donor
     */
    function getAllDonors() public view returns (Donor[] memory) {
        return donors;
    }
    
    /**
     * @dev Ambil jumlah total donor
     * @return Total donor
     */
    function getDonorCount() public view returns (uint256) {
        return donors.length;
    }
    
    /**
     * @dev Ambil info donor berdasarkan index
     * @param _index Index dari donor
     * @return Donor info
     */
    function getDonorInfo(uint256 _index) 
        public 
        view 
        validIndex(_index) 
        returns (Donor memory) 
    {
        return donors[_index];
    }
    
    /**
     * @dev Ambil total donasi dalam wei
     * @return Total donasi dalam wei
     */
    function getTotalDonations() public view returns (uint256) {
        return totalDonations;
    }
    
    /**
     * @dev Ambil balance contract
     * @return Balance contract dalam wei
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Ambil donasi count dari address tertentu
     * @param _address Address donor
     * @return Jumlah donasi dari address tersebut
     */
    function getDonationCountByAddress(address _address) 
        public 
        view 
        returns (uint256) 
    {
        return donationCount[_address];
    }
    
    /**
     * @dev Ambil total donasi dari address tertentu
     * @param _address Address donor
     * @return Total donasi dari address tersebut dalam wei
     */
    function getTotalDonatedByAddress(address _address) 
        public 
        view 
        returns (uint256) 
    {
        return totalDonatedByAddress[_address];
    }
    
    /**
     * @dev Hitung rata-rata donasi
     * @return Rata-rata donasi dalam wei
     */
    function getAverageDonation() public view returns (uint256) {
        if (donors.length == 0) return 0;
        return totalDonations / donors.length;
    }
    
    /**
     * @dev Ambil donasi terbesar
     * @return Donasi terbesar dalam wei
     */
    function getLargestDonation() public view returns (uint256) {
        if (donors.length == 0) return 0;
        
        uint256 largest = donors[0].amount;
        for (uint256 i = 1; i < donors.length; i++) {
            if (donors[i].amount > largest) {
                largest = donors[i].amount;
            }
        }
        return largest;
    }
    
    /**
     * @dev Ambil donasi dari address tertentu
     * @param _address Address donor
     * @return Array donasi dari address tersebut
     */
    function getDonationsByAddress(address _address) 
        public 
        view 
        returns (Donor[] memory) 
    {
        uint256 count = donationCount[_address];
        Donor[] memory result = new Donor[](count);
        
        if (count == 0) return result;
        
        uint256 index = 0;
        for (uint256 i = 0; i < donors.length; i++) {
            if (donors[i].donorAddress == _address) {
                result[index] = donors[i];
                index++;
                if (index == count) break; // Optimize: stop when found all
            }
        }
        
        return result;
    }
    
    /**
     * @dev Cek apakah address sudah pernah donate
     * @param _address Address untuk dicek
     * @return Boolean true jika sudah donate
     */
    function hasUserDonated(address _address) public view returns (bool) {
        return donationCount[_address] > 0;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Withdraw dana dari contract
     * @param _amount Jumlah yang ingin diwithdraw dalam wei
     */
    function withdrawFunds(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(_amount <= address(this).balance, "Insufficient contract balance");
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, _amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw semua dana dari contract
     */
    function withdrawAllFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, balance, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership ke address baru
     * @param _newOwner Address owner baru
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != owner, "New owner must be different");
        
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
    
    /**
     * @dev Hapus donasi berdasarkan index (hanya owner)
     * @param _index Index donasi yang ingin dihapus
     */
    function removeDonation(uint256 _index) 
        public 
        onlyOwner 
        validIndex(_index) 
    {
        Donor memory removedDonor = donors[_index];
        
        // Update totals
        totalDonations -= removedDonor.amount;
        totalDonatedByAddress[removedDonor.donorAddress] -= removedDonor.amount;
        donationCount[removedDonor.donorAddress]--;
        
        // Swap with last element jika bukan element terakhir
        if (_index != donors.length - 1) {
            donors[_index] = donors[donors.length - 1];
        }
        donors.pop();
        
        emit DonationRemoved(removedDonor.donorAddress, removedDonor.amount, _index);
    }
    
    /**
     * @dev Emergency stop - hanya owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit FundsWithdrawn(owner, balance, block.timestamp);
    }
    
    // ============ Receive & Fallback Functions ============
    
    /**
     * @dev Receive ETH tanpa message
     */
    receive() external payable validDonation {
        donors.push(Donor({
            donorAddress: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: "No message"
        }));
        
        totalDonations += msg.value;
        donationCount[msg.sender]++;
        totalDonatedByAddress[msg.sender] += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp, "No message");
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Direct transfers not allowed. Use donate() function.");
    }
}