import axios from 'axios'

const PapiEndpoint = class {
  constructor (args) {
    const validMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']
    const defaults = {
      method: 'GET',
      endpoint: '/',
      hasParams: false,
      params: [],
      hasBody: false,
      requiresAuth: false,
      alias: ''
    }

    const options = {...defaults, ...args}

    if (validMethods.indexOf(options.method.toUpperCase()) === -1) {
      throw new Error(`Endpoint "${options.alias}" method ${options.method} is not supported.`)
    }
    // First: Handle User Provided Params
    if (options.params.length && options.params.length > 0) {
      // Auto bulid param objects based on a string-only array
      // e.g. args.params = ['id', 'start-date', 'end-date']
      if (typeof options.params[0] === 'string') {
        const _params = []
        for (const slug of options.params) {
          const pattern = ':' + slug
          const required = true

          _params.push({
            slug,
            pattern,
            required
          })
        }
        options.params = _params
      }
    } else { // Second: Attempt to auto handle params
      // Params were not passed, but we will attempt to parse unless told in arguments they don't exist
      // This regex is used to match the param pattern ':param?'
      const paramRegex = /:[0-9A-z_-]+\?{0,1}/gm
      let m
      while ((m = paramRegex.exec(options.endpoint)) !== null) {
        m.forEach(pattern => {
          const slug = pattern.replace(/[:?]/g, '')
          const required = !pattern.includes('?')

          options.params.push({
            slug,
            pattern,
            required
          })
        })
      }
    }

    // Error if params are expected but NOT found
    if (options.hasParams && !options.params.length) {
      throw new Error(`Endpoint "${options.alias}" is expecting parameters but couldn't find any in the endpoint uri or arguments.`)
    }

    this.method = options.method
    this.endpoint = options.base + options.endpoint
    this.hasParams = Boolean(options.params.length)
    this.params = this.hasParams ? options.params : null
    this.hasBody = options.hasBody
    this.requiresAuth = options.requiresAuth
    this.alias = options.alias
  }

  buildRequestOptions (params) {
    const options = {
      params
    }

    if (this.requiresAuth) {
      // Check auth...
    }

    return options
  }

  getEndpoint (data) {
    let endpoint = this.endpoint

    if (this.hasParams) {
      // Handle passed data
      if (data) {
        switch (typeof data) {
          case 'number':
          case 'string':
            if (this.params.length === 1) {
              endpoint = endpoint.replace(this.params[0].pattern, data)
            } else {
              throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing parameters.`)
            }
            break

          case 'object':
            for (const param of this.params) {
              if (data && data[param.slug]) {
                endpoint = endpoint.replace(param.pattern, data[param.slug])
              } else if (!param.required) {
                endpoint = endpoint.replace(param.pattern, '')
              } else {
                throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but couldn't find the necessary data for the parameter ${param.slug}.`)
              }
            }
            break

          default:
            throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but can't understand the data it was passed.`)
        }
      } else {
        for (const param of this.params) {
          if (param.required) {
            throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing arguments.`)
          } else {
            endpoint = endpoint.replace(param.pattern, '')
          }
        }
      }
    }

    return endpoint
  }

  call (...args) {
    const params = (this.hasParams && args.length) ? args.shift() : null
    const body = (this.hasBody && args.length) ? args.shift() : null
    const query = args.length ? args.shift() : null

    if (this.hasBody && !body) {
      throw new Error(`Endpoint "${this.alias}" is expecting a request body but couldn't find any.`)
    }

    const endpoint = this.getEndpoint(params)
    const options = this.buildRequestOptions(query)

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
        throw new Error(`Endpoint "${this.alias}" method ${this.method} is not supported.`)
    }
  }
}

export default PapiEndpoint
