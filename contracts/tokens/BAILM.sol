pragma solidity 0.4.24;

import "../Controller.sol";
import "../extensions/Blacklisted.sol";
import "../extensions/NAutoblock.sol";


/**
 * @title Blacklist and Autoblock token
 * @dev ILM token modified with blacklist and Autoblockers list functionalities.
 **/
contract BAILM is Controller, Blacklisted, NAutoblock {

    constructor() public {}

    modifier onlyAutoblockers() {
        require(msg.sender==owner || isAutoblocker(msg.sender), "Owner or Autoblocker rights required.");
        _;
    }

    function setBlacklistUnlock(bool _newStatus) public onlyAutoblockers {
        super.setBlacklistUnlock(_newStatus);
    }

    /**
     * @dev Allows autoblockers to add people to the blacklist.
     * @param _toAdd The address to be added to blacklist.
     */
    function addToBlacklist(address _toAdd) public onlyAutoblockers {
        super.addToBlacklist(_toAdd);
    }

    function addListToBlacklist(address[] _toAdd) public onlyAutoblockers {
        super.addListToBlacklist(_toAdd);
    }

    function removeFromBlacklist(address _toRemove) public onlyAutoblockers {
        super.removeFromBlacklist(_toRemove);
    }

    function removeListFromBlacklist(address[] _toRemove) public onlyAutoblockers {
        super.removeListFromBlacklist(_toRemove);
    }

    /**
     * @dev Allows autoblockers to add people to the autoblocker list.
     * @param _toAdd The address to be added to autoblocker list.
     */
    function addToAutoblockers(address _toAdd) public onlyAutoblockers {
        super.addToAutoblockers(_toAdd);
    }

    function addListToAutoblockers(address[] _toAdd) public onlyAutoblockers {
        super.addListToAutoblockers(_toAdd);
    }

    function removeFromAutoblockers(address _toRemove) public onlyAutoblockers {
        super.removeFromAutoblockers(_toRemove);
    }

    function removeListFromAutoblockers(address[] _toRemove) public onlyAutoblockers {
        super.removeListFromAutoblockers(_toRemove);
    }

    /**
     * @dev Blacklisted can't transfer tokens. If the sender is an autoblocker, the receiver becomes blacklisted
     * @param _to The address where tokens will be sent to
     * @param _value The amount of tokens to be sent
     */
    function transfer(address _to, uint256 _value) public notBlacklisted returns(bool) {
        //If the destination is not blacklisted, try to add it (only autoblockers modifier)
        if(isAutoblocker(msg.sender) && !isBlacklisted(_to) && !blacklistUnlocked) addToBlacklist(_to);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Blacklisted can't transfer tokens. If the sender is an autoblocker, the receiver becomes blacklisted Also, the msg.sender will need to be approved to do it
     * @param _from The address where tokens will be sent from
     * @param _to The address where tokens will be sent to
     * @param _value The amount of tokens to be sent
     */
    function transferFrom(address _from, address _to, uint256 _value) public notBlacklisted returns (bool) {
        require(!isBlacklisted(_from), "Source is blacklisted");
        //If the destination is not blacklisted, try to add it (only autoblockers modifier)
        if(isAutoblocker(msg.sender) && !isBlacklisted(_to) && !blacklistUnlocked) addToBlacklist(_to);
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Allow others to spend tokens from the msg.sender address. The spender can't be blacklisted
     * @param _spender The address to be approved
     * @param _value The amount of tokens to be approved
     */
    function approve(address _spender, uint256 _value) public notBlacklisted returns (bool) {
        //If the approve spender is not blacklisted, try to add it (only autoblockers modifier)
        require(!isBlacklisted(_spender) || blacklistUnlocked, "Cannot allow blacklisted addresses to spend tokens");
        return super.approve(_spender, _value);
    }

}
