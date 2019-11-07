const Proxy = artifacts.require('Proxy');
const Controller = artifacts.require('Controller');
//const Controller2 = artifacts.require('./Controller2.sol');

//Use Chai.should for assertion
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const name = "COIN";
const symbol = "COIN";
const decimals = 18;
const initCap = 400000000;

const name2 = "COIN2";
const symbol2 = "COIN2";
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

  it('should allow to read params', async function () {
    // initialize contract
    await token.initialize(controller.address, 200);
    assert.equal(await token.name(), name);
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
