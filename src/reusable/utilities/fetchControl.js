/* @flow */

// This package wsa significantly influenced by https://github.com/haoxins/fetch.io.
// Differences are semantic, type safety and the addition of mock creation.

import {url as urlUtils, Url} from 'url'

export type OptionsType = {
  afterRequest : ?Function,
  beforeRequest: ?Function,
  cache: ?string,
  credentials: ?string,
  errorReporter: ?Function,
  headers: ?Object,
  httpMethod: ?string',
  corsMode: ?string,
  rootContext: ?Url,
  queryParams : ?Object
}
export const defaultErrorReporter:Function = (response):Object => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const defaultRootContext:Url = url.parse('http://localhost:8080')

export const defaultOpts:OptionsType = {
  afterRequest : null,
  beforeRequest: null,
  cache        : 'no-cache',
  credentials  : 'include',
  errorReporter: defaultErrorReporter,
  headers      : { 'content-type': 'application/json' },
  httpMethod   : 'GET',
  corsMode     : 'cors',
  rootContext  : defaultRootContext,
  queryParams  : {}
}

class Request {

  constructor(url:Url, options:OptionsType = {}) {
    this.opts = assign({}, defaultOpts(), options)
    _normalizeOptions(opts)

    this.url = urlUtils.resolve(opts.rootContext, url)
  }

  setOptions(options:any /* OptionsType | string */, value:string = '') {
    const currentOptions:OptionsType = this.opts

    if (typeof options === 'object') {
      for (let oo in options) {
        currentOptions[oo] = options[oo]
      }
    }
    else {
      currentOptions[options] = value
    }

    return this
  }

  setHeaders(headers:any, value:string = '') {
    const currentHeaders = this.opts.headers

    if (typeof headers === 'object') {
      for (let hh in headers) {
        currentHeaders[hh.toLowerCase()] = headers[hh]
      }
    }
    else {
      currentHeaders[headers.toLowerCase()] = value
    }

    return this
  }

  setMimeType(type:string) {
    switch (type) {
      case 'json':
        type = 'application/json'
        break
      case 'form':
      case 'urlencoded':
        type = 'application/x-www-form-urlencoded'
        break
    }

    this.opts.headers['content-type'] = type

    return this
  }

  setQueryParams(queryParams) {
    const currentQueryParams = this.opts.queryParams

    for (let qq in queryParams) {
      currentQueryParams[qq] = queryParams[qq]
    }

    return this
  }

  setPayload(payload) {
    let type = this.opts.headers['content-type']

    if (isObject(payload) && isObject(this._body)) {
      // merge body
      for (let key in payload) {
        this._body[key] = payload[key]
      }
    }
    else if (typeof payload === 'string') {
      if (!type) {
        this.opts.headers['content-type'] = type = 'application/x-www-form-urlencoded'
      }

      if (type.indexOf('x-www-form-urlencoded') !== -1) {
        this._body = this._body ? this._body + '&' + payload : payload
      }
      else {
        this._body = (this._body || '') + payload
      }
    }
    else {
      this._body = payload
    }

    return this
  }

  appendFormData(key:any, value:?string) {
    if (!(this._body instanceof FormData)) {
      this._body = new FormData()
    }

    this._body.append(key, value)

    return this
  }

  execute() {
    const {opts, beforeRequest, afterResponse} = this
    let { url } = this

    try {
      if (['GET', 'HEAD', 'OPTIONS'].indexOf(opts.method.toUpperCase()) === -1) {
        if (this._body instanceof FormData) {
          opts.body = this._body
        }
        else if (isObject(this._body) && isJsonType(opts.headers['content-type'])) {
          opts.body = JSON.stringify(this._body)
        }
        else if (isObject(this._body)) {
          opts.body = stringify(this._body)
        }
        else {
          opts.body = this._body
        }
      }

      if (isObject(opts.queryParams)) {
        const queryParams = stringify(opts.queryParams)
        url += url.indexOf('?') >= 0 ? '&' + queryParams : '?' + queryParams
      }

      if (beforeRequest) {
        const isCanceled = !beforeRequest(url, opts.body)
        if (isCanceled) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }
    } catch (e) {
      return Promise.reject(e)
    }

    if (afterResponse) {
      return fetch(url, opts)
        .then(res => {
          afterResponse()
          return res
        })
    }

    return fetch(url.format(), opts)
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  catch(reject) {
    return this.execute().catch(reject)
  }

  json(strict = true) {
    return this.execute()
      .then(res => res.json())
      .then(json => {
        if (strict && !isObject(json)) {
          throw new TypeError('response is not strict json')
        }

        if (this.opts.afterJSON) {
          this.opts.afterJSON(json)
        }

        return json
      })
  }

  text() {
    return this.execute().then(res => res.text())
  }
}

function isObject(obj) {
  // not null
  return obj && typeof obj === 'object'
}

function isJsonType(contentType) {
  return contentType && contentType.indexOf('application/json') === 0
}

function stringify(obj) {
  return Object.keys(obj).map(key => {
    return key + '=' + obj[key]
  }).join('&')
}

function Fetch(options) {
  if (!(this instanceof Fetch)) {
    return new Fetch(options)
  }

  this.opts = options || {}
}

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

methods.forEach(method => {
  method                  = method.toLowerCase()
  Fetch.prototype[method] = function (url) {
    const options = assign({}, this.opts)
    return new Request(method, url, options)
  }
})

/**
 * export
 */

export default Fetch

export const get = (url:string, options?:Object):any /* Promise */ => {
  const getOptions = this.opts = assign({}, defaultOpts(), options)
  _normalizeHeaders(getOptions.headers)
  return fetch(url, getOptions)
    .then((data:Object):any /* Promise*/ => data.text())
    .then((text:string):any /* Promise*/ => dispatch(receiveZen(text)))
    .catch((error:Error) => {
      dispatch(requestZenError())
      throw error
    })
}

const _normalizeOptions = (options:OptionsType) => {
  options.httpMethod = options.httpMethod.toUpperCase()

  const headers = options.headers
  for (let h in headers) {
    let lowerCase = h.toLowerCase();
    if (h !== lowerCase) {
      headers[lowerCase] = headers[h]
      delete headers[h]
    }
  }
}


