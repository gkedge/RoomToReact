/* @flow */

// This package wsa significantly influenced by https://github.com/haoxins/fetch.io.
// Differences are semantic, type safety and the addition of mock creation.
import type {RequestErrorReportType} from 'reusable/interfaces/FpngTypes'
import RequestError from 'reusable/errors/RequestError'

import 'whatwg-fetch'  // isomorphic-fetch contains the browser-specific whatwg-fetch
import _debug from 'debug'
import urlUtil, {Url} from 'url'
import isUndefined from 'lodash/isUndefined'
import isObject from 'lodash/isObject'
import isEmpty from 'lodash/isEmpty'
import each from 'lodash/each'
import transform from 'lodash/transform'
import includes from 'lodash/includes'
import fetcbTime from 'promise-time'

// TODO: Only 'require()' this when mock() called.
import fetchMock from 'fetch-mock'

export type MapToStringType = { [key: string]: string }

export type MapToUrlType = { [key: string]: Url}

export type OptionsType = {
  afterJSON: ? Function,
  afterRequest: ? Function,
  beforeRequest: ? Function,
  cache: ? string,
  corsMode: ? string,
  credentials: ? string,
  errorLogger: ? Function,
  headers: ? MapToStringType,
  httpMethod: ? string,
  isMocking: ?boolean,
  queryParams: ?MapToStringType,
  rootContextKey: ? string // Only provide in ctor Options; not setOptions()
}

const debugUrl = _debug("reusable:fluentRequest:url")
const debugMocking = _debug("reusable:fluentRequest:mocking")
const debugRequestTime = _debug("reusable:fluentRequest:time")
const defaultRootContext:Url = urlUtil.parse('http://localhost:8080')
const contextMap:MapToUrlType = {
  'default': defaultRootContext
}

const hasStackTrace = (():boolean => {
  try {
    let stackTrace = {}
    Error.captureStackTrace(stackTrace, "")
    return true
  }
  catch (e) {
    return false
  }
})()

export const setRootContext = (key:string, rootContext:?Url):?Url => {
  key = key || 'default'
  const priorContext = getRootContext(key)
  if (!rootContext) {
    delete contextMap[key]
  }
  else {
    contextMap[key] = rootContext
  }
  return priorContext
}

export const getRootContext = (key:? string):? Url => {
  return contextMap[key || 'default'] || null
}

let serviceChainFailNumber = 0
export const responseFail = (reason:any, message:?string):any => {
  if (reason.skipLogging) {
    return
  }

  const serviceChain = reason.serviceChain === undefined
    ? serviceChainFailNumber++ : reason.serviceChain

  if (isObject(reason.message)) {
    message = JSON.stringify(reason.message, null, 2)
  }

  if (reason instanceof Error) {
    message = Error.prototype.name + '(' + serviceChain + '): ' + message
    message += '\n' + reason.message
    if (isUndefined(reason.serviceChain)) {
      message += '\n' + reason.stack
    }
  }
  else if (typeof reason === 'string') {
    message = reason
  }
  else {
    message = ""
  }
  message += '\n'

  if (hasStackTrace) {
    let stackTrace = {}
    Error.captureStackTrace(stackTrace, responseFail)
    const stack = stackTrace.stack
    let breadcrumb = stack
    // Cut off junk on front of stack string.
    each(['/internal/', 'at eval (', 'Error\n'], (startOffsetStr:string):?boolean => {
      let start = stack.indexOf(startOffsetStr)
      if (start > -1) {
        start += startOffsetStr.length
        breadcrumb = stack.substring(start)
        return false
      }
    })

    // Cut off junk on end of stack string.
    each([')', '\n'], (endOffsetStr:string):?boolean => {
      const end = breadcrumb.indexOf(endOffsetStr)
      if (end > -1) {
        breadcrumb = breadcrumb.substring(0, end)
        return false
      }
    })
    message += 'Breadcrumb: ' + breadcrumb
  }
  if (reason instanceof Object) {
    reason.serviceChain = serviceChain
  }
  console.error(message)
}

const _defaultErrorLogger:Function = (response:Object):Object => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then((json:Object):Promise => {
        const requestErrorReport:RequestErrorReportType = {
          statusCode:       response.status,
          statusText:       response.statusText,
          errorMessageText: json.errorMessageText,
          infoMessageText:  json.infoMessageText,
          warnMessageText:  json.warnMessageText
        }
        throw new RequestError(requestErrorReport)
      })
    }
    else {
      throw new RequestError({
        statusCode: response,
        statusText: response.statusText
      })
    }
  }
  return response
}

