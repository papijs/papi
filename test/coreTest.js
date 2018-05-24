const chai = require('chai')
const expect = chai.expect
const mapi = require('../dist/main')
const http = require('http')
const PORT = 4567
const DEFAULT_BASE_URL = `http://localhost:${PORT}`

let api;
let server;

describe('Core Functionality', () => {
    beforeEach(() => {
        api = new mapi({base: DEFAULT_BASE_URL});
    });

    describe('New instance', () => {
        // Successes
        it('Creates a new instance when given a base url', (done) => {
            expect(api).to.haveOwnProperty('_base');
            expect(api._base).to.equal(DEFAULT_BASE_URL);
            done();
        });
        it('Creates a new instance with services', (done) => {
            const apiWithServices = new mapi({
                base: 'mybase',
                services: [
                    {
                        name: 'custom'
                    }
                ]
            });

            expect(apiWithServices).to.haveOwnProperty('_base');
            expect(apiWithServices._base).to.equal('mybase');

            expect(apiWithServices).to.haveOwnProperty('custom');

            expect(apiWithServices.custom).to.haveOwnProperty('get');
            expect(apiWithServices.custom.get).to.be.a('function');

            expect(apiWithServices.custom).to.haveOwnProperty('create');
            expect(apiWithServices.custom.create).to.be.a('function');

            expect(apiWithServices.custom).to.haveOwnProperty('update');
            expect(apiWithServices.custom.update).to.be.a('function');

            expect(apiWithServices.custom).to.haveOwnProperty('delete');
            expect(apiWithServices.custom.delete).to.be.a('function');

            done();
        });

        // Failures
        it('Fails when called without arguments', (done) => {
            expect(() => {
                const newApi = new mapi();
            }).to.throw('Missing API configuration.');
            done();
        });
        it('Fails when called without base', (done) => {
            expect(() => {
                const newApi = new mapi({});
            }).to.throw('Missing API Base URL.');
            done();
        });
    });

});

