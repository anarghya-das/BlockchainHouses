pragma solidity ^0.5.0;

contract Owners {
    address[2] public buyers;
    // adding house to the bought blockhain
function addHouse(uint houseId) public returns (uint) {
  require(houseId >= 0 && houseId <= 2);
  buyers[houseId] = msg.sender;
  return houseId;
}

// Retrieving the buyers
function getBuyers() public view returns (address[2] memory) {
  return buyers;
}

}