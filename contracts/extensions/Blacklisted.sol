pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/access/rbac/RBAC.sol";


contract Blacklisted is RBAC {
    string constant BKLST_ROLE = "blacklist";
    bool public blacklistUnlocked;

    constructor() public {}

    modifier notBlacklisted() {
        require(blacklistUnlocked || !isBlacklisted(msg.sender), "Blacklist rights required.");
        _;
    }

    function setBlacklistUnlock(bool _newStatus) public {
        require(blacklistUnlocked!=_newStatus, "You are trying to set current status again");
        blacklistUnlocked = _newStatus;
    }

    /**
     * @dev Allows admins to add people to the blacklist.
     * @param _toAdd The address to be added to blacklist.
     */
    function addToBlacklist(address _toAdd) public {
        require(!isBlacklisted(_toAdd), "Address is blacklisted already");
        addRole(_toAdd,BKLST_ROLE);
    }

    function addListToBlacklist(address[] _toAdd) public {
        for(uint256 i = 0; i<_toAdd.length; i++){
            addToBlacklist(_toAdd[i]);
        }
    }

    function removeFromBlacklist(address _toRemove) public {
        require(isBlacklisted(_toRemove), "Address is not blacklisted");
        removeRole(_toRemove,BKLST_ROLE);
    }

    function removeListFromBlacklist(address[] _toRemove) public {
        for(uint256 i = 0; i<_toRemove.length; i++){
            removeFromBlacklist(_toRemove[i]);
        }
    }

    function isBlacklisted(address _address) public view returns(bool) {
        return hasRole(_address,BKLST_ROLE);
    }
}
