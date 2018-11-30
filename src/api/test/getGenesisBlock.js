var assert = require("assert");
var Web3 = require("web3");
var web3FusionExtend = require("../web3FusionExtend");

console.log(process.env.PRIVATEKEY);
console.log(process.env.CONNECTSTRING);

var web3;
var provider;

describe("connect to server and get first block", function() {
  describe("ensure environment variables are setup correctly ", function() {
    assert(
      process.env.CONNECTSTRING,
      "Environment Variable CONNECTSTRING must be set."
    );
  });

  describe("connect to server and get first block", function() {
    it("Connect to Server", function(done) {
      provider = new Web3.providers.WebsocketProvider(
        process.env.CONNECTSTRING
      );
      provider.on("connect", function() {
        done();
      });
      provider.on("error", function(err) {
        done(err);
      });
      web3 = new Web3(provider);
      console.log(web3.version);
    });

    it("gets first block", function(done) {
      web3.eth
        .getBlock(0)
        .then(block => {
          assert(
            block.number === 0,
            "block number of block zero should be zero"
          );
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it("cleans up ", function() {
      provider.reset();
      web3.setProvider(null);
    });
  });
});
