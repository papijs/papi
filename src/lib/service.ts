import { PapiEndpoint } from './endpoint'
import { EndpointArgs, EndpointConfig, ServiceConfig } from '@/@types'

export class PapiService {
  name: string;
  base: string;
  endpoints: PapiEndpoint[];
  [key: string]: any;

  constructor ({
    name,
    base = '/',
    hasDefaultEndpoints = true,
    hasHealthCheck = true,
    healthCheck = {
      method: 'GET',
      endpoint: '/health',
      hasBody: false,
      requiresAuth: false,
      alias: 'health'
    },
    endpoints = [],
    services = []
  }: ServiceConfig) {
    this.name = name
    this._base = base
    this.endpoints = []

    if (hasDefaultEndpoints) {
      this.registerEndpoints([
        {
          method: 'GET',
          endpoint: '/:id?',
          hasParams: true,
          hasBody: false,
          requiresAuth: true,
          alias: 'get'
        },
        {
          method: 'POST',
          endpoint: '/',
          hasParams: false,
          hasBody: true,
          requiresAuth: true,
          alias: 'create'
        },
        {
          method: 'PUT',
          endpoint: '/:id',
          hasParams: true,
          hasBody: true,
          requiresAuth: true,
          alias: 'update'
        },
        {
          method: 'DELETE',
          endpoint: '/:id',
          hasParams: true,
          hasBody: false,
          requiresAuth: true,
          alias: 'delete'
        }
      ])
    }

    this.registerEndpoints(endpoints)
    this.registerSubServices(services)

    if (hasHealthCheck) {
      this.registerEndpoint(healthCheck)
      // this.registerHealthCheckEndpoint(options.healthCheck)
    }
  }

  registerEndpoint (endpoint: EndpointConfig) {
    if (!endpoint) {
      throw new Error(`Service ${this.name} tried to register an endpoint but is missing arguments.`)
    }

    if (!endpoint.alias || endpoint.alias === '') {
      throw new Error(`Service ${this.name} tried to register an endpoint but is missing an alias.`)
    }

    // if (typeof this[endpoint.alias] !== 'undefined') {
    if (this.hasOwnProperty(endpoint.alias)) {
      throw new Error(`Service ${this.name} already has the ${endpoint.alias} endpoint defined.`)
    }

    const index = this.endpoints.push(new PapiEndpoint({...endpoint, base: this._base})) - 1

    this[endpoint.alias] = (args: EndpointArgs) => this.endpoints[index].call(args)
  }

  registerEndpoints (endpoints: EndpointConfig[]) {
    if (!endpoints) {
      throw new Error(`Service ${this.name} tried to register endpoints but is missing arguments.`)
    }

    if (!Array.isArray(endpoints)) {
      throw new Error(`Service ${this.name} tried to register endpoints but was given a(n) ${typeof endpoints} instead.`)
    }

    for (const endpoint of endpoints) {
      this.registerEndpoint(endpoint)
    }
  }

  registerSubServices (services: ServiceConfig[]) {
    for (const i in services) {
      if (services.hasOwnProperty(i)) {
        const service = services[i]

        if (!service.name && !service.base) {
          throw new Error('Cannot register service.')
        }

        if (!service.base) {
          service.base = '/' + service.name
        }

        if (!service.base.startsWith('/')) {
          service.base = '/' + service.base
        }

        service.endpoints = service.endpoints || []
        service.services = service.services || []

        service.base = this._base + service.base

        this[service.name] = new PapiService(service)

        if (service.methods && typeof service.methods === 'object') {
          for (const methodName in service.methods) {
            if (service.methods.hasOwnProperty(methodName)) {
              const method = service.methods[methodName]

              this[service.name][methodName] = method
            }
          }
        }
      }
    }
  }
}
