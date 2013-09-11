```
var util = require('util');

var T = new (require('twitter-streamer'))({
  "consumer_key": "QuFgG2HIGWaTV1eAtwpB0Q",
  "consumer_secret": "chielyjRgsRMZ7kJzrXD0R525tlGzY4uS5YHq2s6CI"
});

var stream = new T.Stream({
  "access_token": "346088055-lb01iQfM7bFE3CPowBPzr2p5ygZ0TZ5CFfzZajmT",
  "access_token_secret": "cubF2YrUa5LfiHxqA4XNu9c98SP2uHcJ11HVVuHmMo",
  "parameters": {
    track: "alot"
  }
});

var i = 0;
stream.on('connection', function() {
  i = 0;
  console.log('Connected!');
});


stream.on('tweet', function(tweet) {
  console.log('New Tweet!');
  i++;
  if (i > 4) {
    stream.disconnect();
  }
});

stream.on('disconnect', function(reason) {
  console.log(reason);
  switch (reason) {
    case "abort":
      console.log("Aborting.");
      stream.connect();
      break;
    case "end":
      console.log("Ending.");
      break;
    case "close":
      console.log("Close.");
      break;
  }
});

stream.connect();
```
