const Proxy = artifacts.require('Proxy');
const Controller = artifacts.require('BAILM');
//const Controller2 = artifacts.require('./Controller2.sol');

//Use Chai.should for assertion
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const name = "Blacklisted Autoblock ILM token";
const symbol = "BAILM";
const decimals = 18;
const initCap = 400000000;

const name2 = "BAILM2";
const symbol2 = "BAILM2";
const decimals2 = 16;
const initCap2 = 500000000;

contract('BAILM', (accounts) => {
    let proxy;
    let token;
    let controller;

    beforeEach(async () => {
        proxy = await Proxy.new();
        controller = await Controller.new();
        token = Controller.at(proxy.address);
    });

    describe('BAILM - ILM core token tests', function () {
        it('should be initializable through proxy', async () => {
            // initialize contract
            await token.initialize(controller.address, initCap);

            // check total supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 0);
            // check cap
            let cap = await token.cap();
            assert.equal(cap.toNumber(), initCap);
            // check wiring to proxy
            let del = await proxy.delegation();
            assert.equal(del, controller.address);
            // check wiring to proxy
            let addr = await token.thisAddr();
            assert.equal(addr, controller.address);
        });

        it('should not be initializable without proxy', async () => {
            // try to call initialize() without delegatecall
            controller.initialize(controller.address, initCap).should.be.rejectedWith('revert');
        });

        it('should mint a given amount of tokens to a given address', async function () {
            // initialize contract
            await token.initialize(controller.address, 100);
            // mint some tokens
            const result = await token.mint(accounts[0], 100);
            // validate balance
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
        });

        it('should not allow to mint over the cap', async function () {
            // initialize contract
            await token.initialize(controller.address, 100);
            // fail while trying to mint more than cap
            await token.mint(accounts[0], 200).should.be.rejectedWith('revert');
        });

        it('should allow to update controller', async function () {
        // initialize contract
            await token.initialize(controller.address, 200);
            // mint some tokens
            let result = await token.mint(accounts[0], 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
            // deploy new controller
            let newController = await Controller.new();
            //Transfer delegation = upgrade controller
            await proxy.transferDelegation(newController.address);
            // check wiring
            let delegation = await proxy.delegation();
            assert.equal(delegation, newController.address);
            // mint some more tokens on top
            result = await token.mint(accounts[0], 100);
            // validate supply
            totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 200);
        });
        /*
        it('should allow to update controller to another with different logic', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);
            //check params
            assert.equal(await token.name(), name);
            assert.equal(await token.symbol(), symbol);
            assert.equal(await token.decimals(), decimals);
            // deploy new controller
            let newController = await Controller2.new();
            //Transfer delegation = upgrade controller
            await proxy.transferDelegation(newController.address);
            // check wiring
            let delegation = await proxy.delegation();
            assert.equal(delegation, newController.address);
            //check params
            assert.equal(await token.name(), name2);
            assert.equal(await token.symbol(), symbol2);
            assert.equal(await token.decimals(), decimals2);
            // mint some tokens
            let result = await token.mint(accounts[0], 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
        });
        */
        it('check ownership transfer', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);

            let other = accounts[1];
            await token.transferOwnership(other);
            let owner = await token.owner();

            assert.isTrue(owner === other);
        });

        it('should prevent non-owners from transfering ownership', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);
            const other = accounts[2];
            const owner = await token.owner.call();
            assert.isTrue(owner !== other);
            await token.transferOwnership(other, { from: other }).should.be.rejectedWith('revert');
        });

        it('should prevent non-owners to mint', async function () {
            // initialize contract
            await token.initialize(controller.address, 100);
            //transfer ownership
            let other = accounts[1];
            await token.transferOwnership(other);
            let owner = await token.owner();
            assert.isTrue(owner !== accounts[0]);
            // fail while trying to mint
            await token.mint(accounts[0], 100).should.be.rejectedWith('revert');
        });

        it('should prevent non-owners to update controller', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);
            // mint some tokens
            let result = await token.mint(accounts[0], 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
            // deploy new controller
            let newController = await Controller.new();
            //transfer ownership
            let other = accounts[1];
            await token.transferOwnership(other);
            let owner = await token.owner();
            assert.isTrue(owner !== accounts[0]);
            //Fail when trying to update delegation by the non-owner
            await proxy.transferDelegation(newController.address).should.be.rejectedWith('revert');
        });

        it('should mint a given amount of tokens to a given address after ownership transfer', async function () {
            // initialize contract
            await token.initialize(controller.address, 100);
            //transfer ownership
            let other = accounts[1];
            await token.transferOwnership(other);
            let owner = await token.owner();
            assert.isTrue(owner !== accounts[0]);
            // mint some tokens
            const result = await token.mint(accounts[0], 100, {from: other});
            // validate balance
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
        });

        it('should allow to update controller after ownership transfer', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);
            // mint some tokens
            let result = await token.mint(accounts[0], 100);
            // validate supply
            let totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 100);
            //transfer ownership
            let other = accounts[1];
            await token.transferOwnership(other);
            let owner = await token.owner();
            assert.isTrue(owner !== accounts[0]);
            // deploy new controller
            let newController = await Controller.new({from: other});
            //Transfer delegation = upgrade controller
            await proxy.transferDelegation(newController.address,{from: other});
            // check wiring
            let delegation = await proxy.delegation();
            assert.equal(delegation, newController.address);
            // mint some more tokens on top
            result = await token.mint(accounts[0], 100, {from: other});
            // validate supply
            totalSupply = await token.totalSupply();
            assert.equal(totalSupply.toNumber(), 200);
        });

        it('should guard ownership against stuck state', async function () {
            // initialize contract
            await token.initialize(controller.address, 200);
            let originalOwner = await token.owner();
            await token.transferOwnership(null, { from: originalOwner }).should.be.rejectedWith('revert');
        });
    });

    describe('Autoblocker privileges check', function () {
        it('owner can add 1 autoblocker', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            // can't add him again
            token.addToAutoblockers(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can add many autoblocker', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToAutoblockers([accounts[1],accounts[2]]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker1 && isAutoblocker2, true);
        });
        it('owner can remove 1 autoblocker', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            await token.removeFromAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            // can't remove him again
            token.removeFromAutoblockers(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can remove many autoblocker', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToAutoblockers([accounts[1],accounts[2]]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker1 && isAutoblocker2, true);
            await token.removeListFromAutoblockers([accounts[1],accounts[2]]);
            isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker1 || isAutoblocker2, false);
        });
        it('autoblocker can add 1 more autoblocker (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker1, true);
            // non-autoblocker can't add second autoblocker
            await token.addToAutoblockers(accounts[2], {from: accounts[4]}).should.be.rejectedWith('revert');
            // autoblocker adds second autoblocker
            await token.addToAutoblockers(accounts[2], {from: accounts[1]});
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker2, true);
        });
        it('autoblocker can add many more autoblocker (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker1, true);
            // non-autoblocker can't add second and third autoblockers
            await token.addListToAutoblockers([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            // autoblocker adds second and third autoblockers
            await token.addListToAutoblockers([accounts[2],accounts[3]], {from: accounts[1]});
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            let isAutoblocker3 = await token.isAutoblocker(accounts[3]);
            assert.equal(isAutoblocker2 && isAutoblocker3, true);
        });
        it('autoblocker can remove 1 autoblocker (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker1, true);
            // autoblocker adds second autoblocker
            await token.addToAutoblockers(accounts[2], {from: accounts[1]});
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker2, true);
            // non-autoblocker can't removeRole
            await token.removeFromAutoblockers(accounts[1], {from: accounts[4]}).should.be.rejectedWith('revert');
            // autoblocker can remove
            await token.removeFromAutoblockers(accounts[1], {from: accounts[2]});
            isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker1, false);
            isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            assert.equal(isAutoblocker2, true);
        });
        it('autoblocker can remove many autoblocker (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker1 = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker1, true);
            // autoblocker adds second autoblocker
            await token.addListToAutoblockers([accounts[2],accounts[3]], {from: accounts[1]});
            let isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            let isAutoblocker3 = await token.isAutoblocker(accounts[3]);
            assert.equal(isAutoblocker2 && isAutoblocker3, true);
            //non-autoblocker cannot remove
            await token.removeListFromAutoblockers([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            // an autoblocker can remove
            await token.removeListFromAutoblockers([accounts[2],accounts[3]], {from: accounts[1]});
            isAutoblocker2 = await token.isAutoblocker(accounts[2]);
            isAutoblocker3 = await token.isAutoblocker(accounts[3]);
            assert.equal(isAutoblocker2 || isAutoblocker3, false);
        });
        it('autoblocker cannot be added if already autoblocker', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAutoblockers(accounts[1]);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            await token.addToAutoblockers(accounts[1]).should.be.rejectedWith('revert');
        });
    });

    describe('Blacklisting functionality check', function () {
        it('blacklisting lock is active at deployment', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let blacklistStatus = await token.blacklistUnlocked();
            assert.equal(blacklistStatus, false);
        });
        it('owner can add 1 blacklisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToBlacklist(accounts[1]);
            let isBKLST = await token.isBlacklisted(accounts[1]);
            assert.equal(isBKLST, true);
            // can't add him again
            token.addToBlacklist(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can add many blacklisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToBlacklist([accounts[1],accounts[2]]);
            let isBKLST1 = await token.isBlacklisted(accounts[1]);
            let isBKLST2 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST1 && isBKLST2, true);
        });
        it('owner can remove 1 blacklisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToBlacklist(accounts[1]);
            let isBKLST = await token.isBlacklisted(accounts[1]);
            assert.equal(isBKLST, true);
            //remove from blacklist
            await token.removeFromBlacklist(accounts[1]);
            isBKLST = await token.isBlacklisted(accounts[1]);
            assert.equal(isBKLST, false);
            // can't remove him again
            token.removeFromBlacklist(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can remove many blacklisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToBlacklist([accounts[1],accounts[2]]);
            let isBKLST1 = await token.isBlacklisted(accounts[1]);
            let isBKLST2 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST1 && isBKLST2, true);
            // remove from blacklist
            await token.removeListFromBlacklist([accounts[1],accounts[2]]);
            isBKLST1 = await token.isBlacklisted(accounts[1]);
            isBKLST2 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST1 || isBKLST2, false);
        });
        it('owner/autoblocker can activate/deactivate blacklisting check (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let blacklistStatus = await token.blacklistUnlocked();
            assert.equal(blacklistStatus, false);
            //owner unlock
            await token.setBlacklistUnlock(true);
            blacklistStatus = await token.blacklistUnlocked();
            assert.equal(blacklistStatus, true);
            //non-autoblocker lock rejection
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            await token.setBlacklistUnlock(false, {from: accounts[1]}).should.be.rejectedWith('revert');
            //add autoblocker
            await token.addToAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            //autoblocker lock
            await token.setBlacklistUnlock(false, {from: accounts[1]});
            blacklistStatus = await token.blacklistUnlocked();
            assert.equal(blacklistStatus, false);
        });
        it('autoblocker can add 1 blacklisted (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            //non-autoblocker can't add to blacklist
            await token.addToBlacklist(accounts[2], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to autoblockers
            await token.addToAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            //add blacklisted
            await token.addToBlacklist(accounts[2], {from: accounts[1]});
            let isBKLST = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST, true);
        });
        it('autoblocker can add many blacklisted (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            //non-autoblocker can't add to blacklist
            await token.addListToBlacklist([accounts[2],accounts[3]], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to autoblockers
            await token.addToAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            //add blacklisted
            await token.addListToBlacklist([accounts[2],accounts[3]], {from: accounts[1]});
            let isBKLST2 = await token.isBlacklisted(accounts[2]);
            let isBKLST3 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST2 && isBKLST3, true);
        });
        it('autoblocker can remove 1 blacklisted (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            //add to autoblockers
            await token.addToAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            //add blacklisted
            await token.addToBlacklist(accounts[2], {from: accounts[1]});
            let isBKLST = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST, true);
            //non-autoblocker can't remove
            await token.removeFromBlacklist(accounts[2], {from: accounts[4]}).should.be.rejectedWith('revert');
            //autoblocker can
            await token.removeFromBlacklist(accounts[2], {from: accounts[1]});
            isBKLST = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST, false);
        });
        it('autoblocker can remove many blacklisted (non-autoblocker cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, false);
            //non-autoblocker can't add to blacklist
            await token.addListToBlacklist([accounts[2],accounts[3]], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to blacklist
            await token.addToAutoblockers(accounts[1]);
            isAutoblocker = await token.isAutoblocker(accounts[1]);
            assert.equal(isAutoblocker, true);
            //add blacklisted
            await token.addListToBlacklist([accounts[2],accounts[3]], {from: accounts[1]});
            let isBKLST2 = await token.isBlacklisted(accounts[2]);
            let isBKLST3 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST2 && isBKLST3, true);
            //non-autoblocker can't remove
            await token.removeListFromBlacklist([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            //autoblocker can
            await token.removeListFromBlacklist([accounts[2],accounts[3]], {from: accounts[1]});
            isBKLST2 = await token.isBlacklisted(accounts[2]);
            isBKLST3 = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST2 || isBKLST3, false);
        });
        it('non-blacklisted can transfer (blacklisted cannot, unless unlocked)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            // give accounts[1] some tokens
            await token.mint(accounts[0], 100);
            // accounts[1] is not blacklisted at the beginning
            let isBKLST = await token.isBlacklisted(accounts[1]);
            assert.equal(isBKLST, false);
            // owner can send tokens to it, and it can transfer some to accounts[2]
            await token.transfer(accounts[1], 50);
            await token.transfer(accounts[2], 10,{from:accounts[1]})
            // if we blacklist accounts[1], it can't send anymore
            await token.addToBlacklist(accounts[1]);
            isBKLST = await token.isBlacklisted(accounts[1]);
            assert.equal(isBKLST, true);
            await token.transfer(accounts[2], 10,{from:accounts[1]}).should.be.rejectedWith('revert');
            // but it can if blacklisting is unlocked
            await token.setBlacklistUnlock(true);
            await token.transfer(accounts[2],10,{from:accounts[1]});
            // check final balances
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 50);
            let balance1 = await token.balanceOf(accounts[1]);
            assert.equal(balance1.toNumber(), 30);
            let balance2 = await token.balanceOf(accounts[2]);
            assert.equal(balance2.toNumber(), 20);
        });
        it('autoblocking functionality check)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            // give accounts[1] some tokens
            await token.mint(accounts[0], 100);
            await token.transfer(accounts[1], 50);
            // make accounts[1] an autoblocker
            await token.addToAutoblockers(accounts[1]);
            // accounts[2] is not blacklisted at the beginning
            let isBKLST = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST, false);
            // send tokens to accounts[2] from accounts[1]
            await token.transfer(accounts[2], 10,{from:accounts[1]})
            // check that is blacklisted originalOwner
            isBKLST = await token.isBlacklisted(accounts[2]);
            assert.equal(isBKLST, true);
            // check final balances
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 50);
            let balance1 = await token.balanceOf(accounts[1]);
            assert.equal(balance1.toNumber(), 40);
            let balance2 = await token.balanceOf(accounts[2]);
            assert.equal(balance2.toNumber(), 10);
        });
    });
});
