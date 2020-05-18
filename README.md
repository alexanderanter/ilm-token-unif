# How to use
Download/clone this repo, open a terminal in the folder and run:

```
npm install
```

Then, use truffle to deploy and call contracts through a truffle console.

Option 1. If you are running your local node connect to it like this:

```
npm run console --network development
```
or try
```
truffle console --network development
```

Option 2. You can use Infura nodes:
1. Ensure you provide private key for truffle to sign your transactions. Create `.env` file with the key of the account to use. Use `.env.template` as a template.
2. Then use `mainnet` or `kovan` network. E.g. `truffle console --network kovan`

# Deploy a new token

The first step would be to choose the token type you need:
- ILM: Our basic token. It is the core we use to build all our extended tokens.
- LILM: Lockable ILM token. Adds to ILM the ability to lock the token preventing any transfer of it (except from explicitly authorized addresses).
- TILM: Time-locked ILM token. Adds to ILM a secondary locked balance that auto-unlocks reached a certain timestamp.
- WAILM: Whitelisted ILM token. Only those included in the whitelist can own/transfer this token.
- WATILM: Whitelisted TILM token. Same as WAILM, but with Time-locked extension included.
- BAILM: Blacklist ILM token. Opposite to whitelist, allows to add addresses to a blacklist so they can't own this token.
- BATILM: Blacklist TILM token. Same as BAILM, but with Time-locked extension included.

Once you have chosen your token, you have to:
1. Setup your token parameters (name, symbol and decimals) in Controller.sol file.
2. Setup your decimals and totalSupply in migrations/2_deploy_contracts.js.

Once done, you have 2 different options to deploy:
1. Automatic deployment (recommended):
	- Replace Controller in migrations/2_deploy_contracts.js, in the line `const Controller = artifacts.require('Controller');` for the desired type of token (Controller is for ILM, LILM for LILM token, etc.)
	- Uncomment the code block (lines 8 and 22). It is commented because tests fail otherwise.
	- Then, in the truffle console you have open, run `migrate`. You should see something like
	```
	Deploying Controller...
	  ... 0xasdsadasdadaa6250f9f1a30a9fbb24068efd68b5656565656b65a4ec
	  Controller: 0xbadadsaasdaasde99a3bb44eaea4c11835454538c
	  ... 0x0asdadssadasc0a6aa64f23d6888d46645454545456adc9d4a0c3bb12a49d
	0
	```
	When its done, it will still be blinking in the console, click the up arrow to get back to truffle console
	You will now have the token contract address next to Proxy:  in the console
	and the controller address next to Controller:

	Make a note of both these addresses.

2. Manual deployment (only for those who are used to truffle):
	- Deploy a Proxy contract. Save the address.
	- Deploy the token you want to use (Controller for ILM, any other in extensions folder for other types). Save the address.
	- Using a Controller facade, initialize the proxy with the Controller address we have already deployed in step 2, and the number of decimals desired.
	```
	var token = Controller.at("proxy.address")
	token.initialize("controller.address",initCap*(10**decimals))
	```

# Usage

If you want to create a transaction with your token, you have to use a Controller facade on top of the Proxy contract,
put the token contract address between the quotes:
```
var token = Controller.at("proxy.address")
```

Then, you can use any of the token functions, like minting, put the address between the quotes:
```
token.mint("holder.address", amount)
```

to mint tokens be aware of the decimals. For example if you gonna mint 3 tokens. You would write
3*10**decimals
or
3*10**18
if your token got 18 decimals.
