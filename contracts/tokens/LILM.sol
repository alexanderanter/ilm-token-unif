pragma solidity 0.4.24;

import "../Controller.sol";


contract LILM is Controller {

    mapping(address => bool) public authorized;
    bool public unlocked;

    /**
    * @dev Modified modifier to make a function callable only when the contract
    * is not paused or if the msg.sender is the defined sale contract.
    */
    modifier whenNotLockedOrAuthorized() {
        require(msg.sender == owner || unlocked || authorized[msg.sender], "Token locked or sender unauthorized");
        _;
    }

    constructor() public {}

    function setAuthorized(address _addr, bool _status) public onlyOwner returns (bool) {
        require(authorized[_addr] != _status, "That is already the current status");
        authorized[_addr] = _status;
    }

    function setUnlock(bool _status) public onlyOwner returns (bool) {
        require(unlocked != _status, "That is already the current status");
        unlocked = _status;
    }

    function transfer(address _to, uint256 _value) public whenNotLockedOrAuthorized returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public whenNotLockedOrAuthorized returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotLockedOrAuthorized returns (bool) {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue)
        public whenNotLockedOrAuthorized returns (bool success)
    {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue)
        public whenNotLockedOrAuthorized returns (bool success)
    {
        return super.decreaseApproval(_spender, _subtractedValue);
    }
}