export const defaultOpts:OptionsType = {
  afterJSON:      null,
  afterRequest:   null,
  beforeRequest:  null,
  cache:          'no-cache',
  corsMode:       'cors',
  credentials:    'omit',
  errorLogger:    _defaultErrorLogger,
  headers:        {'Accept': 'application/json'},
  httpMethod:     'GET',
  isMocking:      false,
  queryParams:    null,
  rootContextKey: 'default'
}

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

const _normalizeOptions = (options:OptionsType) => {
  if (options.httpMethod) {
    options.httpMethod = options.httpMethod.trim().toUpperCase()

    if (options.httpMethod && !includes(methods, options.httpMethod)) {
      throw Error('Illegal HTTP method: `' + options.httpMethod + '`')
    }
  }

  options.isMocking = options.isMocking || __MOCK__

  const headers = options.headers
  each(headers, (headerValue:string, headerName:string) => {
    let lowerCase = headerName.toLowerCase()
    if (headerName !== lowerCase) {
      headers[lowerCase] = headerValue
      delete headers[headerName]
    }
  })
}

const _stringify = (obj:?MapToStringType = {}):string => {
  return transform(obj || {}, (result:Array<string>, value:string, key:string):Array<string> => {
    const keyValueProp = key + '=' + value
    result[0] += isEmpty(result[0]) ? keyValueProp : '&' + keyValueProp
    return result
  }, [''])[0]
}

export class Request {

  constructor(url:Url, options:OptionsType = {}) {
    _normalizeOptions(options)

    this.opts = Object.assign({}, defaultOpts, options)

    const rootContext = getRootContext(this.opts.rootContextKey)
    url.pathname = (rootContext.pathname || '') + (url.pathname || '')
    this.url = urlUtil.parse(urlUtil.resolve(rootContext, url))

    if (this.opts.queryParams) {
      this.setQueryParams(this.opts.queryParams)
    }
  }

  setOptions(options:OptionsType):Request {
    if (options.rootContextKey) {
      console.warn("Set rootContextKey in ctor options only; ignored by fluent setOptions()")
      delete options.rootContextKey
    }
    _normalizeOptions(options)

    this.opts = Object.assign({}, this.opts, options)
    return this
  }

  setOption(key:string, value:string):Request {
    if (key === 'rootContextKey') {
      console.warn("Set rootContextKey in ctor options; ignored by fluent setOption()")
      return
    }
    const optionObj = {}
    optionObj[key] = value
    _normalizeOptions(optionObj)
    this.opts[key] = value
  }

  getOptions():OptionsType {
    return this.opts || {}
  }

  getUrl():Url {
    return this.url
  }

  setHeaders(headers:MapToStringType):Request {
    each(headers, (header:string, headerKey:string) => {
      this.setHeader(headerKey, header)
    })
    return this
  }

  setHeader(headerKey:string, value:string):Request {
    this.opts.headers[headerKey.toLowerCase()] = value
    return this
  }

  setMimeType(type:string):Request {
    switch (type) {
      case 'json':
        type = 'application/json; charset=utf-8'
        break
      case 'form':
      case 'urlencoded':
        type = 'application/x-www-form-urlencoded; charset=utf-8'
        break
    }

    this.opts.headers['content-type'] = type

    return this
  }

  getMimeType():?string {
    return this.opts.headers['content-type']
  }

  isMimeType(typeToCheck:string):boolean {
    const currentType:?string = this.getMimeType()
    switch (typeToCheck) {
      case 'json':
        return currentType === 'application/json; charset=utf-8'
      case 'form':
      case 'urlencoded':
        return currentType === 'application/x-www-form-urlencoded; charset=utf-8'
      default:
        return false
    }
  }

  setQueryParams(queryParams:MapToStringType):Request {
    let newQueryParams = _stringify(queryParams)
    if (newQueryParams) {
      newQueryParams = (this.url.query ? '&' : '?') + newQueryParams

      this.url = urlUtil.parse(this.url.format() + newQueryParams)
    }
    return this
  }

  setQueryParam(queryKey:string, queryValue:string):Request {
    const newQueryParams = (this.url.query ? '&' : '?') + queryKey + '=' + queryValue
    this.url = urlUtil.parse(this.url.format() + newQueryParams)
    return this
  }

