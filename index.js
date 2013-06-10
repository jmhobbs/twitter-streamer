//Profiling/Heap Stack information
var agent = require('webkit-devtools-agent');
//Running this with DEBUG=debug will enable messages sent with debug object.
var debug = require('debug')('twitter');

//Dependencies 
var async = require('async');
var _ = require('lodash');
var OAuth = require('oauth').OAuth;

//Incoming deals with the incoming data, and formats it into individual tweets.
var Incoming = function(options) {
  options = _.defaults({}, options, {
    request_token_endpoint: "https://twitter.com/oauth/request_token",
    access_token_endpoint: "https://twitter.com/oauth/access_token"
  });

  if (typeof(options.consumer_key) != "string") {
    throw new Error('The consumer_key must be provided.');
  }

  if (typeof(options.consumer_secret) != "string") {
    throw new Error('The consumer_secret must be provided');
  }

  if (typeof(options.callback_url) != "string") {
    throw new Error('The callback_url must be provided.');
  }

  //Currently, this object is only constructed to give access to the post method, and the rest of
  //the configuration is not used. This could be changed at some point to actually retrieve the
  //access_token/secret.
  this.oa = new OAuth(
    options.request_token_endpoint,
    options.access_token_endpoint,
    options.consumer_key,
    options.consumer_secret,
    "1.0A",
    options.callback_url,
    "HMAC-SHA1"
  );

  this.streams = [];
}

Incoming.prototype.abort = function(index) {
  this.streams[index].request.abort();
  debug('Stream closed');
}

Incoming.prototype.open = function(options) {
  var self = this;

  if (typeof(options) == "object") {
    if (typeof(options.track) != "string") {
      debug('Defaulting to tracking @theREDspace');
    }

    if (typeof(options.url) != "string") {
      debug('Defaulting URL to https://stream.twitter.com/1.1/statuses/filter.json')
    }

    if (typeof(options.callback) != "function") {
      debug('No callback function provided, defaulting to console.log');
      
    }  
  } else {
    throw new Error('You must pass configuration for the stream via an object.');
  }

  if (typeof(options.access_token) != "string") {
    throw new Error('The access_token must be provided.');
  }

  if (typeof(options.access_token_secret) != "string") {
    throw new Error('The access_token_secret must be provided.')
  }

  options = _.defaults({}, options, {
    callback: function(tweet) {
      //console.log(tweet);
    },
    url: "https://stream.twitter.com/1.1/statuses/filter.json",
    parameters: {
      track: "@theREDspace"
    }
  });



  var request = this.oa.post(
    options.url,
    options.access_token,
    options.access_token_secret,
    options.parameters
  );

  var connection = {
    request: request,
    callback: options.callback
  }

  var index = this.streams.push(connection) - 1;
  
  request.on('response', function(response) {
    
    response.setEncoding('utf8');
    
    response.on('data', function(chunk) {
      self.parse({
        chunk: chunk, 
        index: index
      });
    });

    response.on('end', function() {
      debug('connection to twitter closed');
      //Could re-open the connection here, perhaps back-filling from the REST-API?
    });

  });
  request.end();

  //Give back index of stream, to be used with closeStream.
  return index;
}

// OLD REGEXP SOLUTION
  //var regexp = /([^\s},]?.*}[^\s,}]?)+/g
  //var array = tweet.match(regexp);

Incoming.prototype.parse = function(obj) {
  var self = this;
  var array = obj.chunk.trim().split('\r\n');
  async.each(array, function(item, callback) {
    self.giveTweet({tweet: item, index: obj.index}, callback);
  }, function(err) {
    if (err && process.env.DEBUG) {
      var fs = require('fs');
      fs.writeFileSync('test', obj.chunk);
    }
  });
}

Incoming.prototype.giveTweet = function(obj, cb) {
  try {
    var tweet = obj.tweet;
    tweet = JSON.parse(tweet);
    debug('Outgoing Tweet');
    debug('Tweet Created_At: %s', tweet.created_at);
    debug('Tweet Content: %s', tweet.text);
    this.streams[obj.index].callback(tweet);
    cb(null);
  } catch(e) {
    cb(e);
  }
}

module.exports = Incoming;



//Example
var config = require('./config.json');

var incoming = new Incoming({
  callback_url: "http://localhost:3000/callback",
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret
});


var index = incoming.open({
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  callback: function(tweet) {
    console.log('tweet');
  },
  parameters: {
    track: config.track
  }
});