//// [review] Please upgrade to the last version (0.4.25)
pragma solidity ^0.4.23;

import "./DelegateProxy.sol";
import "./Delegatable.sol";

/**
 * @title Proxy
 * Basic proxy implementation to controller
 */
contract Proxy is Delegatable, DelegateProxy {

  /**
   * @dev Function to invoke all function that are implemented in controler
   */
  //// [review] Warning - this function is not 'payable'. Check this one for 'payable' implementation:
  //// [reivew] https://github.com/aragon/aragonOS/blob/dev/contracts/common/DepositableDelegateProxy.sol
  function () public {
    //// [review] Warning - not checking if 'delegation' is not ZERO!
    delegatedFwd(delegation, msg.data);
  }

  /**
   * @dev Function to initialize storage of proxy
   * @param _controller The address of the controller to load the code from
   * @param _cap Max amount of tokens that should be mintable
   */
  function initialize(address _controller, uint256 _cap) public {
    require(owner == 0);
    owner = msg.sender;
    delegation = _controller;
    delegatedFwd(_controller, msg.data);
  }

}
