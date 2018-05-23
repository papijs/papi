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
      endpoint: '',
      hasParams: false,
      params: null,
      hasBody: false,
      requiresAuth: false
    };

    const options = _extends({}, defaults$$1, args);

    // There is a param included in the endpoint but the params haven't been set up, so we'll interpret the endpoint
    // and set up the params as best we can...
    if (options.endpoint.includes(':') && (!options.hasParams || options.hasParams && options.params === null)) {
      options.params = [];
      options.hasParams = true;

      // This regex is used to match the param pattern ':param?'
      const regex = /:[a-zA-Z_?]+/gm;
      let m;
      while ((m = regex.exec(options.endpoint)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
          // Remove the leading :
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

    this.method = options.method;
    this.endpoint = options.endpoint;
    this.hasParams = options.hasParams;
    this.params = options.params;
    this.hasBody = options.hasBody;
    this.requiresAuth = options.requiresAuth;
  }

  buildRequestOptions() {
    const options = {};

    if (this.requiresAuth) ;

    return options;
  }

  getEndpoint(data) {
    let endpoint = this.endpoint;
    if (this.hasParams) {
      if (this.params.length === 1) {
        if (data && typeof data === 'string') {
          endpoint = endpoint.replace(this.params[0].pattern, data);
        } else if (!this.params[0].required) {
          endpoint = endpoint.replace(this.params[0].pattern, '');
        } else {
          throw new Error('Parameter required');
        }
      } else {
        for (const param of this.params) {
          if (data && data[param.slug]) {
            endpoint = endpoint.replace(param.pattern, data[param.slug]);
          } else if (!param.required) {
            endpoint = endpoint.replace(param.pattern, '');
          } else {
            throw new Error('Parameter required');
          }
        }
      }
    }

    return endpoint;
  }

  call(data) {
    const options = this.buildRequestOptions();

    switch (this.method) {
      case 'GET':
        return this.get(data, options);

      case 'POST':
        return this.post(data, options);

      default:
        throw new Error('Method not supported');
    }
  }

  get(data, options) {
    if (typeof data === 'number') {
      data = data.toString();
    }
    const endpoint = this.getEndpoint(data);

    return axios.get(endpoint, options);
  }

  post(data, options) {
    if (this.hasBody && !data) {
      throw new Error('API call requires body');
    }

    if (this.hasBody && !data.body) {
      data = {
        body: data
      };
    }

    const body = this.hasBody ? data.body : null;

    const endpoint = this.getEndpoint(data);

    return axios.post(endpoint, body, options);
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
        params: ['id'],
        hasBody: true,
        requiresAuth: true,
        alias: 'update'
      }, {
        method: 'DELETE',
        endpoint: '/:id',
        hasParams: true,
        params: ['id'],
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

    this._base = options.base;
    this.endpoints = [];

    this.registerEndpoints(options.endpoints);
    this.registerSubServices(options.services);

    if (options.hasHealthCheck) {
      this.registerHealthCheckEndpoint(options.healthCheck);
    }
  }

  registerEndpoints(endpoints) {
    for (const i in endpoints) {
      let index = this.endpoints.push(new MapiEndpoint(_extends({}, endpoints[i], { endpoint: this._base + endpoints[i].endpoint }))) - 1;

      if (endpoints[i].alias && endpoints[i].alias !== '') {
        this[endpoints[i].alias] = data => this.endpoints[index].call(data);
      }
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
  }

  registerService(args) {
    if (!args) {
      throw new Error('Missing service configuration.');
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

module.exports = Mapi;
