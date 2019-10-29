import axios, { Method, AxiosPromise } from 'axios'

type RequestParams = { [key: string]: string | number }

interface EndpointParam {
  slug: string;
  pattern: string;
  required: boolean;
}

interface EndpointConfig {
  alias?: '';
  base: string;
  endpoint: string;
  method?: Method;
  hasBody?: boolean;
  hasParams?: boolean;
  params?: string[];
  requiresAuth?: boolean;
}

interface EndpointCall {
  body?: any;
  params?: number | string | RequestParams;
  query?: any;
}

class PapiEndpoint {
  alias: string;
  endpoint: string;
  hasBody: boolean;
  hasParams: boolean;
  method: Method;
  optionalParams: boolean;
  params: EndpointParam[];
  requiredParams: boolean;
  requiresAuth: boolean;

  constructor ({
    base,
    method = 'GET',
    endpoint = '/',
    hasParams = false,
    params = [],
    hasBody = false,
    requiresAuth = false,
    alias = ''
  }: EndpointConfig) {

    // const DEFAULTS: EndpointConfig = {
    //   method: 'GET',
    //   endpoint: '/',
    //   hasParams: false,
    //   params: [],
    //   hasBody: false,
    //   requiresAuth: false,
    //   alias: ''
    // }

    // if (VALID_METHODS.includes(options.method.toUpperCase())) {
    //   throw new Error(`Endpoint "${options.alias}" method ${options.method} is not supported.`)
    // }

    const _params = new Set<EndpointParam>();

    // First: Handle User Provided Params
    if (params.length > 0) {
      // Auto bulid param objects based on a string-only array
      // e.g. args.params = ['id', 'start-date', 'end-date']
      for (const slug of params) {
        const pattern = ':' + slug
        const required = true

        _params.add({
          slug,
          pattern,
          required
        })
      }
    } else { // Second: Attempt to auto handle params
      // Params were not passed, but we will attempt to parse unless told in arguments they don't exist
      // This regex is used to match the param pattern ':param?'
      const PARAM_REGEX = /:[0-9A-z_-]+\?{0,1}/gm
      const SLUG_REGEX = /[:?]/g
      let m
      while ((m = PARAM_REGEX.exec(endpoint)) !== null) {
        m.forEach(pattern => {
          const slug = pattern.replace(SLUG_REGEX, '')
          const required = !pattern.includes('?')

          _params.add({
            slug,
            pattern,
            required
          })
        })
      }
    }

    // Error if params are expected but NOT found
    if (hasParams && !_params.size) {
      throw new Error(`Endpoint "${alias}" is expecting parameters but couldn't find any in the endpoint uri or arguments.`)
    }

    this.alias = alias
    this.endpoint = base + endpoint
    this.hasBody = hasBody
    this.hasParams = Boolean(_params.size)
    this.method = method
    // this.params = this.hasParams ? [..._params] : null
    this.params = [..._params]
    this.requiredParams = Boolean(this.params.filter(p => p.required).length)
    this.optionalParams = Boolean(this.params.filter(p => !p.required).length)
    this.requiresAuth = requiresAuth
  }

  buildRequestOptions (): object {
    const options = {}

    if (this.requiresAuth) {
      // Check auth...
    }

    return options
  }

  // Map incoming param data to endpoint
  getEndpoint (data: null | number | string | RequestParams ): string {
    // No Params, parsing not required
    if (!this.hasParams) {
      return this.endpoint
    }

    // Data empty, and requires params
    if (!data && this.requiredParams) {
      throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing arguments.`)
    }

    switch (typeof data) {
      // Single-value `data` can only be used with single `params` for an endpoint
      case 'number':
      case 'string':
        if (this.params.length === 1) {
          return this.endpoint.replace(this.params[0].pattern, data as string)
        }

        throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing parameters.`)

      // Multiple-value `data` must be "mapped" using the `params` for an endpoint
      case 'object':
        let endpoint = this.endpoint;

        // Replace provided required params, and remove missing optional params, and throw error if required param is missing
        for (const param of this.params) {
          if (data && data[param.slug]) {
            endpoint = endpoint.replace(param.pattern, data[param.slug] as string)
          } else if (!param.required) {
            endpoint = endpoint.replace(param.pattern, '')
          } else {
            throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but couldn't find the necessary data for the parameter ${param.slug}.`)
          }
        }

        return endpoint;

      default:
        throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but can't understand the data it was passed.`)
    }
  }

  call ({
    body,
    params = {},
    query
  }: EndpointCall): AxiosPromise {
    const options = this.buildRequestOptions()

    if (this.hasBody && !body) {
      throw new Error(`Endpoint "${this.alias}" is expecting a request body but couldn't find any.`)
    }

    const url = this.getEndpoint(params)

    try {
      return axios.request({
        url,
        method: this.method,
        ...(this.hasBody && { body }),
        ...(query && { params: query })
      })
    } catch (error) {
      console.error(error)
      throw new Error(`Endpoint "${this.alias}" method ${this.method} is not supported.`)
    }

    // switch (this.method) {
    //   case 'GET':
    //     return axios.get(endpoint, options)

    //   case 'DELETE':
    //     return axios.delete(endpoint, options)

    //   case 'HEAD':
    //     return axios.head(endpoint, options)

    //   case 'OPTIONS':
    //     return axios.options(endpoint, options)

    //   case 'POST':
    //     return axios.post(endpoint, body, options)

    //   case 'PUT':
    //     return axios.put(endpoint, body, options)

    //   case 'PATCH':
    //     return axios.patch(endpoint, body, options)

    //   default:
    //     throw new Error(`Endpoint "${this.alias}" method ${this.method} is not supported.`)
    // }
  }
}

export default PapiEndpoint
