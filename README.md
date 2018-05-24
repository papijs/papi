# mapi
[![Build Status](https://travis-ci.org/andrewfarinella/mapi.svg?branch=master)](https://travis-ci.org/andrewfarinella/mapi) [![Coverage Status](https://coveralls.io/repos/github/andrewfarinella/mapi/badge.svg?branch=master)](https://coveralls.io/github/andrewfarinella/mapi?branch=master) [![npm version](https://badge.fury.io/js/%40andrewfarinella%2Fmapi.svg)](https://badge.fury.io/js/%40andrewfarinella%2Fmapi)

---
A simple RESTful API interface.

## Install

NPM
```bash
$ npm install @andrewfarinella/mapi --save
```

Yarn
```bash
$ yarn add @andrewfarinella/mapi
```

## Example

```js
import Mapi from '@andrewfarinella/mapi'

const api = new Mapi({
    base: 'http://localhost:8080',
    services: [ 'posts' ]
});

api.posts.get(1)
    .then(response => {
        // Do whatever...
    }).catch(err => {
        // Handle error...
    })
```

## Usage

### Import

```js
import mapi from '@andrewfarinella/mapi'

// or

mapi = require('@andrewfarinella/mapi')
```

### mapi setup

```js
const api = mapi({
    base: 'http://localhost:8080',
    headers: [
        ['Authorization', 'MyKeyHere']
    ],
    services: [
        {
            name: 'posts',
            base: '/different-base'
        },
        'comments'
    ]
})
```
### Service setup
Services can be registered either at setup or afterwards using the `mapi.registerService()` method.

The only required property is `name`. If `base` is not supplied, the base will be generated based on the `name` property.
```js
api = mapi({base: 'http://localhost:8080'})

api.registerService({
  name: 'posts',
    base: '/posts',
    defaultEndpoints: true,
    hasHealthCheck: true,
    healthCheck: {
      method: 'GET',
      endpoint: '/health',
      hasBody: false,
      requiresAuth: false,
      alias: 'health'
    },
    endpoints: [
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
    ],
    services: [
      {
        name: 'new' // Builds to /posts/new
      }
    ]
})
```

### Endpoint setup

Endpoints can be registered when a service is registered or by calling `service.registerEndpoint()`.

While the only required field for endpoints is `alias`, the endpoint URL will not auto-generate based on the `alias` property, but instead will default to `'/'`. This may have unintended side-effects, so it's recommended that an `endpoint` property always be supplied as well.

```js
api = mapi({base: 'http://localhost:8080', services: ['posts']})

api.posts.registerEndpoint({
  method: 'GET',
  endpoint: '/:id',
  hasParams: true,
  params: [
    {
      slug: 'id',
      pattern: ':id',
      required: true
    }
  ]
  hasBody: false,
  alias: 'get'
})
```

If no parameters are listed but `hasParams` is set to true and there is at least one `:` in the endpoint, mapi will attempt to discover the parameters automatically. If a parameter is not required, it can be indicated by ending it with `?` such as `/:id?`.

### Making Calls
When making a call to a registered endpoint, the number of arguments expected depends on the `hasParams` and `hasBody` properties.
```js
// hasParams === false && hasBody === false
api.posts.get()
  .then((response => {})).catch(err => {})

// hasParams === true && hasBody === false
api.posts.get(params)
  .then((response => {})).catch(err => {})

// hasParams === false &&& hasBody === true
api.posts.create(body)
  .then((response => {})).catch(err => {})

// hasParams === true &&& hasBody === true
api.posts.update(params, body)
  .then((response => {})).catch(err => {})
```

Parameters can be passed to the call as either a string, integer, or an object.
```js
// Endpoint has only one parameter, so we can pass it a string/integer

// /posts/:id
api.posts.get(1) // /posts/1

// /posts/:slug
api.posts.get('my-post-slug') // /posts/my-post-slug

// Parameters can also be passed within an object

// /posts/:id/comments/:commentId
api.posts.getComments({
  id: 1,
  commentId: 3
})
```