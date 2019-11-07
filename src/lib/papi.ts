import { Header, PapiConfig, ServiceConfig } from '@/@types'
import { PapiService } from './service'
import axios from 'axios'

export class Papi {
  base: string;
  [key: string]: any;

  constructor ({
    base,
    headers = [],
    services = []
  }: PapiConfig = { base: '' }) {
    // if (!args) {
    //   throw new Error('Missing API configuration.')
    // }

    if (!base || !base.length) {
      throw new Error('Missing API Base URL.')
    }

    this._base = base

    for (const header of headers) {
      this.updateHeader(header)
    }

    for (const service of services) {
      this.registerService(service)
    }
  }

  updateHeader ([ key, value ]: Header, method: string = 'common') {
    axios.defaults.headers[method][key] = value
  }

  registerService (service: ServiceConfig | string) {
    if (!service) {
      throw new Error('Missing service configuration.')
    }

    const options: ServiceConfig = (typeof service === 'string') ? { name: service } : service

    if (!options.name) {
      throw new Error('Missing service name.')
    }

    if (!options.base) {
      options.base = options.name
    }

    if (!options.base.startsWith('/')) {
      options.base = '/' + options.base
    }

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
