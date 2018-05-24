import axios from 'axios'

const MapiEndpoint = class {
  constructor (args) {
    const defaults = {
      method: 'GET',
      endpoint: '/',
      hasParams: false,
      params: null,
      hasBody: false,
      requiresAuth: false,
      alias: ''
    }

    const options = {...defaults, ...args}

    // There is a param included in the endpoint but the params haven't been set up, so we'll interpret the endpoint
    // and set up the params as best we can...
    if (options.endpoint.includes(':') && options.hasParams && options.params === null) {
      options.params = []
      options.hasParams = true

      // This regex is used to match the param pattern ':param?'
      const regex = /:[a-zA-Z_?]+/gm
      let m
      while ((m = regex.exec(options.endpoint)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }

        m.forEach((match, groupIndex) => {
          const param = {
            slug: match.slice(1, match.length),
            pattern: match,
            required: true
          }

          if (param.slug.includes('?')) {
            param.slug = param.slug.slice(0, -1)
            param.required = false
          }

          options.params.push(param)
        })
      }
    }

    if (!options.endpoint.includes(':') && options.hasParams) {
      throw new Error(`Endpoint ${options.alias} is expecting parameters but couldn't find any in the endpoint uri`)
    }

    if (options.hasParams && typeof options.params[0] === 'string') {
      for (const i in options.params) {
        if (options.params.hasOwnProperty(i)) {
          options.params[i] = {
            slug: options.params[i],
            pattern: ':' + options.params[i],
            required: true
          }
        }
      }
    }

    this.method = options.method
    this.endpoint = options.endpoint
    this.hasParams = options.hasParams
    this.params = options.params
    this.hasBody = options.hasBody
    this.requiresAuth = options.requiresAuth
    this.alias = options.alias
  }

  buildRequestOptions () {
    const options = {}

    if (this.requiresAuth) {
      // Check auth...
    }

    return options
  }

  getEndpoint (data) {
    let endpoint = this.endpoint
    if (this.hasParams) {
      if (this.params.length === 1) {
        if (data && typeof data === 'string') {
          endpoint = endpoint.replace(this.params[0].pattern, data)
        } else if (!this.params[0].required) {
          endpoint = endpoint.replace(this.params[0].pattern, '')
        } else {
          throw new Error('Parameter required')
        }
      } else {
        for (const param of this.params) {
          if (data && data[param.slug]) {
            endpoint = endpoint.replace(param.pattern, data[param.slug])
          } else if (!param.required) {
            endpoint = endpoint.replace(param.pattern, '')
          } else {
            throw new Error('Parameter required')
          }
        }
      }
    }

    return endpoint
  }

  call (data) {
    const options = this.buildRequestOptions()

    if (typeof data === 'number') {
      data = data.toString()
    }

    if (this.hasBody && !data) {
      throw new Error(`MapiEndpoint ${this.alias} is expecting a request body but couldn't find any.`)
    }

    if (this.hasBody && !data.body) {
      data.body = data
    }

    const endpoint = this.getEndpoint(data)
    const body = (this.hasBody) ? data.body : null

    switch (this.method) {
      case 'GET':
        return axios.get(endpoint, options)

      case 'DELETE':
        return axios.delete(endpoint, options)

      case 'HEAD':
        return axios.head(endpoint, options)

      case 'OPTIONS':
        return axios.options(endpoint, options)

      case 'POST':
        return axios.post(endpoint, body, options)

      case 'PUT':
        return axios.put(endpoint, body, options)

      case 'PATCH':
        return axios.patch(endpoint, body, options)

      default:
        throw new Error(`Method ${this.method} not supported in MapiEndpoint ${this.alias}`)
    }
  }
}

export default MapiEndpoint
