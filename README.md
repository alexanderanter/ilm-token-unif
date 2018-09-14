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

Setup your token parameters (name, symbol and decimals) in Controller.sol, your decimals and totalSupply in migrations/2_deploy_contracts.js. Then, in the truffle console you have open, run `migrate`.
you should see something like
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

# Usage

If you want to create a transaction with your token, you have to use a Controller facade on top of the Proxy contract,
put the token contract address between the quotes:
```
var ctrl = Controller.at("proxy.address")
```

Then, you can use any of the token functions, like minting, put the address between the quotes:
```
ctrl.mint("holder address", amount)
```

to mint tokens be aware of the decimals. For example if you gonna mint 3 tokens. You would write
3*10**decimals
or
3*10**18
if your token got 18 decimals.
