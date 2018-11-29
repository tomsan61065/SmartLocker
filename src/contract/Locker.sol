pragma solidity ^0.4.23;

import "./Exchange.sol";

contract locker{

    address private master;
    address public owner;

    address public tokenAddress;
    uint public decimal = 18;

    uint public rentPrice = 10 * (10 ** decimal);

    //事件
    event rentLockEvent(address indexed from, uint timestamp); 
    event returnLockEvent(address indexed from, uint timestamp);
    //event openLockEvent(address indexed from, uint timestamp);
    event changePriceEvent(address indexed from, uint timestamp);
    event changeTokenAddressEvent(address indexed from, uint timestamp);
    event setDecimalEvent(address indexed from, uint value, uint timestamp);
    event getTokenBackEvent(address indexed from, address indexed to, uint value, uint timestamp);

    address[] whiteList;

    //初始化
    constructor(address _tokenAddress) public {
        master = msg.sender;
        tokenAddress = _tokenAddress;
    }

    //收 erc 20 跟動鎖的 owner
    //https://www.reddit.com/r/ethdev/comments/73mzjr/how_do_you_interact_with_any_erc20_in_a_smart/
    //應付 contract call contract 的問題
    //在運作此func之前要先 call 原本的Token Contract 之 approve 
    function rentLock() public {
        //先檢查有無租借出去
        require(owner == address(0)); // address 是否為 0x0
        //所以用 transferFrom 而非 transfer
        require(ERC223Interface(tokenAddress).transferFrom(msg.sender, this, rentPrice));
        owner = msg.sender;
        addWhiteList(owner);
        
        emit rentLockEvent(msg.sender, now); //emit call event用
    }

    //轉回給 master
    function returnLock() public {
        require(owner == msg.sender || master == msg.sender, "Owner required.");
        owner = address(0); //丟垃圾, 銷毀
        for(uint i = 0; i < whiteList.length; i++){
            delete whiteList[i];
        }

        emit returnLockEvent(msg.sender, now);
    }

    //新增至白名單
    function addWhiteList(address _others) public {
        require(msg.sender == owner);
        
        whiteList.push(_others);
    }
    //從白名單移除
    function removeWhiteList(address _others) public {
        require(msg.sender == owner);
        for(uint i = 0; i < whiteList.length; i++){
            if(_others == whiteList[i]){
                delete whiteList[i];
            }
        }
    }
    //開鎖
    function openLock(address _visitor) external view returns (uint256) {
        //回傳是否在白名單內，locker那邊發現是就開門
        
        if(_visitor == master){ // 管理員權限
            return 1;
        }
        for(uint i = 0; i < whiteList.length; i++){
            if(_visitor == whiteList[i]){
                return 1;
            }
        }
        return 0;
    }

    //管理員更動價格
    function changePrice(uint _value) public {
        require(msg.sender == master, "Master required.");
        rentPrice = _value;

        emit changePriceEvent(msg.sender, now);
    }

    //更改 token address
    function changeTokenAddress(address _tokenAddress) public {
        require(msg.sender == master, "Master required.");
        tokenAddress = _tokenAddress;

        emit changeTokenAddressEvent(msg.sender, now);
    }

    // 管理員可以更改計價token 之 decimal
    function setDecimal(uint _decimal) public {
        require(msg.sender == master, "Master required.");
        require(_decimal != 0, "decimal can not be zero.");
        rentPrice = rentPrice / decimal;
        decimal = _decimal;
        rentPrice = rentPrice * (10 ** decimal);

        emit setDecimalEvent(msg.sender, _decimal, now);
    }

    // 管理員可以將此contract 擁有的 token 轉給某個人
    // 回收 token
    function getTokenBack(address _to) public returns (bool) {
        require(msg.sender == master, "Master required.");
        uint tokenLeft = ERC223Interface(tokenAddress).balanceOf(this);
        return ERC223Interface(tokenAddress).transfer(_to, tokenLeft); //聖文: 這樣寫就對了

        emit getTokenBackEvent(msg.sender, _to, tokenLeft, now);
    }

}