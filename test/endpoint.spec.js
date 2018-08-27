const chai = require('chai')
const expect = chai.expect
const papi = require('../dist/main')
const http = require('http')
const PORT = 4568
const DEFAULT_BASE_URL = `http://localhost:${PORT}`

let api;
let server;

describe('Endpoints', () => {
    beforeEach(() => {
        api = papi({base: DEFAULT_BASE_URL});

        api.registerService({ name: 'base' });

        if (server) {
          server.close();
          server = null;
        }
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
        expect(api.base.endpoints[5].method).to.equal('POST');

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
      it('Fails to create an endpoint if an unrecognized method is used', (done) => {

        expect(() => {
          api.base.registerEndpoint({
            alias: 'bad',
            method: 'BAD'
          });
        }).to.throw('Endpoint "bad" method BAD is not supported.');

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
        expect(Object.keys(api.base.endpoints[0].buildRequestOptions())).to.have.lengthOf(1);

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
      it('Generates an endpoint that has required parameters and passed an object of objects', (done) => {
        api.base.registerEndpoint({
          alias: 'first',
          endpoint: '/:first/:second',
          params: [
            'first',
            'second'
          ]
        });
        expect(api.base.endpoints[5].getEndpoint({first: 3, second: 4})).is.equal(`${DEFAULT_BASE_URL}/base/3/4`);

        api.base.registerEndpoint({
          alias: 'second',
          endpoint: '/:first/:second',
          params: [
            {
              slug: 'first',
              pattern: ':first',
              required: true
            },
            {
              slug: 'second',
              pattern: ':second',
              required: true
            }
          ]
        });
        expect(api.base.endpoints[6].getEndpoint({first: 3, second: 4})).is.equal(`${DEFAULT_BASE_URL}/base/3/4`);

        done();
      });
      it('Generates an endpoint that as optional parameters', (done) => {
        expect(api.base.endpoints[0].getEndpoint()).is.equal(`${DEFAULT_BASE_URL}/base/`);
        expect(api.base.endpoints[0].getEndpoint({})).is.equal(`${DEFAULT_BASE_URL}/base/`);

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
          api.base.get(1)
            .then(response => {
              expect(response.request.method).to.equal('GET');
              expect(response.request.path).to.equal('/base/1');

              expect(response).to.haveOwnProperty('status');
              expect(response.status).to.equal(200);
              done();
            });
        });
      });
      it('Creates an axios get call with query params', (done) => {
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          res.end();
        }).listen(PORT, () => {
          api.base.get(1, {active: true, orderBy: 'desc'})
            .then(response => {
              expect(response.request.method).to.equal('GET');
              expect(response.request.path).to.equal('/base/1?active=true&orderBy=desc');

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
        }).to.throw('Endpoint "test" is expecting parameters but couldn\'t find any in the endpoint uri or arguments.')

        done();
      });
      it('Fails to generate a parameter endpoint if no data is passed', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint();
        }).to.throw('Endpoint "update" tried to create an endpoint uri but is missing arguments.');

        done();
      });
      it('Fails to generate a parameter endpoint if data is missing from arguments', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint({});
        }).to.throw('Endpoint "update" tried to create an endpoint uri but couldn\'t find the necessary data for the parameter id.');

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
        }).to.throw('Endpoint "test" tried to create an endpoint uri but is missing parameters.');

        done();
      });
      it('Fails to generate a parameter endpoint if bad data is passed', (done) => {
        expect(() => {
          api.base.endpoints[2].getEndpoint(true);
        }).to.throw('Endpoint "update" tried to create an endpoint uri but can\'t understand the data it was passed.');

        done();
      });
      it('Fails to create an axios call if a body is required but no body data is passed', (done) => {
        expect(() => {
          api.base.create();
        }).to.throw('Endpoint "create" is expecting a request body but couldn\'t find any.');

        done();
      });
      it('Fails to create an axios call if an unrecognized method is used', (done) => {
        api.base.registerEndpoint({
          alias: 'bad',
          method: 'GET'
        });

        expect(() => {
          api.base.endpoints[5].method = 'BAD';
          api.base.bad();
        }).to.throw('Endpoint "bad" method BAD is not supported.');

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
