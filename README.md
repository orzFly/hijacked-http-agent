node hijacked-http-agent
========================

[![Build Status](https://travis-ci.org/orzFly/node-hijacked-http-agent.svg?branch=master)](https://travis-ci.org/orzFly/node-hijacked-http-agent) [![Coverage Status](https://coveralls.io/repos/github/orzFly/node-hijacked-http-agent/badge.svg?branch=master)](https://coveralls.io/github/orzFly/node-hijacked-http-agent?branch=master)

```sh
yarn add hijacked-http-agent
npm install hijacked-http-agent --save
```

```javascript
require('hijacked-http-agent').hijackGlobalAgent({
  "googleapis.com": "gapis.internal-proxy.local"
});
```
