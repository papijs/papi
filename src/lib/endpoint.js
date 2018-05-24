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
      throw new Error(`Endpoint ${options.alias} is expecting parameters but couldn't find any in the endpoint uri or arguments.`)
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
    this.endpoint = options.base + options.endpoint
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
      if (data) {
        if (typeof data === 'number') {
          data = data.toString()
        }

        if (typeof data === 'string') {
          if (this.params.length === 1) {
            endpoint = endpoint.replace(this.params[0].pattern, data)
          } else {
            throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but is missing parameters.`)
          }
        } else if (typeof data === 'object') {
          for (const param of this.params) {
            if (data && data[param.slug]) {
              endpoint = endpoint.replace(param.pattern, data[param.slug])
            } else if (!param.required) {
              endpoint = endpoint.replace(param.pattern, '')
            } else {
              throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but couldn't find the necessary data for the parameter ${param.slug}.`)
            }
          }
        } else {
          throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but can't understand the data it was passed.`)
        }
      } else {
        for (const param of this.params) {
          if (param.required) {
            throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but is missing arguments.`)
          } else {
            endpoint = endpoint.replace(param.pattern, '')
          }
        }
      }
    }

    return endpoint
  }

  call (...args) {
    const options = this.buildRequestOptions()

    const params = (this.hasParams) ? args[0] : null
    const body = (this.hasBody) ? (this.hasParams) ? args[1] : args[0] : null

    if (this.hasBody && !body) {
      throw new Error(`Endpoint ${this.alias} is expecting a request body but couldn't find any.`)
    }

    const endpoint = this.getEndpoint(params)

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
        throw new Error(`Endpoint ${this.alias}'s method ${this.method} is not supported.`)
    }
  }
}

export default MapiEndpoint
