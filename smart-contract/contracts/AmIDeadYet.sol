// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AmIDeadYet is ERC721URIStorage {
    using Strings for uint256;

    // ========== 数据结构 ==========
    struct User {
        bool isRegistered;
        bool isDead;
        uint256 balance;           // 遗产余额
        uint256 lastCheckIn;       // 上次签到时间
        address heir;              // 继承人
        string lastWords;          // 遗言 (NFT 内容)
        uint256 deathTime;         // 死亡时间
        uint256 tombstoneId;       // 墓碑 NFT ID
    }
    
    mapping(address => User) public users;
    address[] public userList;
    
    // 社交与 NFT 核心
    mapping(bytes32 => address) public quoteToAuthor; // 遗言查重：哈希 -> 作者
    uint256 public nextTokenId;
    
    // ========== 参数 ==========
    uint256 public constant DEATH_THRESHOLD = 7 days;
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    
    // ========== 事件 ==========
    event Registered(address indexed user);
    event CheckedIn(address indexed user, uint256 timestamp);
    event Died(address indexed user, uint256 timestamp);
    event TombstoneMinted(address indexed owner, uint256 tokenId, string quote);
    event QuoteClaimed(address indexed author, string quote);

    constructor() ERC721("DeadOrAlive Tombstone", "DIED") {}

    // ========== 核心逻辑 ==========

    /// @notice 注册：先占坑你的遗言（独一无二）
    function register(string memory _lastWords) external payable {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(msg.value >= MIN_DEPOSIT, "Deposit too small");
        
        // 1. 遗言查重 (Monad Cheap Gas 让这成为可能)
        bytes32 quoteHash = keccak256(bytes(_lastWords));
        require(quoteToAuthor[quoteHash] == address(0), "Quote already taken! Be original.");
        
        // 2. 锁定遗言
        quoteToAuthor[quoteHash] = msg.sender;
        
        users[msg.sender] = User({
            isRegistered: true,
            isDead: false,
            balance: msg.value,
            lastCheckIn: block.timestamp,
            heir: address(0),
            lastWords: _lastWords,
            deathTime: 0,
            tombstoneId: 0
        });
        
        userList.push(msg.sender);
        emit Registered(msg.sender);
        emit QuoteClaimed(msg.sender, _lastWords);
    }

    /// @notice 签到
    function checkIn() external {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isDead, "You are dead");
        users[msg.sender].lastCheckIn = block.timestamp;
        emit CheckedIn(msg.sender, block.timestamp);
    }

    function setHeir(address _heir) external {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isDead, "You are dead");
        require(_heir != address(0), "Invalid heir");
        users[msg.sender].heir = _heir;
    }

    function addToEstate() external payable {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isDead, "You are dead");
        require(msg.value > 0, "No deposit");
        users[msg.sender].balance += msg.value;
    }
    
    /// @notice 判定死亡 + 铸造墓碑 NFT
    function declareDeath(address _user) external {
        User storage u = users[_user];
        require(u.isRegistered && !u.isDead, "Invalid target");
        require(block.timestamp > u.lastCheckIn + DEATH_THRESHOLD, "Still alive");
        
        u.isDead = true;
        u.deathTime = block.timestamp;
        
        // 铸造墓碑 NFT (给继承人 或 死者地址)
        // 设定：归继承人作为战利品，如果没有继承人，归死者自己（变成鬼魂持有）
        address recipient = u.heir != address(0) ? u.heir : _user;
        
        uint256 tokenId = nextTokenId++;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, u.lastWords); // 简化：直接把遗言当 URI
        
        u.tombstoneId = tokenId;
        
        // 遗产转移
        if (u.heir != address(0) && u.balance > 0) {
             payable(u.heir).transfer(u.balance);
             u.balance = 0;
        }

        emit Died(_user, block.timestamp);
        emit TombstoneMinted(recipient, tokenId, u.lastWords);
    }
    
    // ========== 社交状态查询 (利用 Monad 高吞吐) ==========
    
    /// @notice 批量检查朋友状态 (前端可每秒轮询)
    function checkFriendsStatus(address[] calldata friends) external view returns (
        bool[] memory isDead, 
        uint256[] memory timeLeft
    ) {
        isDead = new bool[](friends.length);
        timeLeft = new uint256[](friends.length);
        
        for (uint256 i = 0; i < friends.length; i++) {
            User storage u = users[friends[i]];
            if (!u.isRegistered) continue;
            
            isDead[i] = u.isDead;
            
            if (!u.isDead) {
                uint256 deathTime = u.lastCheckIn + DEATH_THRESHOLD;
                if (block.timestamp < deathTime) {
                    timeLeft[i] = deathTime - block.timestamp;
                } else {
                    timeLeft[i] = 0; // 实际上应该判死，但状态还没更新
                }
            }
        }
    }
}
