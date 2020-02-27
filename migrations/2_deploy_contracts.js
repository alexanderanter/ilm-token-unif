const Proxy = artifacts.require('Proxy');
const Controller = artifacts.require('Controller');

const decimals = 18;
const initCap = (2**256-1)/10**decimals; //max => (2**256-1)/10**decimals

module.exports = async function(deployer) {
	/*    
	// deploy proxy
    await deployer.deploy(Proxy);
    const proxy = await Proxy.deployed();
    // deploy controller
    await deployer.deploy(Controller);
    const controller = await Controller.deployed();
    // create binding of proxy with controller interface
    let token = Controller.at(proxy.address);
    // use binding
    await token.initialize(controller.address, initCap*(10**decimals));
    // check result
    let cap = await token.cap();
    console.log(cap.toNumber());
	*/
};
