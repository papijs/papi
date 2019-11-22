module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const papi_1 = __webpack_require__(2);
function default_1(args) {
    return new papi_1.Papi(args);
}
exports.default = default_1;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __webpack_require__(3);
const axios_1 = __importDefault(__webpack_require__(0));
class Papi {
    constructor({ base, headers = [], services = [] } = { base: '' }) {
        // if (!args) {
        //   throw new Error('Missing API configuration.')
        // }
        if (!base || !base.length) {
            throw new Error('Missing API Base URL.');
        }
        this._base = base;
        for (const header of headers) {
            this.updateHeader(header);
        }
        for (const service of services) {
            this.registerService(service);
        }
    }
    updateHeader([key, value], method = 'common') {
        axios_1.default.defaults.headers[method][key] = value;
    }
    registerService(service) {
        if (!service) {
            throw new Error('Missing service configuration.');
        }
        const options = (typeof service === 'string') ? { name: service } : service;
        if (!options.name) {
            throw new Error('Missing service name.');
        }
        if (!options.base) {
            options.base = options.name;
        }
        if (!options.base.startsWith('/')) {
            options.base = '/' + options.base;
        }
        options.base = this._base + options.base;
        if (!this[options.name]) {
            this[options.name] = new service_1.PapiService(options);
        }
        else {
            throw new Error(`Service ${options.name} is already registered.`);
        }
        if (options.methods && typeof options.methods === 'object') {
            for (const methodName in options.methods) {
                if (options.methods.hasOwnProperty(methodName)) {
                    const method = options.methods[methodName];
                    this[options.name][methodName] = method;
                }
            }
        }
    }
}
exports.Papi = Papi;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const endpoint_1 = __webpack_require__(4);
class PapiService {
    constructor({ name, base = '/', hasDefaultEndpoints = true, hasHealthCheck = true, healthCheck = {
        method: 'GET',
        endpoint: '/health',
        hasBody: false,
        requiresAuth: false,
        alias: 'health'
    }, endpoints = [], services = [] }) {
        this.name = name;
        this._base = base;
        this.endpoints = [];
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
            ]);
        }
        this.registerEndpoints(endpoints);
        this.registerSubServices(services);
        if (hasHealthCheck) {
            this.registerEndpoint(healthCheck);
            // this.registerHealthCheckEndpoint(options.healthCheck)
        }
    }
    registerEndpoint(endpoint) {
        if (!endpoint) {
            throw new Error(`Service ${this.name} tried to register an endpoint but is missing arguments.`);
        }
        if (!endpoint.alias || endpoint.alias === '') {
            throw new Error(`Service ${this.name} tried to register an endpoint but is missing an alias.`);
        }
        // if (typeof this[endpoint.alias] !== 'undefined') {
        if (this.hasOwnProperty(endpoint.alias)) {
            throw new Error(`Service ${this.name} already has the ${endpoint.alias} endpoint defined.`);
        }
        const index = this.endpoints.push(new endpoint_1.PapiEndpoint(Object.assign(Object.assign({}, endpoint), { base: this._base }))) - 1;
        this[endpoint.alias] = (...args) => this.endpoints[index].call(...args);
    }
    registerEndpoints(endpoints) {
        if (!endpoints) {
            throw new Error(`Service ${this.name} tried to register endpoints but is missing arguments.`);
        }
        if (!Array.isArray(endpoints)) {
            throw new Error(`Service ${this.name} tried to register endpoints but was given a(n) ${typeof endpoints} instead.`);
        }
        for (const endpoint of endpoints) {
            this.registerEndpoint(endpoint);
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
                this[service.name] = new PapiService(service);
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
}
exports.PapiService = PapiService;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(__webpack_require__(0));
// FIXME: I'd rather use the provided type
const VALID_METHODS = [
    'GET',
    'DELETE',
    'HEAD',
    'OPTIONS',
    'POST',
    'PUT',
    'PATCH'
];
class PapiEndpoint {
    constructor({ base = '/', method = 'GET', endpoint = '/', hasParams = false, params = [], hasBody = false, requiresAuth = false, alias = '' }) {
        // const DEFAULTS: EndpointConfig = {
        //   method: 'GET',
        //   endpoint: '/',
        //   hasParams: false,
        //   params: [],
        //   hasBody: false,
        //   requiresAuth: false,
        //   alias: ''
        // }
        if (!VALID_METHODS.includes(method.toUpperCase())) {
            throw new Error(`Endpoint "${alias}" method ${method} is not supported.`);
        }
        const _params = new Set();
        // First: Handle User Provided Params
        if (params.length > 0) {
            // Assumes given params are either complete objects or
            // Auto bulid param objects based on a string-only array
            // e.g. args.params = ['id', 'start-date', 'end-date']
            for (const slug of params) {
                const param = (typeof slug === 'object') ? slug : {
                    slug,
                    pattern: ':' + slug,
                    required: true
                };
                _params.add(param);
            }
        }
        else { // Second: Attempt to auto handle params
            // Params were not passed, but we will attempt to parse unless told in arguments they don't exist
            // This regex is used to match the param pattern ':param?'
            const PARAM_REGEX = /:[0-9A-z_-]+\?{0,1}/gm;
            const SLUG_REGEX = /[:?]/g;
            let m;
            while ((m = PARAM_REGEX.exec(endpoint)) !== null) {
                m.forEach(pattern => {
                    const slug = pattern.replace(SLUG_REGEX, '');
                    const required = !pattern.includes('?');
                    _params.add({
                        slug,
                        pattern,
                        required
                    });
                });
            }
        }
        // Error if params are expected but NOT found
        if (hasParams && !_params.size) {
            throw new Error(`Endpoint "${alias}" is expecting parameters but couldn't find any in the endpoint uri or arguments.`);
        }
        this.alias = alias;
        this.endpoint = base + endpoint;
        this.hasBody = hasBody;
        this.hasParams = Boolean(_params.size);
        this.method = method;
        // this.params = this.hasParams ? [..._params] : null
        this.params = [..._params];
        this.requiredParams = Boolean(this.params.filter(p => p.required).length);
        this.optionalParams = Boolean(this.params.filter(p => !p.required).length);
        this.requiresAuth = requiresAuth;
    }
    buildRequestOptions() {
        const options = {};
        if (this.requiresAuth) {
            // Check auth...
        }
        return options;
    }
    // Map incoming param data to endpoint
    getEndpoint(data) {
        // No Params, parsing not required
        if (!this.hasParams) {
            return this.endpoint;
        }
        // Data empty, and requires params
        if (!data && this.requiredParams) {
            throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing arguments.`);
        }
        switch (typeof data) {
            // Single-value `data` can only be used with single `params` for an endpoint
            case 'number':
            case 'string':
                if (this.params.length === 1) {
                    return this.endpoint.replace(this.params[0].pattern, data);
                }
                throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but is missing parameters.`);
            // Multiple-value `data` must be "mapped" using the `params` for an endpoint
            case 'object':
                let endpoint = this.endpoint;
                // Replace provided required params, and remove missing optional params, and throw error if required param is missing
                for (const param of this.params) {
                    if (data && data[param.slug]) {
                        endpoint = endpoint.replace(param.pattern, data[param.slug]);
                    }
                    else if (!param.required) {
                        endpoint = endpoint.replace(param.pattern, '');
                    }
                    else {
                        throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but couldn't find the necessary data for the parameter ${param.slug}.`);
                    }
                }
                return endpoint;
            default:
                throw new Error(`Endpoint "${this.alias}" tried to create an endpoint uri but can't understand the data it was passed.`);
        }
    }
    call(req, argData) {
        const { data: reqData = null, params = {}, query = null } = (typeof req === 'object') ? req : { params: req };
        const options = this.buildRequestOptions();
        // Coalesce the body to use for the request
        const data = reqData || argData;
        if (this.hasBody && !data) {
            throw new Error(`Endpoint "${this.alias}" is expecting a request body but couldn't find any.`);
        }
        const url = this.getEndpoint(params);
        try {
            return axios_1.default.request(Object.assign(Object.assign({ url, method: this.method }, (this.hasBody && { data })), (query && { params: query })));
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
            // throw new Error(`Endpoint "${this.alias}" method ${this.method} is not supported.`)
        }
    }
}
exports.PapiEndpoint = PapiEndpoint;


/***/ })
/******/ ]);