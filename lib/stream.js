var util = require('util');
var events = require('events');

var _ = require('lodash');
var debug = require('debug')('twitter:stream');

var Stream = function(options, oauth) {
  if ("object" === typeof(options)) {
    if (options.parameters && "string" !== typeof(options.parameters.track)) {
      debug('Defaulting to tracking @theREDspace');
    }
    if (options.parameters && "string" !== typeof(options.url)) {
      debug('Defaulting URL to https://stream.twitter.com/1.1/statuses/filter.json');
    }
  } else {
    throw new Error('You must pass configuration for the stream via an object.');
  }
  if ("string" !== typeof(options.access_token)) {
    throw new Error('The access_token must be provided.');
  }
  if ("string" !== typeof(options.access_token_secret)) {
    throw new Error('The access_token_secret must be provided.');
  }
  events.EventEmitter.call(this);

  this.config = _.defaults({}, options, {
    url: "https://stream.twitter.com/1.1/statuses/filter.json",
    parameters: {
      track: "@theREDspace"
    }
  });

  this.oauth = oauth;
};
util.inherits(Stream, events.EventEmitter);

Stream.connect = function(options, oauth) {
  var stream = new Stream(options, oauth);
  return stream.connect(options);
};

Stream.prototype.connect = function(options) {
  var config = _.defaults({}, options, this.config);

  var request = this.request = this.oauth.post(
    config.url,
    config.access_token,
    config.access_token_secret,
    config.parameters
  );

  this.data = "";
  var self = this;
  request.on('response', function(response) {
    self.emit('connection', response);
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      self.data += chunk;
      if (self.data.charCodeAt(self.data.length - 2) === 13) {
        self._parse(self.data);
        self.data = "";
      }
    });
    response.on('close', function() {
      self.emit('disconnect', 'close');
    });
    response.on('end', function() {
      self.emit('disconnect', 'end');
    });
  });
  request.end();

  return this;
};

Stream.prototype.disconnect = function() {
  this.request.abort();
  this.emit('disconnect', 'abort');
};

Stream.prototype._parse = function(chunk) {
  var self = this;
  var tweet_array = chunk.trim().split('\r\n');
  _.each(tweet_array, function(item) {
    debug('Emitting Tweet Event');
    self.emit('tweet', JSON.parse(item));
  });
};

module.exports = Stream;