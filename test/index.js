const expect = require('chai').expect;

require('..').hijackGlobalAgent({
  "www.google.com": "example.com"
});

require('isomorphic-fetch');

const assertExampleContent = function(i) {
  expect(i).to.include("<h1>Example Domain</h1>");
}

describe('hijacked-http-agent', () => {
  describe('should hijack', () => {
    describe('isomorphic-fetch', () => {
      it('http', () => {
        return fetch("http://www.google.com/index.html")
          .then((i) => i.text())
          .then((i) => assertExampleContent(i))
      })

      it('https', () => {
        return fetch("https://www.google.com/index.html")
          .then((i) => i.text())
          .then((i) => assertExampleContent(i))
      })
    })
  })
})