pragma solidity 0.4.24;


/**
* @title Delegatable
* ownable contract extended by one more variable
*/
contract Delegatable {
    address public empty1; // unknown slot
    address public empty2; // unknown slot
    address public empty3;  // unknown slot
    address public owner;  // matches owner slot in controller
    address public delegation; // matches thisAddr slot in controller

    event DelegationTransferred(address indexed previousDelegate, address indexed newDelegation);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender is not the owner");
        _;
    }

    constructor() public {}

    /**
    * @dev Allows owner to transfer delegation of the contract to a newDelegation.
    * @param _newDelegation The address to transfer delegation to.
    */
    function transferDelegation(address _newDelegation) public onlyOwner {
        require(_newDelegation != address(0), "Trying to transfer to address 0");
        emit DelegationTransferred(delegation, _newDelegation);
        delegation = _newDelegation;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Trying to transfer to address 0");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
