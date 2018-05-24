'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

const MapiEndpoint = class {
  constructor(args) {
    const defaults$$1 = {
      method: 'GET',
      endpoint: '/',
      hasParams: false,
      params: null,
      hasBody: false,
      requiresAuth: false,
      alias: ''
    };

    const options = _extends({}, defaults$$1, args);

    // There is a param included in the endpoint but the params haven't been set up, so we'll interpret the endpoint
    // and set up the params as best we can...
    if (options.endpoint.includes(':') && options.hasParams && options.params === null) {
      options.params = [];
      options.hasParams = true;

      // This regex is used to match the param pattern ':param?'
      const regex = /:[a-zA-Z_?]+/gm;
      let m;
      while ((m = regex.exec(options.endpoint)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
          const param = {
            slug: match.slice(1, match.length),
            pattern: match,
            required: true
          };

          if (param.slug.includes('?')) {
            param.slug = param.slug.slice(0, -1);
            param.required = false;
          }

          options.params.push(param);
        });
      }
    }

    if (!options.endpoint.includes(':') && options.hasParams) {
      throw new Error(`Endpoint ${options.alias} is expecting parameters but couldn't find any in the endpoint uri or arguments.`);
    }

    if (options.hasParams && typeof options.params[0] === 'string') {
      for (const i in options.params) {
        if (options.params.hasOwnProperty(i)) {
          options.params[i] = {
            slug: options.params[i],
            pattern: ':' + options.params[i],
            required: true
          };
        }
      }
    }

    this.method = options.method;
    this.endpoint = options.base + options.endpoint;
    this.hasParams = options.hasParams;
    this.params = options.params;
    this.hasBody = options.hasBody;
    this.requiresAuth = options.requiresAuth;
    this.alias = options.alias;
  }

  buildRequestOptions() {
    const options = {};

    if (this.requiresAuth) ;

    return options;
  }

  getEndpoint(data) {
    let endpoint = this.endpoint;
    if (this.hasParams) {
      if (data) {
        if (typeof data === 'number') {
          data = data.toString();
        }

        if (typeof data === 'string') {
          if (this.params.length === 1) {
            endpoint = endpoint.replace(this.params[0].pattern, data);
          } else {
            throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but is missing parameters.`);
          }
        } else if (typeof data === 'object') {
          for (const param of this.params) {
            if (data && data[param.slug]) {
              endpoint = endpoint.replace(param.pattern, data[param.slug]);
            } else if (!param.required) {
              endpoint = endpoint.replace(param.pattern, '');
            } else {
              throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but couldn't find the necessary data for the parameter ${param.slug}.`);
            }
          }
        } else {
          throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but can't understand the data it was passed.`);
        }
      } else {
        for (const param of this.params) {
          if (param.required) {
            throw new Error(`Endpoint ${this.alias} tried to create an endpoint uri but is missing arguments.`);
          } else {
            endpoint = endpoint.replace(param.pattern, '');
          }
        }
      }
    }

    return endpoint;
  }

  call(...args) {
    const options = this.buildRequestOptions();

    const params = this.hasParams ? args[0] : null;
    const body = this.hasBody ? this.hasParams ? args[1] : args[0] : null;

    if (this.hasBody && !body) {
      throw new Error(`Endpoint ${this.alias} is expecting a request body but couldn't find any.`);
    }

    const endpoint = this.getEndpoint(params);

    switch (this.method) {
      case 'GET':
        return axios.get(endpoint, options);

      case 'DELETE':
        return axios.delete(endpoint, options);

      case 'HEAD':
        return axios.head(endpoint, options);

      case 'OPTIONS':
        return axios.options(endpoint, options);

      case 'POST':
        return axios.post(endpoint, body, options);

      case 'PUT':
        return axios.put(endpoint, body, options);

      case 'PATCH':
        return axios.patch(endpoint, body, options);

      default:
        throw new Error(`Endpoint ${this.alias}'s method ${this.method} is not supported.`);
    }
  }
};

