'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapiEndpoint = function () {
  function MapiEndpoint(args) {
    _classCallCheck(this, MapiEndpoint);

    var defaults = {
      method: 'GET',
      endpoint: '',
      hasParams: false,
      params: null,
      hasBody: false,
      requiresAuth: false
    };

    var options = _extends({}, defaults, args);

    // There is a param included in the endpoint but the params haven't been set up, so we'll interpret the endpoint
    // and set up the params as best we can...
    if (options.endpoint.includes(':') && (!options.hasParams || options.hasParams && options.params === null)) {
      options.params = [];
      options.hasParams = true;

      // This regex is used to match the param pattern ':param?'
      var regex = /:[a-zA-Z_?]+/gm;
      var m = void 0;
      while ((m = regex.exec(options.endpoint)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach(function (match, groupIndex) {
          // Remove the leading :
          var param = {
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

  _createClass(MapiEndpoint, [{
    key: 'buildRequestOptions',
    value: function buildRequestOptions() {
      var options = {};

      if (this.requiresAuth) ;

      return options;
    }
  }, {
    key: 'getEndpoint',
    value: function getEndpoint(data) {
      var endpoint = this.endpoint;
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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.params[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var param = _step.value;

              if (data && data[param.slug]) {
                endpoint = endpoint.replace(param.pattern, data[param.slug]);
              } else if (!param.required) {
                endpoint = endpoint.replace(param.pattern, '');
              } else {
                throw new Error('Parameter required');
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }

      return endpoint;
    }
  }, {
    key: 'call',
    value: function call(data) {
      var options = this.buildRequestOptions();

      switch (this.method) {
        case 'GET':
          return this.get(data, options);

        case 'POST':
          return this.post(data, options);

        default:
          throw new Error('Method not supported');
      }
    }
  }, {
    key: 'get',
    value: function get(data, options) {
      if (typeof data === 'number') {
        data = data.toString();
      }
      var endpoint = this.getEndpoint(data);

      return axios.get(endpoint, options);
    }
  }, {
    key: 'post',
    value: function post(data, options) {
      if (this.hasBody && !data) {
        throw new Error('API call requires body');
      }

      if (this.hasBody && !data.body) {
        data = {
          body: data
        };
      }

      var body = this.hasBody ? data.body : null;

      var endpoint = this.getEndpoint(data);

      return axios.post(endpoint, body, options);
    }
  }]);

  return MapiEndpoint;
}();

var Service = function () {
  function Service(args) {
    _classCallCheck(this, Service);

    var defaults = {
      base: '/',
      defaultEndpoints: true,
      hasHealthCheck: true,
      healthCheck: {
        method: 'GET',
        endpoint: '/info',
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

    var options = _extends({}, defaults, args);

    if (options.defaultEndpoints) {
      options.endpoints = [].concat(_toConsumableArray(defaults.endpoints), _toConsumableArray(args.endpoints));
    }

    this.base = options.base;
    this.endpoints = [];

    this.registerEndpoints(options.endpoints);
    this.registerSubServices(options.services);

    if (options.hasHealthCheck) {
      this.registerHealthCheckEndpoint(options.healthCheck);
    }
  }

  _createClass(Service, [{
    key: 'registerEndpoints',
    value: function registerEndpoints(endpoints) {
      var _this = this;

      var _loop = function _loop(i) {
        var index = _this.endpoints.push(new MapiEndpoint(_extends({}, endpoints[i], { endpoint: _this.base + endpoints[i].endpoint }))) - 1;

        if (endpoints[i].alias && endpoints[i].alias !== '') {
          _this[endpoints[i].alias] = function (data) {
            return _this.endpoints[index].call(data);
          };
        }
      };

      for (var i in endpoints) {
        _loop(i);
      }
    }
  }, {
    key: 'registerSubServices',
    value: function registerSubServices(services) {
      for (var i in services) {
        if (services.hasOwnProperty(i)) {
          var service = services[i];

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

          service.base = this.base + service.base;

          this[service.name] = new Service(service);

          if (service.methods && _typeof(service.methods) === 'object') {
            for (var methodName in service.methods) {
              if (service.methods.hasOwnProperty(methodName)) {
                var method = service.methods[methodName];

                this[service.name][methodName] = method;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'registerHealthCheckEndpoint',
    value: function registerHealthCheckEndpoint(healthCheck) {
      this.registerEndpoints([healthCheck]);
    }
  }]);

  return Service;
}();

var Api = function () {
  function Api(args) {
    _classCallCheck(this, Api);

    this.base = args.base;

    if (args.services && Array.isArray(args.services)) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = args.services[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var service = _step2.value;

          this.registerService(service);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }

  _createClass(Api, [{
    key: 'registerService',
    value: function registerService(args) {
      if (!args.name && !args.base) {
        return false;
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
      args.base = this.base + args.base;

      if (!this[args.name]) {
        this[args.name] = new Service(args);
      }

      if (args.methods && _typeof(args.methods) === 'object') {
        for (var methodName in args.methods) {
          if (args.methods.hasOwnProperty(methodName)) {
            var method = args.methods[methodName];

            this[args.name][methodName] = method;
          }
        }
      }
    }
  }]);

  return Api;
}();

module.exports = Api;
