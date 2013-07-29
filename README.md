```
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

incoming.close(index);
```