import MapiEndpoint from './endpoint'

const MapiService = class {
  constructor (args) {
    const defaults = {
      base: '/',
      defaultEndpoints: true,
      hasHealthCheck: true,
      healthCheck: {
        method: 'GET',
        endpoint: '/health',
        hasBody: false,
        requiresAuth: false,
        alias: 'health'
      },
      endpoints: [
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
      ],
      services: []
    }

    const options = {
      ...defaults,
      ...args
    }

    if (options.defaultEndpoints) {
      options.endpoints = [
        ...defaults.endpoints,
        ...args.endpoints
      ]
    }

    this._name = options.name
    this._base = options.base
    this.endpoints = []

    this.registerEndpoints(options.endpoints)
    this.registerSubServices(options.services)

    if (options.hasHealthCheck) {
      this.registerHealthCheckEndpoint(options.healthCheck)
    }
  }

  registerEndpoint (endpoint) {
    if (!endpoint) {
      throw new Error('MapiService.registerEndpoint is missing endpoint information.')
    }

    if (!endpoint.alias || endpoint.alias === '') {
      throw new Error('MapiService.registerEndpoint requires an alias to set up a new endpoint.')
    }

    if (typeof this[endpoint.alias] !== 'undefined') {
      throw new Error(`Service ${this._name} already has the ${endpoint.alias} endpoint defined.`)
    }

    let index = this.endpoints.push(new MapiEndpoint({...endpoint, endpoint: this._base + endpoint.endpoint})) - 1

    this[endpoint.alias] = (data) => this.endpoints[index].call(data)
  }

  registerEndpoints (endpoints) {
    if (!endpoints) {
      throw new Error('MapiService.registerEndpoints is missing list of endpoints.')
    }

    if (!Array.isArray(endpoints)) {
      throw new Error('MapiService.registerEndpoints can only handle arrays.')
    }

    for (const i in endpoints) {
      this.registerEndpoint(endpoints[i])
    }
  }

  registerSubServices (services) {
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

        this[service.name] = new MapiService(service)

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

  registerHealthCheckEndpoint (healthCheck) {
    this.registerEndpoints([healthCheck])
  }
}

export default MapiService
