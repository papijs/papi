const chai = require('chai')
const expect = chai.expect
const papi = require('../dist/main')
const http = require('http')
const PORT = 4567
const DEFAULT_BASE_URL = `http://localhost:${PORT}`

let api;
let server;

describe('Core Functionality', () => {
    beforeEach(() => {
        api = papi({base: DEFAULT_BASE_URL});

        if (server) {
          server.close();
          server = null;
        }
    });

    describe('New instance', () => {
        // Successes
        it('Creates a new instance when given a base url', (done) => {
            expect(api).to.haveOwnProperty('_base');
            expect(api._base).to.equal(DEFAULT_BASE_URL);
            done();
        });
        it('Creates a new instance with default headers in an array', (done) => {
          api = papi({
            base: DEFAULT_BASE_URL,
            headers: [
              ['header', 'value']
            ],
            services: [
              'base'
            ]
          });

          server = http.createServer((req, res) => {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            expect(req.headers['header']).to.equal('value');
            res.end(); 
          }).listen(PORT, () => {
            api.base.get().then(response => {
              done();
            });
          });
        })
        it('Creates a new instance with services as objects', (done) => {
            const apiWithServices = papi({
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
        it('Creates a new instance with services as strings', (done) => {
            const apiWithServices = papi({
                base: 'mybase',
                services: [
                  'custom'
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
                const newApi = papi();
            }).to.throw('Missing API configuration.');
            done();
        });
        it('Fails when called without base', (done) => {
            expect(() => {
                const newApi = papi({});
            }).to.throw('Missing API Base URL.');
            done();
        });
    });

    describe('Functionality', () => {
      it('Updates headers after being instantiated', (done) => {
        api.registerService('base');
        api.updateHeader(['header', 'value'], 'common');
        server = http.createServer((req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          expect(req.headers['header']).to.equal('value');
          res.end();
        }).listen(PORT, () => {
          api.base.get().then(response => {
            done();
          });
        });
      });
    });
});
