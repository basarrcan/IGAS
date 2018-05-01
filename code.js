Eos = require('eosjs') // Eos = require('./src')
let {ecc} = Eos.modules

initaPrivate = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

// New deterministic key for the currency account.  Only use a simple
// seedPrivate in production if you want to give away money.
currencyPrivate = ecc.seedPrivate('currency')
currencyPublic = ecc.privateToPublic(currencyPrivate)

keyProvider = [initaPrivate, currencyPrivate]

//  Requires a large library, separate from the eosjs bundle
// $ npm install binaryen@37.0.0
binaryen = require('binaryen')

eos = Eos.Localnet({keyProvider, binaryen})

eos.newaccount({
  creator: 'inita',
  name: 'currency',
  owner: currencyPublic,
  active: currencyPublic,
  recovery: 'inita'
})

contractDir = `${process.env.HOME}/eosio/dawn3/build/contracts/currency`
wast = fs.readFileSync(`${contractDir}/currency.wast`)
abi = fs.readFileSync(`${contractDir}/currency.abi`)

// Publish contract to the blockchain
eos.setcode('currency', 0, 0, wast)
eos.setabi('currency', JSON.parse(abi))

currency = null
// eos.contract(account<string>, [options], [callback])
eos.contract('currency').then(contract => currency = contract)

// Issue is one of the actions in currency.abi
currency.issue('inita', '1000.0000 CUR', {authorization: 'currency'})