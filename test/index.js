const { expect } = require('chai');

require('..').hijackGlobalAgent({
  "www.google.com": "example.com"
});

require('isomorphic-fetch');

const assertExampleContent = function(i) {
  expect(i).to.include("<h1>Example Domain</h1>");
}

describe('hijacked-http-agent', () => {
  it('should hijack isomorphic-fetch http', () => {
    return fetch("http://www.google.com/index.html")
      .then((i) => i.text())
      .then((i) => assertExampleContent(i))
  })

  it('should hijack isomorphic-fetch https', () => {
    return fetch("https://www.google.com/index.html")
      .then((i) => i.text())
      .then((i) => assertExampleContent(i))
  })
})