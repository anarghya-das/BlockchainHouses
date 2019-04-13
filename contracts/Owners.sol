pragma solidity ^0.5.0;

contract Owners {
    address[5] public buyers;
    // adding house to the bought blockhain
function addHouse(uint houseId) public returns (uint) {
  require(houseId >= 0 && houseId <= 5);
  buyers[houseId] = msg.sender;
  return houseId;
}

// Retrieving the buyers
function getBuyers() public view returns (address[5] memory) {
  return buyers;
}

}