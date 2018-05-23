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
          params: [
            'id'
          ],
          hasBody: true,
          requiresAuth: true,
          alias: 'update'
        },
        {
          method: 'DELETE',
          endpoint: '/:id',
          hasParams: true,
          params: [
            'id'
          ],
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

    this._base = options.base
    this.endpoints = []

    this.registerEndpoints(options.endpoints)
    this.registerSubServices(options.services)

    if (options.hasHealthCheck) {
      this.registerHealthCheckEndpoint(options.healthCheck)
    }
  }

  registerEndpoints (endpoints) {
    for (const i in endpoints) {
      let index = this.endpoints.push(new MapiEndpoint({...endpoints[i], endpoint: this._base + endpoints[i].endpoint})) - 1

      if (endpoints[i].alias && endpoints[i].alias !== '') {
        this[endpoints[i].alias] = (data) => this.endpoints[index].call(data)
      }
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

const Mapi = class {
  constructor (args) {
    if (!args) {
      throw new Error('Missing API configuration.')
    }

    if (!args.base) {
      throw new Error('Missing API Base URL.')
    }
    this._base = args.base

    if (args.services && Array.isArray(args.services)) {
      for (const service of args.services) {
        this.registerService(service)
      }
    }
  }

  registerService (args) {
    if (!args) {
      throw new Error('Missing service configuration.')
    }
    if (!args.name) {
      throw new Error('Missing service name.')
    }

    if (!args.name) {
      args.name = args.base.replace(/[^a-z_]/gi, '')
    } else if (!args.base) {
      args.base = args.name
    }

    if (!args.base.startsWith('/')) {
      args.base = '/' + args.base
    }

    args.endpoints = args.endpoints || []
    args.services = args.services || []
    args.base = this._base + args.base

    if (!this[args.name]) {
      this[args.name] = new MapiService(args)
    } else {
      throw new Error(`Service ${args.name} is already registered.`)
    }

    if (args.methods && typeof args.methods === 'object') {
      for (const methodName in args.methods) {
        if (args.methods.hasOwnProperty(methodName)) {
          const method = args.methods[methodName]

          this[args.name][methodName] = method
        }
      }
    }
  }
}

export default Mapi
