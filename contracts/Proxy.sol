pragma solidity 0.4.24;

import "./DelegateProxy.sol";
import "./Delegatable.sol";


/**
 * @title Proxy
 * Basic proxy implementation to controller
 */
contract Proxy is Delegatable, DelegateProxy {

    constructor() public {}

    /**
    * @dev Function to invoke all function that are implemented in controler
    */
    function () public {
        require(delegation != address(0), "Delegation is address 0, not initialized");
        delegatedFwd(delegation, msg.data);
    }

    /**
    * @dev Function to initialize storage of proxy
    * @param _controller The address of the controller to load the code from
    */
    function initialize(address _controller, uint256) public {
        require(owner == 0, "Already initialized");
        owner = msg.sender;
        delegation = _controller;
        delegatedFwd(_controller, msg.data);
    }
}