describe('Services', () => {
    beforeEach(() => {
        api = new mapi({base: DEFAULT_BASE_URL});
    });

    describe('Registration', () => {
        // Successes
        it('Creates a new service when passed a name and base', (done) => {

            api.registerService({
                name: 'base',
                base: '/'
            });

            expect(api).to.haveOwnProperty('base');

            expect(api.base).to.haveOwnProperty('get');
            expect(api.base.get).to.be.a('function');

            expect(api.base).to.haveOwnProperty('create');
            expect(api.base.create).to.be.a('function');

            expect(api.base).to.haveOwnProperty('update');
            expect(api.base.update).to.be.a('function');

            expect(api.base).to.haveOwnProperty('delete');
            expect(api.base.delete).to.be.a('function');

            done();
        });
        it('Creates a new service when passed only a name', (done) => {
            api.registerService({
                name: 'onlyname'
            });

            expect(api).to.haveOwnProperty('onlyname');

            expect(api.onlyname).to.haveOwnProperty('get');
            expect(api.onlyname.get).to.be.a('function');

            expect(api.onlyname).to.haveOwnProperty('create');
            expect(api.onlyname.create).to.be.a('function');

            expect(api.onlyname).to.haveOwnProperty('update');
            expect(api.onlyname.update).to.be.a('function');

            expect(api.onlyname).to.haveOwnProperty('delete');
            expect(api.onlyname.delete).to.be.a('function');

            done();
        });

        // Failures
        it('Fails when registering without arguments', (done) => {
          expect(() => {
            api.registerService();
          }).to.throw('Missing service configuration.');
          done();
        });
        it('Fails when registering without name', (done) => {
          expect(() => {
            api.registerService({});
          }).to.throw('Missing service name.');
          done();
        });
        it('Fails when trying to register service with a conflicting name', (done) => {
          expect(() => {
            api.registerService({
              name: 'base'
            })
          }).to.not.throw();

          expect(() => {
            api.registerService({
              name: 'base'
            })
          }).to.throw('Service base is already registered.');
          done();
        });
      });

      describe('Functionality', () => {
        // Successes
        it('Creates a new service with additional endpoints', (done) => {
            api.registerService({
                name: 'withcustomendpoints',
                endpoints: [
                    {
                        'alias': 'custom'
                    }
                ]
            });

            expect(api).to.haveOwnProperty('withcustomendpoints');

            expect(api.withcustomendpoints).to.haveOwnProperty('get');
            expect(api.withcustomendpoints.get).to.be.a('function');

            expect(api.withcustomendpoints).to.haveOwnProperty('create');
            expect(api.withcustomendpoints.create).to.be.a('function');

            expect(api.withcustomendpoints).to.haveOwnProperty('update');
            expect(api.withcustomendpoints.update).to.be.a('function');

            expect(api.withcustomendpoints).to.haveOwnProperty('delete');
            expect(api.withcustomendpoints.delete).to.be.a('function');

            expect(api.withcustomendpoints).to.haveOwnProperty('custom');
            expect(api.withcustomendpoints.custom).to.be.a('function');

            done();
        });
        it('Creates a new service with only custom endpoints', (done) => {
            api.registerService({
                name: 'withonlycustomendpoints',
                defaultEndpoints: false,
                endpoints: [
                    {
                        'alias': 'custom'
                    }
                ]
            });

            expect(api).to.haveOwnProperty('withonlycustomendpoints');

            expect(api.withonlycustomendpoints).to.not.haveOwnProperty('get');

            expect(api.withonlycustomendpoints).to.not.haveOwnProperty('create');

            expect(api.withonlycustomendpoints).to.not.haveOwnProperty('update');

            expect(api.withonlycustomendpoints).to.not.haveOwnProperty('delete');

            expect(api.withonlycustomendpoints).to.haveOwnProperty('custom');
            expect(api.withonlycustomendpoints.custom).to.be.a('function');

            done();
        });
        it('Creates a new service with custom methods', (done) => {
            api.registerService({
                name: 'withcustommethods',
                methods: {
                    custom: function() { return 200; }
                }
            });

            expect(api).to.haveOwnProperty('withcustommethods');

            expect(api.withcustommethods).to.haveOwnProperty('custom');
            expect(api.withcustommethods.custom()).to.equal(200);

            done();
        });
        it('Creates a new service with subservices', (done) => {
            api.registerService({
                name: 'withsubservices',
                services: [
                    {
                        name: 'subservice'
                    }
                ]
            });

            expect(api).to.haveOwnProperty('withsubservices');

            expect(api.withsubservices).to.haveOwnProperty('subservice');

            expect(api.withsubservices.subservice).to.haveOwnProperty('get');
            expect(api.withsubservices.subservice.get).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('create');
            expect(api.withsubservices.subservice.create).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('update');
            expect(api.withsubservices.subservice.update).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('delete');
            expect(api.withsubservices.subservice.delete).to.be.a('function');

            done();
        });
        it('Creates a new service with a custom health check', (done) => {
            api.registerService({
                name: 'withcustomhealthcheck',
                healthCheck: {
                    method: 'GET',
                    endpoint: '/health',
                    hasBody: false,
                    requiresAuth: false,
                    alias: 'customhealth'
                  },
            });

            expect(api).to.haveOwnProperty('withcustomhealthcheck');

            expect(api.withcustomhealthcheck).to.haveOwnProperty('customhealth');

            done();
        });
        it('Creates a new service without a health check', (done) => {
            api.registerService({
                name: 'withouthealthcheck',
                hasHealthCheck: false
            });

            expect(api).to.haveOwnProperty('withouthealthcheck');

            expect(api.withouthealthcheck).to.not.haveOwnProperty('health');
            done();
        });

        // Failures
      });
});

