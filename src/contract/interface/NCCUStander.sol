pragma solidity ^0.4.21;

// both setExpiredDate, approveAtoB is only authorize by owner
interface NCCUSantander {
    function setExpiredDate(uint256 time) external returns (bool);
    function approveAtoB(address from, address to, uint256 tokens) external returns (bool);

    event ApprovalAtoB(address indexed from, address indexed to, uint256 tokens);
}