"use strict";

const http = require('http');
const https = require('https');

function replaceDomain(domainMaps, domain) {
  if (domainMaps.get) {
    return String(domainMaps.get(domain) || domain);
  }
  return String((domainMaps || {})[domain] || domain);
}

class HijackedHttpAgent extends http.Agent {
  addRequest(req, options) {
    req.hostname = replaceDomain(this.domainMaps, req.hostname);
    options.host = replaceDomain(this.domainMaps, options.host);
    options.hostname = replaceDomain(this.domainMaps, options.hostname);

    if (req._headers) {
      const headers = req._headers;
      if (headers.host && headers.host.length == 2 && headers.host[1]) {
        headers.host[1] = replaceDomain(this.domainMaps, headers.host[1]);
      }
    }

    if (Object.getOwnPropertySymbols) {
      for(const symbol of Object.getOwnPropertySymbols(req)) {
        if (symbol.toString() == "Symbol(outHeadersKey)") {
          const headers = req[symbol];
          if (headers.host && headers.host.length == 2 && headers.host[1]) {
            headers.host[1] = replaceDomain(this.domainMaps, headers.host[1]);
          }
        }
      }
    }

    return super.addRequest(req, options);
  }

  createConnection(options, callback) {
    options.servername = replaceDomain(this.domainMaps, options.servername);
    options.hostname = replaceDomain(this.domainMaps, options.hostname);

    return super.createConnection(options, callback)
  }
}

class HijackedHttpsAgent extends https.Agent {
  addRequest(req, options) {
    req.hostname = replaceDomain(this.domainMaps, req.hostname);
    options.host = replaceDomain(this.domainMaps, options.host);
    options.hostname = replaceDomain(this.domainMaps, options.hostname);

    if (req._headers) {
      const headers = req._headers;
      if (headers.host && headers.host.length == 2 && headers.host[1]) {
        headers.host[1] = replaceDomain(this.domainMaps, headers.host[1]);
      }
    }

    if (Object.getOwnPropertySymbols) {
      for(const symbol of Object.getOwnPropertySymbols(req)) {
        if (symbol.toString() == "Symbol(outHeadersKey)") {
          const headers = req[symbol];
          if (headers.host && headers.host.length == 2 && headers.host[1]) {
            headers.host[1] = replaceDomain(this.domainMaps, headers.host[1]);
          }
        }
      }
    }

    return super.addRequest(req, options);
  }

  createConnection(options, callback) {
    options.servername = replaceDomain(this.domainMaps, options.servername);
    options.hostname = replaceDomain(this.domainMaps, options.hostname);

    return super.createConnection(options, callback)
  }
}

function hijackGlobalAgent(domainMaps) {
  Object.setPrototypeOf(http.globalAgent, HijackedHttpAgent.prototype)
  Object.setPrototypeOf(https.globalAgent, HijackedHttpsAgent.prototype)
  http.globalAgent.domainMaps = domainMaps;
  https.globalAgent.domainMaps = domainMaps;
}

module.exports = { HijackedHttpAgent, HijackedHttpsAgent, hijackGlobalAgent }