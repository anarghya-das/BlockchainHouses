pragma solidity ^0.5.0;

contract Owners {
    address[1] public buyers;
    // adding house to the bought blockhain
function addHouse(uint houseId) public returns (uint) {
  require(houseId >= 0 && houseId <= 1);
  buyers[houseId] = msg.sender;
  return houseId;
}

// Retrieving the buyers
function getBuyers() public view returns (address[1] memory) {
  return buyers;
}

}