const MapiService = class {
  constructor(args) {
    const defaults$$1 = {
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
      endpoints: [{
        method: 'GET',
        endpoint: '/:id?',
        hasParams: true,
        hasBody: false,
        requiresAuth: true,
        alias: 'get'
      }, {
        method: 'POST',
        endpoint: '/',
        hasParams: false,
        hasBody: true,
        requiresAuth: true,
        alias: 'create'
      }, {
        method: 'PUT',
        endpoint: '/:id',
        hasParams: true,
        hasBody: true,
        requiresAuth: true,
        alias: 'update'
      }, {
        method: 'DELETE',
        endpoint: '/:id',
        hasParams: true,
        hasBody: false,
        requiresAuth: true,
        alias: 'delete'
      }],
      services: []
    };

    const options = _extends({}, defaults$$1, args);

    if (options.defaultEndpoints) {
      options.endpoints = [...defaults$$1.endpoints, ...args.endpoints];
    }

    this._name = options.name;
    this._base = options.base;
    this.endpoints = [];

    this.registerEndpoints(options.endpoints);
    this.registerSubServices(options.services);

    if (options.hasHealthCheck) {
      this.registerHealthCheckEndpoint(options.healthCheck);
    }
  }

  registerEndpoint(endpoint) {
    if (!endpoint) {
      throw new Error(`Service ${this._name} tried to register an endpoint but is missing arguments.`);
    }

    if (!endpoint.alias || endpoint.alias === '') {
      throw new Error(`Service ${this._name} tried to register an endpoint but is missing an alias.`);
    }

    if (typeof this[endpoint.alias] !== 'undefined') {
      throw new Error(`Service ${this._name} already has the ${endpoint.alias} endpoint defined.`);
    }

    let index = this.endpoints.push(new MapiEndpoint(_extends({}, endpoint, { base: this._base }))) - 1;

    this[endpoint.alias] = (params, body) => this.endpoints[index].call(params, body);
  }

  registerEndpoints(endpoints) {
    if (!endpoints) {
      throw new Error(`Service ${this._name} tried to register endpoints but is missing arguments.`);
    }

    if (!Array.isArray(endpoints)) {
      throw new Error(`Service ${this._name} tried to register endpoints but was given a(n) ${typeof endpoints} instead.`);
    }

    for (const i in endpoints) {
      this.registerEndpoint(endpoints[i]);
    }
  }

  registerSubServices(services) {
    for (const i in services) {
      if (services.hasOwnProperty(i)) {
        const service = services[i];

        if (!service.name && !service.base) {
          throw new Error('Cannot register service.');
        }

        if (!service.base) {
          service.base = '/' + service.name;
        }

        if (!service.base.startsWith('/')) {
          service.base = '/' + service.base;
        }

        service.endpoints = service.endpoints || [];
        service.services = service.services || [];

        service.base = this._base + service.base;

        this[service.name] = new MapiService(service);

        if (service.methods && typeof service.methods === 'object') {
          for (const methodName in service.methods) {
            if (service.methods.hasOwnProperty(methodName)) {
              const method = service.methods[methodName];

              this[service.name][methodName] = method;
            }
          }
        }
      }
    }
  }

  registerHealthCheckEndpoint(healthCheck) {
    this.registerEndpoints([healthCheck]);
  }
};

const Mapi = class {
  constructor(args) {
    if (!args) {
      throw new Error('Missing API configuration.');
    }

    if (!args.base) {
      throw new Error('Missing API Base URL.');
    }
    this._base = args.base;

    if (args.services && Array.isArray(args.services)) {
      for (const service of args.services) {
        this.registerService(service);
      }
    }

    if (args.headers && Array.isArray(args.headers)) {
      for (const i in args.headers) {
        if (args.headers.hasOwnProperty(i)) {
          const header = args.headers[i];

          axios.defaults.headers.common[header[0]] = header[1];
        }
      }
    }
  }

  registerService(args) {
    if (!args) {
      throw new Error('Missing service configuration.');
    }
    if (typeof args === 'string') {
      args = { name: args };
    }
    if (!args.name) {
      throw new Error('Missing service name.');
    }

    if (!args.name) {
      args.name = args.base.replace(/[^a-z_]/gi, '');
    } else if (!args.base) {
      args.base = args.name;
    }

    if (!args.base.startsWith('/')) {
      args.base = '/' + args.base;
    }

    args.endpoints = args.endpoints || [];
    args.services = args.services || [];
    args.base = this._base + args.base;

    if (!this[args.name]) {
      this[args.name] = new MapiService(args);
    } else {
      throw new Error(`Service ${args.name} is already registered.`);
    }

    if (args.methods && typeof args.methods === 'object') {
      for (const methodName in args.methods) {
        if (args.methods.hasOwnProperty(methodName)) {
          const method = args.methods[methodName];

          this[args.name][methodName] = method;
        }
      }
    }
  }
};

var index = (args => {
  return new Mapi(args);
});

module.exports = index;
