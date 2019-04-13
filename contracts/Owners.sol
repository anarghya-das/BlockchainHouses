pragma solidity ^0.5.0;

contract Owners {
    address[1] public adopters;
    // Adoptg a pet
function adopt(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 1);

  adopters[petId] = msg.sender;

  return petId;
}

// Retrieving the adopters
function getAdopters() public view returns (address[1] memory) {
  return adopters;
}

}