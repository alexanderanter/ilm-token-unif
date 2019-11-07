pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/access/rbac/RBAC.sol";


contract NAdmin is RBAC{
    string constant ADMIN_ROLE = "admin";

    constructor() public {}

    modifier onlyAdmins() {
        require(isAdmin(msg.sender), "Admin rights required.");
        _;
    }

    /**
     * @dev Allows admins to add people to the admin list.
     * @param _toAdd The address to be added to admin list.
     */
    function addToAdmins(address _toAdd) public {
        require(!isAdmin(_toAdd), "Address is admin already");
        addRole(_toAdd,ADMIN_ROLE);
    }

    function addListToAdmins(address[] _toAdd) public {
        for(uint256 i = 0; i<_toAdd.length; i++){
            addToAdmins(_toAdd[i]);
        }
    }

    function removeFromAdmins(address _toRemove) public {
        require(isAdmin(_toRemove), "Address is not admin already");
        removeRole(_toRemove,ADMIN_ROLE);
    }

    function removeListFromAdmins(address[] _toRemove) public {
        for(uint256 i = 0; i<_toRemove.length; i++){
            removeFromAdmins(_toRemove[i]);
        }
    }

    function isAdmin(address _address) public view returns(bool) {
        return hasRole(_address,ADMIN_ROLE);
    }
}
