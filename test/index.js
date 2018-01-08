const { expect } = require('chai');

require('..').hijackGlobalAgent({
  "www.google.com": "www.baidu.com"
});

require('isomorphic-fetch');

describe('hijacked-http-agent', () => {
  it('should hijack isomorphic-fetch http', () => {
    return fetch("http://www.google.com/content-search.xml")
      .then((i) => i.text())
      .then((i) => expect(i).to.include("<ShortName>百度搜索</ShortName>"))
  })

  it('should hijack isomorphic-fetch https', () => {
    return fetch("https://www.google.com/content-search.xml")
      .then((i) => i.text())
      .then((i) => expect(i).to.include("<ShortName>百度搜索</ShortName>"))
  })
})