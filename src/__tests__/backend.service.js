import setup, { TEST_CONTRACT_ADDRESS } from './_database.setup.js'
import * as http from 'service/backend'

const fs = require('fs')
const path = require('path')

let db,
    conn,
    Contract,
    Relayer,
    Token

beforeAll(async () => {
  db = await setup()
  conn = db.conn
  Contract = db.Contract
  Relayer = db.Relayer
  Token = db.Token
})

afterAll(async () => {
  await conn.drop()
  await conn.close()
})

describe('Testing Contract API', () => {

  test('#1. manually save a contract to Database', async done => {
    let count = await Contract.count()
    expect(count).toEqual(0)

    const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/_relayer.abi.json')))
    await Contract.create({
      name: 'RelayerRegistration',
      address: TEST_CONTRACT_ADDRESS,
      abi,
    })

    count = await Contract.count()
    expect(count).toEqual(1)

    let payload = await http.getContracts()
    expect(payload.length).toEqual(1)

    const registrationContract = payload[0]
    expect(registrationContract.address).toBe(TEST_CONTRACT_ADDRESS)

    await Contract.create({
      name: 'RelayerRegistrationXXX',
      address: 'xxx',
      abi,
    })

    payload = await http.getContracts()
    expect(payload.length).toEqual(2)

    // contractId = registrationContract.id
    done()
  })

  test.skip('#2. Update contract status', async () => {
    /* NOTE: not implemented yet
     * for admin only
     */
    /* const updatedContract = await http.updateContract({
     *   id: contractId,
     *   obsolete: true,
     * })
     * expect(updatedContract.id).toBe(contractId)
     * expect(updatedContract.obsolete).toBe(true) */
  })

})

describe('Testing Relayer API', () => {

  let relayerId

  test('#1. create a relayers', async done => {
    const count = await Relayer.count()
    expect(count).toEqual(0)

    const dummyRelayer = {
      owner: '0x070aa7ad03b89b3278f19d34f119dd3c2a244675',
      name: 'DummyRelayer',
      coinbase: '0xdD596FfB7f7A6123C36ecEf2F8a48AfEc6D7B889',
      maker_fee: 2,
      taker_fee: 5,
      from_tokens: [],
      to_tokens: [],
    }
    const newRelayer = await http.createRelayer(dummyRelayer)
    expect(newRelayer.id).toBe(1)

    relayerId = newRelayer.id

    done()
    // NOTE: testing Failure API (logging, resopnse)
  })


  test('#2. update a relayer', async () => {
    const updatedRelayer = await http.updateRelayer({
      id: relayerId,
      maker_fee: 5,
      resigning: true,
    })

    expect(updatedRelayer.id).toBe(1)
    expect(updatedRelayer.resigning).toBe(true)
    expect(updatedRelayer.maker_fee).toBe(5)

    const missingIdRequest = await http.updateRelayer({ maker_fee: 5 })
    expect(Boolean(missingIdRequest.error)).toBe(true)
    expect(missingIdRequest.error.code).toBe(500)

    const invalidIdRequest = await http.updateRelayer({ id: 4, maker_fee: 6 })
    expect(Boolean(invalidIdRequest.error)).toBe(true)
    expect(invalidIdRequest.error.code).toBe(500)
  })


  test('#3. delete a relayer(after a successful refundEvent)', async () => {
    let request = await http.deleteRelayer(null)
    expect(request.error.code).toBe(500)

    request = await http.deleteRelayer(2)
    expect(request.error.code).toBe(500)

    request = await http.deleteRelayer(relayerId)
    expect(Boolean(request.error)).toBe(false)

    const count = await Relayer.count()
    expect(count).toEqual(0)
  })

})


describe('Testing Token API', () => {

  let request

  test('#1. get tokens', async () => {
    request = await http.getTokens()
    expect(request.length).toEqual(0)

  })

  test('#2. create new token', async () => {

    const tokens = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/_token.dummy.json')))
    request = await http.createToken(tokens[0])
    expect(Boolean(request.id)).toBe(true)

    request = await http.getTokens()
    expect(request.length).toEqual(1)

    // 4 more dummy tokens to be created
    await Promise.all(tokens.slice(1).map(async t => Token.create(t)))

    request = await http.getTokens()
    expect(request.length).toEqual(5)
  })
})