describe('Endpoints', () => {
    beforeEach(() => {
        api = new mapi({base: DEFAULT_BASE_URL});

        api.registerService({ name: 'base' });
    });

    describe('Registration', () => {
      // Successes
      it('Creates a new endpoint when passed an alias', (done) => {
        api.base.registerEndpoint({alias: 'test'});

        expect(api.base).to.haveOwnProperty('test');
        expect(api.base.endpoints).to.have.lengthOf(6);

        expect(api.base.endpoints[5]).to.haveOwnProperty('method');
        expect(api.base.endpoints[5]).to.haveOwnProperty('endpoint');
        expect(api.base.endpoints[5]).to.haveOwnProperty('hasParams');
        expect(api.base.endpoints[5]).to.haveOwnProperty('params');
        expect(api.base.endpoints[5]).to.haveOwnProperty('hasBody');
        expect(api.base.endpoints[5]).to.haveOwnProperty('requiresAuth');

        done();
      });
      it('Creates a new endpoint when passed custom values', (done) => {
        api.base.registerEndpoint({
          method: 'POST',
          endpoint: '/:id',
          hasParams: true,
          params: [
            'id'
          ],
          hasBody: true,
          requiresAuth: true,
          alias: 'test'
        });

        expect(api.base).to.haveOwnProperty('test');
        expect(api.base.endpoints).to.have.lengthOf(6);

        expect(api.base.endpoints[5]).to.haveOwnProperty('method');
        expect(api.base.endpoints[5].method).to.equal('POST')
        ;
        expect(api.base.endpoints[5]).to.haveOwnProperty('endpoint');
        expect(api.base.endpoints[5].endpoint).to.equal(`${DEFAULT_BASE_URL}/base/:id`);

        expect(api.base.endpoints[5]).to.haveOwnProperty('hasParams');
        expect(api.base.endpoints[5].hasParams).to.equal(true);

        expect(api.base.endpoints[5]).to.haveOwnProperty('params');
        expect(api.base.endpoints[5].params).to.have.lengthOf(1);
        expect(Object.keys(api.base.endpoints[5].params[0])).to.have.lengthOf(3);

        expect(api.base.endpoints[5]).to.haveOwnProperty('hasBody');
        expect(api.base.endpoints[5].hasBody).to.equal(true);

        expect(api.base.endpoints[5]).to.haveOwnProperty('requiresAuth');
        expect(api.base.endpoints[5].requiresAuth).to.equal(true);

        done();
      });
      it('Creates multiple endpoints when passed a list', (done) => {
        api.base.registerEndpoints([
          { alias: 'customone' },
          { alias: 'customtwo' }
        ]);

        expect(api.base).to.haveOwnProperty('customone');
        expect(api.base).to.haveOwnProperty('customtwo');
        expect(api.base.endpoints).to.have.lengthOf(7);
        done();
      });


      // Failures
      it('Fails when registering without any arguments', (done) => {
        expect(() => {
          api.base.registerEndpoint();
        }).to.throw('Service base tried to register an endpoint but is missing arguments.');
        done();
      });
      it('Fails when registering without an alias', (done) => {
        expect(() => {
          api.base.registerEndpoint({});
        }).to.throw('Service base tried to register an endpoint but is missing an alias.');
        done();
      });
      it('Fails when registering with a conflicting alias', (done) => {
        expect(() => {
          api.base.registerEndpoint({alias:'get'});
        }).to.throw('Service base already has the get endpoint defined.');
        done();
      });
      it('Fails when registering multiple without arguments', (done) => {
        expect(() => {
          api.base.registerEndpoints();
        }).to.throw('Service base tried to register endpoints but is missing arguments.');
        done();
      });
      it('Fails when registering multiple when passing a non-array', (done) => {
        expect(() => {
          api.base.registerEndpoints('string');
        }).to.throw('Service base tried to register endpoints but was given a(n) string instead.');
        done();
      });
    });

    describe('Functionality', () => {
      // Successes
      it('Generates paramaters based on the endpoint if no params are given', (done) => {
        api.base.registerEndpoints([
          {
            alias: 'testrequired',
            endpoint: '/:id',
            hasParams: true
          },
          {
            alias: 'testoptional',
            endpoint: '/:id?',
            hasParams: true
          }
        ]);

        expect(api.base.endpoints[5]).to.haveOwnProperty('params');
        expect(api.base.endpoints[5].params).to.have.lengthOf(1);
        expect(api.base.endpoints[5].params[0]).to.deep.equal({
          slug: 'id',
          pattern: ':id',
          required: true
        });

        expect(api.base.endpoints[6]).to.haveOwnProperty('params');
        expect(api.base.endpoints[6].params).to.have.lengthOf(1);
        expect(api.base.endpoints[6].params[0]).to.deep.equal({
          slug: 'id',
          pattern: ':id?',
          required: false
        });

        done();
      });
      it('Generates expanded parameters if a list of strings is passed', (done) => {
        api.base.registerEndpoint({
          alias: 'test',
          endpoint: '/:id',
          hasParams: true,
          params: [ 'id' ]
        });

        expect(api.base.endpoints[5]).to.haveOwnProperty('params');
        expect(api.base.endpoints[5].params).to.have.lengthOf(1);
        expect(api.base.endpoints[5].params[0]).to.deep.equal({
          slug: 'id',
          pattern: ':id',
          required: true
        });

        done();
      });
      it('Generates axios options', (done) => {
        expect(api.base.endpoints[0].buildRequestOptions()).to.be.a('object');
        expect(Object.keys(api.base.endpoints[0].buildRequestOptions())).to.have.lengthOf(0);

        done();
      });
      it('Generates an endpoint that has 0 parameters', (done) => {
        expect(api.base.endpoints[1].getEndpoint()).is.equal(`${DEFAULT_BASE_URL}/base/`);

        done();
      });
      it('Generates an endpoint that has required parameters and passed a string', (done) => {
        expect(api.base.endpoints[0].getEndpoint('3')).is.equal(`${DEFAULT_BASE_URL}/base/3`);

        done();
      });
      it('Generates an endpoint that has required parameters and passed a number', (done) => {
        expect(api.base.endpoints[0].getEndpoint(3)).is.equal(`${DEFAULT_BASE_URL}/base/3`);

        done();
      });
      it('Generates an endpoint that has required parameters and passed an object', (done) => {
        expect(api.base.endpoints[0].getEndpoint({id: 3})).is.equal(`${DEFAULT_BASE_URL}/base/3`);

        done();
      });
      it('Generates an endpoint that as optional parameters', (done) => {
        expect(api.base.endpoints[0].getEndpoint()).is.equal(`${DEFAULT_BASE_URL}/base/`);

        done();
      });
      it('Creates an axios delete call', (done) => {
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          res.end();
        }).listen(PORT, () => {
          api.base.delete(1).then(response => {
            expect(response.request.method).to.equal('DELETE');
            expect(response.request.path).to.equal('/base/1');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios get call', (done) => {
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          res.end();
        }).listen(PORT, () => {
          api.base.get(1).then(response => {
            expect(response.request.method).to.equal('GET');
            expect(response.request.path).to.equal('/base/1');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios head call', (done) => {
        api.base.registerEndpoint({
          method: 'HEAD',
          alias: 'head'
        });

        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          res.end();
        }).listen(PORT, () => {
          api.base.head().then(response => {
            expect(response.request.method).to.equal('HEAD');
            expect(response.request.path).to.equal('/base/');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios options call', (done) => {
        api.base.registerEndpoint({
          method: 'OPTIONS',
          alias: 'options'
        });
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          res.end();
        }).listen(PORT, () => {
          api.base.options().then(response => {
            expect(response.request.method).to.equal('OPTIONS');
            expect(response.request.path).to.equal('/base/');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios patch call', (done) => {
        api.base.registerEndpoint({
          method: 'PATCH',
          alias: 'patch',
          endpoint: '/:id',
          hasParams: true,
          hasBody: true
        });
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          let body = [];
          req.on('data', (chunk) => {
            body.push(chunk);
          }).on('end', () => {
            body = Buffer.concat(body).toString();

            expect(body).to.equal('test');
            res.end();
          });
        }).listen(PORT, () => {
          api.base.patch(1, 'test').then(response => {
            expect(response.request.method).to.equal('PATCH');
            expect(response.request.path).to.equal('/base/1');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios post call', (done) => {
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          let body = [];
          req.on('data', (chunk) => {
            body.push(chunk);
          }).on('end', () => {
            body = Buffer.concat(body).toString();

            expect(body).to.equal('test');
            res.end();
          });
        }).listen(PORT, () => {
          api.base.create('test').then(response => {
            expect(response.request.method).to.equal('POST');
            expect(response.request.path).to.equal('/base/');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });
      it('Creates an axios put call', (done) => {
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          let body = [];
          req.on('data', (chunk) => {
            body.push(chunk);
          }).on('end', () => {
            body = Buffer.concat(body).toString();

            expect(body).to.equal('test');
            res.end();
          });
        }).listen(PORT, () => {
          api.base.update(1, 'test').then(response => {
            expect(response.request.method).to.equal('PUT');
            expect(response.request.path).to.equal('/base/1');

            expect(response).to.haveOwnProperty('status');
            expect(response.status).to.equal(200);
            done();
          });
        });
      });

      // Failures
      it('Fails to generates parameters if none are passed and no pattern is found in the endpoint', (done) => {
        expect(() => {
          api.base.registerEndpoint({
            alias: 'test',
            endpoint: '/id',
            hasParams: true
          });
        }).to.throw('Endpoint test is expecting parameters but couldn\'t find any in the endpoint uri or arguments.')

        done();
      });
      it('Fails to generate a parameter endpoint if no data is passed', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint();
        }).to.throw('Endpoint update tried to create an endpoint uri but is missing arguments.');

        done();
      });
      it('Fails to generate a parameter endpoint if data is missing from arguments', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint({});
        }).to.throw('Endpoint update tried to create an endpoint uri but couldn\'t find the necessary data for the parameter id.');

        done();
      });
      it('Fails to generate a multi parameter endpoint if string is passed', (done) => {
        api.base.registerEndpoint({
          alias: 'test',
          endpoint: '/:id/:second',
          hasParams: true
        });
        expect(() => {
          api.base.endpoints[5].getEndpoint('test');
        }).to.throw('Endpoint test tried to create an endpoint uri but is missing parameters.');

        done();
      });
      it('Fails to generate a parameter endpoint if bad data is passed', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint(true);
        }).to.throw('Endpoint update tried to create an endpoint uri but can\'t understand the data it was passed.');

        done();
      });
      it('Fails to create an axios call if a body is required but no body data is passed', (done) => {
        expect(() => {
          api.base.create();
        }).to.throw('Endpoint create is expecting a request body but couldn\'t find any.');

        done();
      });
      it('Fails to create an axios call if an unrecognized method is used', (done) => {
        api.base.registerEndpoint({
          alias: 'bad',
          method: 'BAD'
        })
        expect(() => {
          api.base.bad();
        }).to.throw('Endpoint bad\'s method BAD is not supported.');

        done();
      });
    });

    afterEach(() => {
      if (server) {
        server.close();
        server = null;
      }
    });
});