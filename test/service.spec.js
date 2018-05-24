const chai = require('chai')
const expect = chai.expect
const papi = require('../dist/main')
const http = require('http')
const PORT = 4569
const DEFAULT_BASE_URL = `http://localhost:${PORT}`

let api;
let server;

describe('Services', () => {
    beforeEach(() => {
        api = papi({base: DEFAULT_BASE_URL});
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
                    },
                    {
                        name: 'subservicewithbase',
                        base: 'test'
                    }
                ]
            });

            expect(api).to.haveOwnProperty('withsubservices');

            expect(api.withsubservices).to.haveOwnProperty('subservice');
            expect(api.withsubservices.subservice._base).to.equal(`${DEFAULT_BASE_URL}/withsubservices/subservice`);

            expect(api.withsubservices.subservice).to.haveOwnProperty('get');
            expect(api.withsubservices.subservice.get).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('create');
            expect(api.withsubservices.subservice.create).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('update');
            expect(api.withsubservices.subservice.update).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('delete');
            expect(api.withsubservices.subservice.delete).to.be.a('function');

            expect(api.withsubservices).to.haveOwnProperty('subservicewithbase');
            expect(api.withsubservices.subservicewithbase._base).to.equal(`${DEFAULT_BASE_URL}/withsubservices/test`);

            expect(api.withsubservices.subservicewithbase).to.haveOwnProperty('get');
            expect(api.withsubservices.subservicewithbase.get).to.be.a('function');

            expect(api.withsubservices.subservicewithbase).to.haveOwnProperty('create');
            expect(api.withsubservices.subservicewithbase.create).to.be.a('function');

            expect(api.withsubservices.subservicewithbase).to.haveOwnProperty('update');
            expect(api.withsubservices.subservicewithbase.update).to.be.a('function');

            expect(api.withsubservices.subservicewithbase).to.haveOwnProperty('delete');
            expect(api.withsubservices.subservicewithbase.delete).to.be.a('function');

            done();
        });
        it('Creates a new service with subservices with methods', (done) => {
            api.registerService({
                name: 'withsubservices',
                services: [
                    {
                        name: 'subservice',
                        methods: {
                          all: () => { return true }
                        }
                    }
                ]
            });

            expect(api).to.haveOwnProperty('withsubservices');

            expect(api.withsubservices).to.haveOwnProperty('subservice');
            expect(api.withsubservices.subservice._base).to.equal(`${DEFAULT_BASE_URL}/withsubservices/subservice`);

            expect(api.withsubservices.subservice).to.haveOwnProperty('get');
            expect(api.withsubservices.subservice.get).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('create');
            expect(api.withsubservices.subservice.create).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('update');
            expect(api.withsubservices.subservice.update).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('delete');
            expect(api.withsubservices.subservice.delete).to.be.a('function');

            expect(api.withsubservices.subservice).to.haveOwnProperty('all');
            expect(api.withsubservices.subservice.all).to.be.a('function');
            expect(api.withsubservices.subservice.all()).to.equal(true);

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
        it('Fails when creating a new service with bad incomplete subservice data', (done) => {
          expect(() => {
            api.registerService({
              name: 'withsubservices',
              services: [
                {}
              ]
            })
          }).to.throw('Cannot register service.');
          done();
        })
      });
});
