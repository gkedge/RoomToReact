/* @flow */

// This package wsa significantly influenced by https://github.com/haoxins/fetch.io.
// Differences are semantic, type safety and the addition of mock creation.

import urlUtil, {Url} from 'url'

export type OptionsType = {
  afterRequest : ?Function,
  beforeRequest: ?Function,
  cache: ?string,
  credentials: ?string,
  errorReporter: ?Function,
  headers: ?Object,
  httpMethod: ?string,
  corsMode: ?string,
  rootContext: ?Url,
  queryParams : ?Object
}

export const defaultErrorReporter:Function = (response):Object => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response
}

const defaultRootContext /* :Url */ = urlUtil.parse('http://localhost:8080')

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

const _isJsonType = (contentType) => {
  return contentType && contentType.indexOf('application/json') === 0
}

const _stringify = (obj) => {
  return Object.keys(obj).map(key => {
    return key + '=' + obj[key]
  }).join('&')
}

export class Request {

  constructor(url:Url, options:OptionsType = {}) {
    this.opts = Object.assign({}, defaultOpts, options)
    _normalizeOptions(this.opts)

    this.url = urlUtil.resolve(this.opts.rootContext, url)
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

  getOptions():OptionsType {
    return this.opts || {}
  }
  
  getUrl():Url {
    return this.url
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

  appendFormData(key:any, value:?string) {
    if (!(this._body instanceof FormData)) {
      this._body = new FormData()
    }

    this._body.append(key, value)

    return this
  }

  execute() {
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

      if (_isObject(opts.queryParams)) {
        const queryParams = _stringify(opts.queryParams)
        this.url += this.url.indexOf('?') >= 0 ? '&' + queryParams : '?' + queryParams
      }

      if (beforeRequest) {
        const isCanceled = !beforeRequest(this.url, opts.body)
        if (isCanceled) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }
    } catch (e) {
      return Promise.reject(e)
    }

    if (afterResponse) {
      return fetch(this.url, opts)
        .then(res => {
          afterResponse()
          return res
        })
    }

    return fetch(urlUtil.format(), opts)
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
        if (strict && !_isObject(json)) {
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

export const get = (url:string, options:?Object):Request => {

  return new Request(url, options)
}


