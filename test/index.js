"use strict";

const expect = require('chai').expect;
const lib = require('..');
const http = require('http');
const https = require('https');

const assertHijackedContent = function(i) {
  expect(i).to.include("<h1>Example Domain</h1>");
}

const assertOriginalContent = function(i) {
  expect(i).to.include("<h1>httpbin(1)");
}

const tryHttpGetWithAgent = function(agent, callback) {
  http.get({
    hostname: 'httpbin.org',
    port: 80,
    path: '/',
    agent: agent
  }, (res) => {
    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      callback(rawData);
    });
  });
}

const tryHttpsGetWithAgent = function(agent, callback) {
  https.get({
    hostname: 'httpbin.org',
    port: 443,
    path: '/',
    agent: agent
  }, (res) => {
    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      callback(rawData);
    });
  });
}

describe('hijacked-http-agent', () => {

  describe('HijackedHttpAgent', () => {

    it('(request works without our agent)', (done) => {
      tryHttpGetWithAgent(undefined, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used without mapping', (done) => {
      const agent = new lib.HijackedHttpAgent();
      tryHttpGetWithAgent(agent, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used with domain mapping object', (done) => {
      const agent = new lib.HijackedHttpAgent();
      agent.domainMap = {
        "httpbin.org": "example.com"
      };
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping Map object', (done) => {
      const agent = new lib.HijackedHttpAgent();
      agent.domainMap = new Map();
      agent.domainMap.set("httpbin.org", "example.com");
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping function', (done) => {
      const agent = new lib.HijackedHttpAgent();
      let called = false;
      agent.domainMap = (domain) => {
        called = true;
        if ((domain) == "httpbin.org")
          return "example.com";
      };
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

  });

  describe('HijackedHttpsAgent', () => {

    it('(request works without our agent)', (done) => {
      tryHttpsGetWithAgent(undefined, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used without mapping', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      tryHttpsGetWithAgent(agent, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used with domain mapping object', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      agent.domainMap = {
        "httpbin.org": "example.com"
      };
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping Map object', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      agent.domainMap = new Map();
      agent.domainMap.set("httpbin.org", "example.com");
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping function', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      let called = false;
      agent.domainMap = (domain) => {
        called = true;
        if ((domain) == "httpbin.org")
          return "example.com";
      };
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

  });

  describe('hijackGlobalAgent', () => {

    it('should install successfully', () => {
      expect(http.globalAgent).to.be.an.instanceof(http.Agent);
      expect(https.globalAgent).to.be.an.instanceof(https.Agent);

      lib.hijackGlobalAgent({
        "httpbin.org": "example.com"
      });

      expect(http.globalAgent).to.be.an.instanceof(lib.HijackedHttpAgent);
      expect(https.globalAgent).to.be.an.instanceof(lib.HijackedHttpsAgent);
    });

    describe('should hijack node http & https', () => {
      it('http', (done) => {
        tryHttpGetWithAgent(undefined, (data) => {
          assertHijackedContent(data);
          done();
        });
      });

      it('https', (done) => {
        tryHttpsGetWithAgent(undefined, (data) => {
          assertHijackedContent(data);
          done();
        });
      });

      it('http (opt-out)', (done) => {
        tryHttpGetWithAgent(false, (data) => {
          assertOriginalContent(data);
          done();
        });
      });

      it('https (opt-out)', (done) => {
        tryHttpsGetWithAgent(false, (data) => {
          assertOriginalContent(data);
          done();
        });
      });
    });

    describe('should hijack request', () => {

      const request = require('request');

      it('http', (done) => {
        request('http://httpbin.org/', (err, res, body) => {
          assertHijackedContent(body);
          done();
        });
      });

      it('https', (done) => {
        request('https://httpbin.org/', (err, res, body) => {
          assertHijackedContent(body);
          done();
        });
      });

      it('http (opt-out)', (done) => {
        request('http://httpbin.org/', { agent: false }, (err, res, body) => {
          assertHijackedContent(body);
          done();
        });
      });

      it('https (opt-out)', (done) => {
        request('https://httpbin.org/', { agent: false }, (err, res, body) => {
          assertHijackedContent(body);
          done();
        });
      });

    });

    describe('should hijack axios', () => {

      const axios = require('axios');

      it('http', () => {
        return axios.get("http://httpbin.org/")
          .then((response) => assertHijackedContent(response.data))
      });

      it('https', () => {
        return axios.get("https://httpbin.org/")
          .then((response) => assertHijackedContent(response.data))
      });

    });

    describe('should hijack node-fetch', () => {

      const fetch = require('node-fetch');

      it('http', () => {
        return fetch("http://httpbin.org/")
          .then((i) => i.text())
          .then((i) => assertHijackedContent(i))
      });

      it('https', () => {
        return fetch("https://httpbin.org/")
          .then((i) => i.text())
          .then((i) => assertHijackedContent(i))
      });

    });

    describe('should hijack superagent', () => {

      const superagent = require('superagent');

      it('http', (done) => {
        superagent.get('http://httpbin.org/').agent(undefined).end((err, res) => {
          assertHijackedContent(res.text);
          done();
        });
      });

      it('https', (done) => {
        superagent.get('https://httpbin.org/').agent(undefined).end((err, res) => {
          assertHijackedContent(res.text);
          done();
        });
      });

      it('http (opt-out)', (done) => {
        superagent.get('http://httpbin.org/').end((err, res) => {
          assertOriginalContent(res.text);
          done();
        });
      });

      it('https (opt-out)', (done) => {
        superagent.get('https://httpbin.org/').end((err, res) => {
          assertOriginalContent(res.text);
          done();
        });
      });

    });

    describe('should hijack got', () => {

      const got = require('got');

      it('http', () => {
        return got.get("http://httpbin.org/")
          .then((response) => assertHijackedContent(response.body))
      });

      it('https', () => {
        return got.get("https://httpbin.org/")
          .then((response) => assertHijackedContent(response.body))
      });

    });

  });

});