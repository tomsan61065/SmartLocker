pragma solidity ^0.4.21;

import "./interface/ERC20.sol";

contract Locker {
    address public admin;
    address public owner;
    
    address public tokenAddress;
    
    string public name;
    uint256 public decimal = 18;

    // 租賃價格 先給予一個固定的值
    uint256 public rentPrice = 10 * (10 ** decimal); 

    event LockOpen(address indexed who, uint256 blockTime);

    // 管理者創建立智能合約
    // _name => 名稱
    // _tokenAddress => erc20 之 address
    function Locker(string _name, address _tokenAddress) public {
        name = _name;
        admin = msg.sender;
        tokenAddress = _tokenAddress;
    }

    // 租吝 遇租吝之人 要自己call 這個function
    // 並在運作此func之前要先 call 原本的Token Contract 之 approve 
    function rent() public returns (bool) {
        // remember to approved befor transfer From
        require(ERC20(tokenAddress).transferFrom(msg.sender, this, rentPrice));
        owner = msg.sender;
        return true;
    }

    // 退租 可以由使用者或是管理者 進行
    function checkout() public returns (bool) {
        require(msg.sender == owner || msg.sender == admin);
        owner = address(0);
        return true;
    }

    function openLock() public returns (bool) {
        require(msg.sender == owner || msg.sender == admin);
        emit LockOpen(msg.sender, block.timestamp);
        return true;
    }
    
    // 管理員可以更改價格 
    // 請注意此處的價格是 有乘上decimaled 的 default 18
    function setRentPrice(uint256 _rentPrice) public returns (bool) {
        require(msg.sender == admin);
        rentPrice = _rentPrice;
        return true;
    }
    
    // 管裡員可以更改對應的 token address
    function setTokenAddress(address _tokenAddress) public {
        require(msg.sender == admin);
        tokenAddress = _tokenAddress;
    }
    // 管理員可以更改計價token 之 decimal
     function setDecimal(uint _decimal) public {
        require(msg.sender == master, "Master required.");
        rentPrice = rentPrice / decimal;
        decimal = _decimal;
        rentPrice = rentPrice * (10 ** decimal);

        emit setDecimalEvent(msg.sender, _decimal, now);
    }

    // 管理員可以將此contract 擁有的 token 轉給某個人
    function getTokenBack(address _to) public returns (bool) {
        require(msg.sender == admin);
        uint256 tokenLeft = ERC20(tokenAddress).balanceOf(this);
        return ERC20(tokenAddress).transfer(_to, tokenLeft);
    }

    // 拒絕接收 eth 幣
    function () public payable {
        revert();
    }
}