//// [review] Please upgrade to the last version (0.4.25)
pragma solidity ^0.4.18;


//// [review] Seems like it is a copy-paste of the https://github.com/aragon/aragonOS/blob/dev/contracts/common/DelegateProxy.sol 
//// [review] With slight difference: 
//// [review] uint256 constant public FWD_GAS_LIMIT = 10000;
contract DelegateProxy {

    /**
    * @dev Performs a delegatecall and returns whatever the delegatecall returned (entire context execution will return!)
    * @param _dst Destination address to perform the delegatecall
    * @param _calldata Calldata for the delegatecall
    */
    function delegatedFwd(address _dst, bytes _calldata) internal {
        assembly {
            let result := delegatecall(sub(gas, 10000), _dst, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let size := returndatasize

            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
