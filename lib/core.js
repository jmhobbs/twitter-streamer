var debug = require('debug')('twitter:core');
var _ = require('lodash');
var OAuth = require('oauth').OAuth;
var Stream = require('./stream');

var Twitter = function(options) {
  options = _.defaults({}, options, {
    request_token_endpoint: "https://twitter.com/oauth/request_token",
    access_token_endpoint: "https://twitter.com/oauth/access_token",
    callback_url: null
  });
  this.config = options;

  if ("string" !== typeof(options.consumer_key)) {
    throw new Error("The consumer_key must be provided.");
  }

  if ("string" !== typeof(options.consumer_secret)) {
    throw new Error("The consumer_secret must be provided.");
  }

  debug('Constructing the internal OAuth object');
  this.oauth = new OAuth(
    options.request_token_endpoint,
    options.access_token_endpoint,
    options.consumer_key,
    options.consumer_secret,
    "1.0A",
    options.callback_url,
    "HMAC-SHA1"
  );

  var self = this;
  this.Stream = function(options) {
    var config = _.defaults({}, options, self.config);
    console.log(config);
    return new Stream(config, self.oauth);
  };
};

Twitter.prototype.get = function(property) {
  return this[property];
};

Twitter.prototype.retrieveTokens = function(cb) {
  debug('Requesting tokens');
  this.oauth.getOAuthRequestToken(function(err, access_token, access_token_secret, results) {
    if (err) {
      return cb(err);
    }
    var obj = {
      access_token:access_token,
      access_token_secret: access_token_secret
    };
    debug(JSON.stringify(obj));
    return cb(null, obj);
  });
};

module.exports = Twitter;