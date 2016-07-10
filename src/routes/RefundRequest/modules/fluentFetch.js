/* @flow */

// This package wsa significantly influenced by https://github.com/haoxins/fetch.io.
// Differences are semantic, type safety and the addition of mock creation.

import urlUtil, {Url} from 'url'
import _debug from 'debug'

export type MapToStringType = {
  [key: string]: string
}

export type MapToUrlType = {
  [key: string]: Url
}

export type OptionsType = {
  afterRequest : ?Function,
  beforeRequest: ?Function,
  cache: ?string,
  credentials: ?string,
  errorReporter: ?Function,
  headers: ?MapToStringType,
  httpMethod: ?string,
  corsMode: ?string,
  rootContextKey: ?string // Only provide in ctor Options; not setOptions() 
}

const debug = _debug("reusable:fluentFetch")
const defaultRootContext:Url  = urlUtil.parse('http://localhost:8080')
const contextMap:MapToUrlType = {
  'default': defaultRootContext
}

export const setRootContext = (key:string, rootContext:Url):?Url => {
  const priorContext = getRootContext(key)
  contextMap[key] = rootContext
  return priorContext;
}

export const getRootContext = (key:?string):Url => {
  return key ? (contextMap[key] || contextMap['default']) : contextMap['default']
}

const _defaultErrorReporter:Function = (response):Object => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response
}

export const defaultOpts:OptionsType = {
  afterRequest  : null,
  beforeRequest : null,
  cache         : 'no-cache',
  credentials   : 'include',
  errorReporter : _defaultErrorReporter,
  headers       : { 'content-type': 'application/json' },
  httpMethod    : 'GET',
  corsMode      : 'cors',
  queryParams   : null,
  rootContextKey: 'default'
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

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

const _isObject = (obj) => {
  return obj && typeof obj === 'object'
}

const _isJsonType = (contentType:?string) => {
  return contentType && contentType.indexOf('application/json') === 0
}

const _stringify = (obj:?MapToStringType = {}) => {
  return (obj || {}).length ?
         Object.keys(obj).map(key => {
           return key + '=' + obj[key]
         }).join('&') : ''
}

export class Request {

  constructor(url:Url, options:OptionsType = {}) {
    this.opts = Object.assign({}, defaultOpts, options)
    _normalizeOptions(this.opts)

    var rootContext = getRootContext(this.opts.rootContextKey);
    this.url        = urlUtil.parse(urlUtil.resolve(rootContext, url))

    this.setQueryParams(this.opts.queryParams)
    
    // console.error("debug() enabled: " + !!debug.enabled)
    if (debug.enabled) {
      debug("URL: " + JSON.stringify(this.url, null, 2))
    }
  }

  setOptions(options:OptionsType):Request {

    if (options.rootContextKey) {
      console.warn("Set rootContextKey in ctor options; ignored by fluent setOptions()")
      delete options.rootContextKey
    }
    this.opts = Object.assign({}, this.opts, options)

    return this
  }

  setOption(key:string, value:string):Request {
    if (key === 'rootContextKey') {
      console.warn("Set rootContextKey in ctor options; ignored by fluent setOption()")
      return
    }
    this.opts[key] = value
  }

  getOptions():OptionsType {
    return this.opts || {}
  }

  getUrl():Url {
    return this.url
  }

  setHeaders(headers:MapToStringType):Request {
    for (const headerKey of headers.keys()) {
      setHeader(headerKey, headers(headerKey))
    }
    return this
  }

  setHeader(headerKey:string, value:string) {
    this.opts.headers[headerKey.toLowerCase()] = value
    return this
  }

  setMimeType(type:string):Request {
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

  setQueryParams(queryParams:?MapToStringType):Request {
    this.url.query = (this.url.query || '') + _stringify(queryParams)
    return this
  }

  setPayload(payload:any):Request {
    let type = this.opts.headers['content-type']

    if (_isObject(payload) && _isObject(this._body)) {
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

  appendFormData(key:any, value:?string):Request {
    if (!(this._body instanceof FormData)) {
      this._body = new FormData()
    }

    this._body.append(key, value)

    return this
  }

  execute():any /* Promise */ {
    const { opts, beforeRequest, afterResponse } = this

    try {
      if (['GET', 'HEAD', 'OPTIONS'].indexOf(opts.method.toUpperCase()) === -1) {
        if (this._body instanceof FormData) {
          opts.body = this._body
        }
        else if (_isObject(this._body) && _isJsonType(opts.headers['content-type'])) {
          opts.body = JSON.stringify(this._body)
        }
        else if (_isObject(this._body)) {
          opts.body = _stringify(this._body)
        }
        else {
          opts.body = this._body
        }
      }

      if (beforeRequest) {
        const isCanceled = !beforeRequest(this.url, opts.body)
        if (isCanceled) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }

      if (afterResponse) {
        return fetch(this.url.format(), opts)
          .then(res => {
            afterResponse()
            return res
          })
      }

      return fetch(urlUtil.format(), opts)
    } catch (e) {
      return Promise.reject(e)
    }

  }

  then(resolve:Function, reject:Function):any /* Promise */ {
    return this.execute().then(resolve, reject)
  }

  catch(reject:Function):any /* Promise */ {
    return this.execute().catch(reject)
  }

  json(strict:boolean = true):string {
    return this.execute()
      .then(res => res.json())
      .then(json => {
        if (strict && !_isObject(json)) {
          throw new TypeError('response is not strict json')
        }

        if (this.opts.afterJSON) {
          this.opts.afterJSON(json)
        }

        return json
      })
  }

  text():string {
    return this.execute().then(res => res.text())
  }
}

export const get = (url:string, options:?Object):Request => {

  return new Request(url, options)
}


