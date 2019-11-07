const Proxy = artifacts.require('Proxy');
const Controller = artifacts.require('WAILM');
//const Controller2 = artifacts.require('./Controller2.sol');

//Use Chai.should for assertion
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const name = "Whitelisted Admin ILM token";
const symbol = "WAILM";
const decimals = 18;
const initCap = 400000000;

const name2 = "WAILM2";
const symbol2 = "WAILM2";
const decimals2 = 16;
const initCap2 = 500000000;

contract('Proxy', (accounts) => {
    let proxy;
    let token;
    let controller;

    beforeEach(async () => {
        proxy = await Proxy.new();
        controller = await Controller.new();
        token = Controller.at(proxy.address);
    });

    describe('WAILM - ILM core token tests', function () {
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

    describe('Admin privileges check', function () {
        it('owner can add 1 admin', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            // can't add him again
            token.addToAdmins(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can add many admin', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToAdmins([accounts[1],accounts[2]]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            let isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin1 && isAdmin2, true);
        });
        it('owner can remove 1 admin', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            await token.removeFromAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            // can't remove him again
            token.removeFromAdmins(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can remove many admin', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToAdmins([accounts[1],accounts[2]]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            let isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin1 && isAdmin2, true);
            await token.removeListFromAdmins([accounts[1],accounts[2]]);
            isAdmin1 = await token.isAdmin(accounts[1]);
            isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin1 || isAdmin2, false);
        });
        it('admin can add 1 more admin (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin1, true);
            // non-admin can't add second admin
            await token.addToAdmins(accounts[2], {from: accounts[4]}).should.be.rejectedWith('revert');
            // admin adds second admin
            await token.addToAdmins(accounts[2], {from: accounts[1]});
            let isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin2, true);
        });
        it('admin can add many more admin (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin1, true);
            // non-admin can't add second and third admins
            await token.addListToAdmins([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            // admin adds second and third admins
            await token.addListToAdmins([accounts[2],accounts[3]], {from: accounts[1]});
            let isAdmin2 = await token.isAdmin(accounts[2]);
            let isAdmin3 = await token.isAdmin(accounts[3]);
            assert.equal(isAdmin2 && isAdmin3, true);
        });
        it('admin can remove 1 admin (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin1, true);
            // admin adds second admin
            await token.addToAdmins(accounts[2], {from: accounts[1]});
            let isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin2, true);
            // non-admin can't removeRole
            await token.removeFromAdmins(accounts[1], {from: accounts[4]}).should.be.rejectedWith('revert');
            // admin can remove
            await token.removeFromAdmins(accounts[1], {from: accounts[2]});
            isAdmin1 = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin1, false);
            isAdmin2 = await token.isAdmin(accounts[2]);
            assert.equal(isAdmin2, true);
        });
        it('admin can remove many admin (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin1 = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin1, true);
            // admin adds second admin
            await token.addListToAdmins([accounts[2],accounts[3]], {from: accounts[1]});
            let isAdmin2 = await token.isAdmin(accounts[2]);
            let isAdmin3 = await token.isAdmin(accounts[3]);
            assert.equal(isAdmin2 && isAdmin3, true);
            //non-admin cannot remove
            await token.removeListFromAdmins([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            // an admin can remove
            await token.removeListFromAdmins([accounts[2],accounts[3]], {from: accounts[1]});
            isAdmin2 = await token.isAdmin(accounts[2]);
            isAdmin3 = await token.isAdmin(accounts[3]);
            assert.equal(isAdmin2 || isAdmin3, false);
        });
        it('admin cannot be added if already admin', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToAdmins(accounts[1]);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            await token.addToAdmins(accounts[1]).should.be.rejectedWith('revert');
        });
    });

    describe('Whitelisting functionality check', function () {
        it('whitelisting lock is active at deployment', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let whitelistStatus = await token.whitelistUnlocked();
            assert.equal(whitelistStatus, false);
        });
        it('owner can add 1 whitelisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToWhitelist(accounts[1]);
            let isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, true);
            // can't add him again
            token.addToWhitelist(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can add many whitelisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToWhitelist([accounts[1],accounts[2]]);
            let isWLST1 = await token.isWhitelisted(accounts[1]);
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST1 && isWLST2, true);
        });
        it('owner can remove 1 whitelisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addToWhitelist(accounts[1]);
            let isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, true);
            //remove from whitelist
            await token.removeFromWhitelist(accounts[1]);
            isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, false);
            // can't remove him again
            token.removeFromWhitelist(accounts[1]).should.be.rejectedWith('revert');
        });
        it('owner can remove many whitelisted', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            await token.addListToWhitelist([accounts[1],accounts[2]]);
            let isWLST1 = await token.isWhitelisted(accounts[1]);
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST1 && isWLST2, true);
            // remove from whitelist
            await token.removeListFromWhitelist([accounts[1],accounts[2]]);
            isWLST1 = await token.isWhitelisted(accounts[1]);
            isWLST2 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST1 || isWLST2, false);
        });
        it('owner/admin can activate/deactivate whitelisting check (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let whitelistStatus = await token.whitelistUnlocked();
            assert.equal(whitelistStatus, false);
            //owner unlock
            await token.setWhitelistUnlock(true);
            whitelistStatus = await token.whitelistUnlocked();
            assert.equal(whitelistStatus, true);
            //non-admin lock rejection
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            await token.setWhitelistUnlock(false, {from: accounts[1]}).should.be.rejectedWith('revert');
            //add admin
            await token.addToAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            //admin lock
            await token.setWhitelistUnlock(false, {from: accounts[1]});
            whitelistStatus = await token.whitelistUnlocked();
            assert.equal(whitelistStatus, false);
        });
        it('admin can add 1 whitelisted (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            //non-admin can't add to whitelist
            await token.addToWhitelist(accounts[2], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to admins
            await token.addToAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            //add whitelisted
            await token.addToWhitelist(accounts[2], {from: accounts[1]});
            let isWLST = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST, true);
        });
        it('admin can add many whitelisted (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            //non-admin can't add to whitelist
            await token.addListToWhitelist([accounts[2],accounts[3]], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to admins
            await token.addToAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            //add whitelisted
            await token.addListToWhitelist([accounts[2],accounts[3]], {from: accounts[1]});
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            let isWLST3 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST2 && isWLST3, true);
        });
        it('admin can remove 1 whitelisted (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            //add to admins
            await token.addToAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            //add whitelisted
            await token.addToWhitelist(accounts[2], {from: accounts[1]});
            let isWLST = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST, true);
            //non-admin can't remove
            await token.removeFromWhitelist(accounts[2], {from: accounts[4]}).should.be.rejectedWith('revert');
            //admin can
            await token.removeFromWhitelist(accounts[2], {from: accounts[1]});
            isWLST = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST, false);
        });
        it('admin can remove many whitelisted (non-admin cannot)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            let isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, false);
            //non-admin can't add to whitelist
            await token.addListToWhitelist([accounts[2],accounts[3]], {from: accounts[1]}).should.be.rejectedWith('revert');
            //add to whitelist
            await token.addToAdmins(accounts[1]);
            isAdmin = await token.isAdmin(accounts[1]);
            assert.equal(isAdmin, true);
            //add whitelisted
            await token.addListToWhitelist([accounts[2],accounts[3]], {from: accounts[1]});
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            let isWLST3 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST2 && isWLST3, true);
            //non-admin can't remove
            await token.removeListFromWhitelist([accounts[2],accounts[3]], {from: accounts[4]}).should.be.rejectedWith('revert');
            //admin can
            await token.removeListFromWhitelist([accounts[2],accounts[3]], {from: accounts[1]});
            isWLST2 = await token.isWhitelisted(accounts[2]);
            isWLST3 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST2 || isWLST3, false);
        });
        it('whitelisted can transfer (non-whitelisted cannot, unless unlocked)', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            // give accounts[1] some tokens
            await token.mint(accounts[0], 100);
            // accounts[1] is not whitelisted at the beginning
            let isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, false);
            // owner can send tokens to it, and that automatically whitelists accounts[1]
            await token.transfer(accounts[1], 50);
            isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, true);
            // since accounts[2] is not whitelisted, 1 can't send tokens to 2
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST2, false);
            await token.transfer(accounts[2],10,{from:accounts[1]}).should.be.rejectedWith('revert');
            // but it can if whitelisting is unlocked
            await token.setWhitelistUnlock(true);
            await token.transfer(accounts[2],10,{from:accounts[1]});
            // check final balances
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 50);
            let balance1 = await token.balanceOf(accounts[1]);
            assert.equal(balance1.toNumber(), 40);
            let balance2 = await token.balanceOf(accounts[2]);
            assert.equal(balance2.toNumber(), 10);
        });
        it('check approve and transferFrom under whitelisting', async () => {
            // initialize contract
            await token.initialize(controller.address, 200);
            // give accounts[1] some tokens
            await token.mint(accounts[0], 100);
            // accounts[1] is not whitelisted at the beginning
            let isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, false);
            // but when owner approves him to spend, 1 gets autowhitelisted
            await token.approve(accounts[1], 50);
            isWLST = await token.isWhitelisted(accounts[1]);
            assert.equal(isWLST, true);
            let isWLST2 = await token.isWhitelisted(accounts[2]);
            assert.equal(isWLST2, false);
            await token.transferFrom(accounts[0],accounts[2],10,{from:accounts[1]}).should.be.rejectedWith('revert');
            // but it can after 0 and 2 are whitelisted
            await token.addToWhitelist(accounts[0]);
            await token.addToWhitelist(accounts[2]);
            await token.transferFrom(accounts[0],accounts[2],10,{from:accounts[1]});
            // check final balances
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0.toNumber(), 90);
            let balance1 = await token.balanceOf(accounts[1]);
            assert.equal(balance1.toNumber(), 0);
            let balance2 = await token.balanceOf(accounts[2]);
            assert.equal(balance2.toNumber(), 10);
        });
    });
});
