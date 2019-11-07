pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/access/rbac/RBAC.sol";


contract NAutoblock is RBAC{
    string constant AUTOBLK_ROLE = "autoblocker";

    constructor() public {}

    modifier onlyAutoblockers() {
        require(isAutoblocker(msg.sender), "Autoblocker rights required.");
        _;
    }

    /**
     * @dev Allows autoblockers to add people to the autoblocker list.
     * @param _toAdd The address to be added to autoblocker list.
     */
    function addToAutoblockers(address _toAdd) public {
        require(!isAutoblocker(_toAdd), "Address is autoblocker already");
        addRole(_toAdd,AUTOBLK_ROLE);
    }

    function addListToAutoblockers(address[] _toAdd) public {
        for(uint256 i = 0; i<_toAdd.length; i++){
            addToAutoblockers(_toAdd[i]);
        }
    }

    function removeFromAutoblockers(address _toRemove) public {
        require(isAutoblocker(_toRemove), "Address is not autoblocker");
        removeRole(_toRemove,AUTOBLK_ROLE);
    }

    function removeListFromAutoblockers(address[] _toRemove) public {
        for(uint256 i = 0; i<_toRemove.length; i++){
            removeFromAutoblockers(_toRemove[i]);
        }
    }

    function isAutoblocker(address _address) public view returns(bool) {
        return hasRole(_address,AUTOBLK_ROLE);
    }
}
