import MapiService from './service'
import axios from 'axios'

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

    if (args.headers && Array.isArray(args.headers)) {
      for (const i in args.headers) {
        if (args.headers.hasOwnProperty(i)) {
          const header = args.headers[i]

          axios.defaults.headers.common[header[0]] = header[1]
        }
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
