pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/access/rbac/RBAC.sol";


contract Whitelisted is RBAC {
    string constant WLST_ROLE = "whitelist";
    bool public whitelistUnlocked;

    constructor() public {}

    modifier onlyWhitelisted() {
        require(whitelistUnlocked || isWhitelisted(msg.sender), "Whitelist rights required.");
        _;
    }

    function setWhitelistUnlock(bool _newStatus) public {
        require(whitelistUnlocked!=_newStatus, "You are trying to set current status again");
        whitelistUnlocked = _newStatus;
    }

    /**
     * @dev Allows admins to add people to the whitelist.
     * @param _toAdd The address to be added to whitelist.
     */
    function addToWhitelist(address _toAdd) public {
        require(!isWhitelisted(_toAdd), "Address is whitelisted already");
        addRole(_toAdd,WLST_ROLE);
    }

    function addListToWhitelist(address[] _toAdd) public {
        for(uint256 i = 0; i<_toAdd.length; i++){
            addToWhitelist(_toAdd[i]);
        }
    }

    function removeFromWhitelist(address _toRemove) public {
        require(isWhitelisted(_toRemove), "Address is not whitelisted already");
        removeRole(_toRemove,WLST_ROLE);
    }

    function removeListFromWhitelist(address[] _toRemove) public {
        for(uint256 i = 0; i<_toRemove.length; i++){
            removeFromWhitelist(_toRemove[i]);
        }
    }

    function isWhitelisted(address _address) public view returns(bool) {
        return hasRole(_address,WLST_ROLE);
    }
}
