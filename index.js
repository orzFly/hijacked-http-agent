"use strict";

const http = require('http');
const https = require('https');

function isFunction(x) {
  return Object.prototype.toString.call(x) === "[object Function]";
}

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]";
}

function replaceDomain(domainMap, domain) {
  if (!domain) return domain;
  if (!domainMap) return domain;

  if (isFunction(domainMap)) {
    return domainMap(domain) || domain;
  }

  if (domainMap.get && isFunction(domainMap.get)) {
    return domainMap.get(domain) || domain;
  }

  if (domainMap.hasOwnProperty(domain)) {
    return domainMap[domain] || domain;
  }

  return domain;
}

function replaceHeaders(self, headers) {
  if (headers.host && headers.host.length == 2 && headers.host[1]) {
    headers.host[1] = replaceDomain(self.domainMap, headers.host[1]);
  } else if (headers.host && isString(headers.host)) {
    headers.host = replaceDomain(self.domainMap, headers.host);
  }
}

function hijackedAddRequest(self, req, options) {
  req.hostname = replaceDomain(self.domainMap, req.hostname);
  options.host = replaceDomain(self.domainMap, options.host);
  options.hostname = replaceDomain(self.domainMap, options.hostname);

  /* istanbul ignore if: node < 8*/
  if (req._headers) {
    replaceHeaders(self, req._headers);
  }

  /* istanbul ignore if: node > 8*/
  if (Object.getOwnPropertySymbols) {
    for(const symbol of Object.getOwnPropertySymbols(req)) {
      /* istanbul ignore if */
      if (symbol.toString() == "Symbol(outHeadersKey)") {
        replaceHeaders(self, req[symbol]);
        break;
      }
    }
  }
}

function hijackedCreateConnection(self, options) {
  options.servername = replaceDomain(self.domainMap, options.servername);
  options.hostname = replaceDomain(self.domainMap, options.hostname);
}

class HijackedHttpAgent extends http.Agent {
  addRequest(req, options) {
    hijackedAddRequest(this, req, options);
    return super.addRequest(req, options);
  }

  createConnection(options, callback) {
    hijackedCreateConnection(this, options);
    return super.createConnection(options, callback)
  }
}

class HijackedHttpsAgent extends https.Agent {
  addRequest(req, options) {
    hijackedAddRequest(this, req, options);
    return super.addRequest(req, options);
  }

  createConnection(options, callback) {
    hijackedCreateConnection(this, options);
    return super.createConnection(options, callback)
  }
}

function hijackGlobalAgent(domainMap) {
  Object.setPrototypeOf(http.globalAgent, HijackedHttpAgent.prototype)
  Object.setPrototypeOf(https.globalAgent, HijackedHttpsAgent.prototype)
  http.globalAgent.domainMap = domainMap;
  https.globalAgent.domainMap = domainMap;
}

module.exports = { HijackedHttpAgent, HijackedHttpsAgent, hijackGlobalAgent }