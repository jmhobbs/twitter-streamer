```
var util = require('util');

var T = new (require('twitter-streamer'))({
  "consumer_key": "Blurb",
  "consumer_secret": "Durb"
});

var stream = new T.Stream({
  "access_token": "Hurp",
  "access_token_secret": "Derp",
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
