import { IS_DEV } from 'service/constant'

export const BACKEND_URI = IS_DEV ? 'http://localhost:8888' : ''
export const SOCKET_URI = BACKEND_URI.replace('http', 'ws') + '/socket'

const genericHandler = response => {
  if (response.ok) return response.json()
  throw response
}

const defaultHeader = {
  Accept: 'application/json; charset=UTF-8',
}

const HttpClient = {
  get: async api => fetch(api).then(genericHandler),

  post: async (api, value) => fetch(api, {
    method: 'post',
    body: JSON.stringify(value),
    headers: defaultHeader,
  }).then(genericHandler),

  patch: async (api, value) => fetch(api, {
    method: 'patch',
    body: JSON.stringify(value),
    headers: defaultHeader,
  }).then(genericHandler),

  delete: async api => fetch(api, {
    method: 'delete',
    headers: defaultHeader,
  }).then(genericHandler),

}

const getPayload = r => r.payload

const logging = async error => {
  try {
    return error.json().then(err => {
      // TODO: if err.code === 500, do something
      return err
    })
  } catch (e) {
    return { error }
  }
}

const API = {
  auth: '/api/auth',
  contract: '/api/contract',
  relayer: '/api/relayer',
  token: '/api/token',
}

const proxiedAPI = new Proxy(API, {
  get(obj, property) {
    if (process.env.NODE_ENV !== 'production') {
      // NOTE: using default development backend with .env.test
      const endpoint = BACKEND_URI + obj[property]
      return endpoint
    }
    return obj[property]
  }
})

/* API ENDPOINTS THAT ACCEPT REQUESTS FROM ORIGIN */
export const getContracts = async () => HttpClient.get(proxiedAPI.contract)
                                                  .then(getPayload)
                                                  .catch(logging)

export const getRelayers = async () => HttpClient.get(proxiedAPI.relayer)
                                                 .then(getPayload)
                                                 .catch(logging)

export const createRelayer = async relayer => HttpClient.post(proxiedAPI.relayer, relayer)
                                                      .then(getPayload)
                                                      .catch(logging)

export const updateRelayer = async relayer => HttpClient.patch(proxiedAPI.relayer, relayer)
                                                        .then(getPayload)
                                                        .catch(logging)

export const deleteRelayer = async relayerId => HttpClient.delete(`${proxiedAPI.relayer}?id=${relayerId}`)
                                                          .then(getPayload)
                                                          .catch(logging)

export const getTokens = async () => HttpClient.get(proxiedAPI.token)
                                               .then(getPayload)
                                               .catch(logging)

export const createToken = async token => HttpClient.post(proxiedAPI.token, token)
                                               .then(getPayload)
                                               .catch(logging)