  setPayload(payload:any):Request {
    if (isObject(payload) && isObject(this._payload)) {
      this._payload = Object.assign(this._payload, payload)
    }
    else if (typeof payload === 'string') {
      const type = this.getMimeType()

      if (!type) {
        this.setMimeType('urlencoded')
      }

      if (this.isMimeType('urlencoded')) {
        this._payload = this._payload ? this._payload + '&' + payload : payload
      }
      else {
        this._payload = (this._payload || '') + payload
      }
    }
    else {
      this._payload = payload
    }

    return this
  }

  appendFormData(key:any, value:?string):Request {
    if (!(this._payload instanceof FormData)) {
      this._payload = new FormData()
    }

    this._payload.append(key, value)

    return this
  }

  mock(mockedResponseData:any):Request {
    this.opts.isMocking = true
    this.opts.mockData = mockedResponseData
    return this
  }

  execute():any /* Promise */ {
    const {opts} = this
    const {httpMethod, beforeRequest, afterResponse} = opts
    opts.method = httpMethod
    opts.mode = opts.corsMode
    try {
      if (!includes(['GET', 'HEAD', 'OPTIONS'], httpMethod)) {
        if (this._payload instanceof FormData) {
          opts.body = this._payload
        }
        else if (isObject(this._payload) && this.isMimeType('json')) {
          opts.body = JSON.stringify(this._payload)
        }
        else if (isObject(this._payload)) {
          opts.body = _stringify(this._payload)
        }
        else {
          opts.body = this._payload
        }
      }
      else {
        delete opts.headers['content-type']
      }

      if (beforeRequest) {
        const isCanceled = !beforeRequest(this.url, opts.body)
        if (isCanceled) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }

      if (debugUrl.enabled) {
        debugUrl("URL: " + JSON.stringify(this.url, null, 2))
      }

      if (this.opts.isMocking) {
        if (this.opts.mockData) {
          fetchMock.mock(this.url.format(), this.opts.httpMethod, this.opts.mockData)
        }
        else /* auto-mocking */ {
          // Read JSON response data available in the __mockData__ map.  The URL's
          // pathname acts as the key. The __mockData__ response data is loaded by karma
          // by karma-json-fixtures-preprocessor using the ./test/resources/mockdata/**/*.json
          // files as source. Obviously, these JS objects are ONLY intended to be
          // available during test operations. See __MOCK__ in config/index.js.
          const mockData = __mockData__[this.url.pathname]
          debugMocking(this.url.pathname + ' data: ' +
            JSON.stringify(__mockData__[this.url.pathname]))
          fetchMock.mock(this.url.format(), this.opts.httpMethod, mockData)
        }
      }
      if (afterResponse || debugRequestTime.enabled) {
        // fetcbTime() is a timer focused on functions that return
        // a Promise.
        const fetchPromise = debugRequestTime.enabled
          ? fetcbTime(fetch)(this.url.format(), opts)
          : fetch(this.url.format(), opts)

        return fetchPromise
          .then((response:any):any => {
            debugRequestTime(this.url.pathname + ': +' + fetchPromise.time + 'ms')
            afterResponse && afterResponse()
            return response
          })
      }
      return fetch(this.url.format(), opts)
    }
    catch (e) {
      return Promise.reject(e)
    }
  }

  // The user of this package will kick off the fetch execution by adding
  // one of the following calls to the fluent interface.  From that point
  // forward, only Promises will be returned; not Requests, so it won't
  // be possible to request another one of the following calls.
  then(resolve:Function, reject:?Function):any /* Promise */ {
    return this.execute()
      .then(this.opts.errorLogger)
      .then(resolve, reject)
  }

  catch(reject:Function):any /* Promise */ {
    return this.execute()
      .then(this.opts.errorLogger)
      .catch(reject)
  }

  json(strict:boolean = true):any /* Promise */ {
    return this.execute()
      .then(this.opts.errorLogger)
      .then((res:any):any /* Promise */ => res.json())
      .then((json:any):any /* Promise */ => {
        if (strict && !isObject(json)) {
          throw new TypeError('Response is not strict JSON: /n' + JSON.stringify(json))
        }

        if (this.opts.afterJSON) {
          this.opts.afterJSON(json)
        }

        return json
      })
  }

  text():any /* Promise */ {
    return this.execute()
      .then(this.opts.errorLogger)
      .then((res:Object):any /* Promise */=> res.text())
  }
}

export const get = (url:Url, options:?OptionsType):Request => {
  return new Request(url, options)
}
export const post = (url:Url, options:?OptionsType):Request => {
  options.httpMethod = "POST"
  return new Request(url, options)
}
export const put = (url:Url, options:?OptionsType):Request => {
  options.httpMethod = "PUT"
  return new Request(url, options)
}
