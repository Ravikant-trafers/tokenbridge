const Web3 = require('web3')
const { ERC677_BRIDGE_TOKEN_ABI, BRIDGE_VALIDATORS_ABI, FOREIGN_NATIVE_TO_ERC_ABI } = require('../commons')

const waitUntil = async (predicate, step = 100, timeout = 10000) => {
  const stopTime = Date.now() + timeout
  while (Date.now() <= stopTime) {
    const result = await predicate()
    if (result) {
      return result
    }
    await new Promise(resolve => setTimeout(resolve, step)) // sleep
  }
  throw new Error(`waitUntil timed out after ${timeout} ms`)
}

const sendEther = async (rpcUrl, account, to) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
  web3.eth.accounts.wallet.add(account.privateKey)

  await web3.eth.sendTransaction({
    from: account.address,
    to,
    gasPrice: '1',
    gas: '50000',
    value: '1000000000000000000'
  })
}

const sendTokens = async (rpcUrl, account, tokenAddress, recipientAddress) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
  web3.eth.accounts.wallet.add(account.privateKey)
  const erc20Token = new web3.eth.Contract(ERC677_BRIDGE_TOKEN_ABI, tokenAddress)

  await erc20Token.methods.transfer(recipientAddress, web3.utils.toWei('0.01')).send({
    from: account.address,
    gas: '1000000'
  })
}

const addValidator = async (rpcUrl, account, bridgeAddress) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
  web3.eth.accounts.wallet.add(account.privateKey)
  const bridgeContract = new web3.eth.Contract(FOREIGN_NATIVE_TO_ERC_ABI, bridgeAddress)
  const foreignValidatorsAddress = await bridgeContract.methods.validatorContract().call()
  const foreignBridgeValidators = new web3.eth.Contract(BRIDGE_VALIDATORS_ABI, foreignValidatorsAddress)
  await foreignBridgeValidators.methods.addValidator('0xE71FBa5db00172bb0C93d649362B006300000935').send({
    from: account.address,
    gas: '5000000'
  })
}

module.exports = {
  waitUntil,
  sendEther,
  sendTokens,
  addValidator
}