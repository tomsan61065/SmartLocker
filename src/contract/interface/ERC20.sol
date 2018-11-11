pragma solidity ^0.4.21;

interface ERC20 {
    function totalSupply() external constant returns (uint256);
    function balanceOf(address tokenOwner) external constant returns (uint256);
    function allowance(address tokenOwner, address spender) external constant returns (uint256);
    function transfer(address to, uint256 tokens) external returns (bool);
    function approve(address spender, uint256 tokens) external returns (bool);
    function transferFrom(address from, address to, uint256 tokens) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint256 tokens);
}