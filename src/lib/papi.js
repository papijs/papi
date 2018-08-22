import PapiService from './service'
import axios from 'axios'

const Papi = class {
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

    if (args.headers && Array.isArray(args.headers)) {
      for (const i in args.headers) {
        if (args.headers.hasOwnProperty(i)) {
          const header = args.headers[i]

          axios.defaults.headers.common[header[0]] = header[1]
        }
      }
    }
  }

  updateHeader (header, method) {
    method = method || 'common'

    axios.defaults.headers[method][header[0]] = header[1]
  }

  registerService (args) {
    if (!args) {
      throw new Error('Missing service configuration.')
    }

    const options = (typeof args === 'string') ? { name: args } : args

    if (!options.name) {
      throw new Error('Missing service name.')
    }

    if (!options.base) {
      options.base = options.name
    }

    if (!options.base.startsWith('/')) {
      options.base = '/' + options.base
    }

    options.endpoints = options.endpoints || []
    options.services = options.services || []
    options.base = this._base + options.base

    if (!this[options.name]) {
      this[options.name] = new PapiService(options)
    } else {
      throw new Error(`Service ${options.name} is already registered.`)
    }

    if (options.methods && typeof options.methods === 'object') {
      for (const methodName in options.methods) {
        if (options.methods.hasOwnProperty(methodName)) {
          const method = options.methods[methodName]

          this[options.name][methodName] = method
        }
      }
    }
  }
}

export default Papi
