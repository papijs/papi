# Changelog
### 0.2.0 (May 23, 2018)
- **Breaking** Remove functionality to generate parameters even if `MapiEndpoint.hasParams` is set to false
- **Breaking** Export factory instead of a class
- Add `MapiService.registerEndpoint` method
- Add `.editorconfig` file
- Add code coverage reporting to npm script `test:default`
- Add error handling to endpoints
- Add default header support to Mapi
- Add ability to register a service with just a string
- Change file structure for `./src`
- Change default MapiEndpoint endpoint to `'/'`
- Fix endpoint building
- Refactor `MapiEndpoint.call()`
- Refactor `MapiEndpoint.getEndpoint()`
- Update tests

### 0.1.1 (May 23, 2018)
- Add Travis-CI integration
- Add Coveralls.io integration
- Create inital unit tests
- Add error checks to `Mapi.constructor()` and `Mapi.registerService()`
- Change Mapi property name for base url to `._base`
- Change default healthcheck endpoint to `'/health'`

### 0.1.0 (May 22, 2018)
- Add inital build