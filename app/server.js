import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import botkit from 'botkit';
import dotenv from 'dotenv';

const yelp = require('yelp-fusion');


dotenv.config({ silent: true });

// initialize
const app = express();

// enable/disable cross origin resource sharing if necessary
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static('static'));
// enables static assets from folder static
app.set('views', path.join(__dirname, '../app/views'));
// this just allows us to render ejs from the ../app/views directory

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

console.log(process.env.SLACK_BOT_TOKEN);

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM((err) => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

controller.hears(['hello', 'hi', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Hello there!');
});
controller.on('user_typing', (bot, message) => {
  bot.reply(message, 'What ya writing?');
});
controller.hears(['hungry', 'food', 'restaurant'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Do you want me to recommend some restaurants for ya?');
});
controller.hears(['ok', 'fine', 'alright', 'yes'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'What type of food do you want?');
});

controller.hears(['sushi', 'japanese', 'asian'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'This is what I found in Hanover.');
  let yelpClient;
  yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET)
    .then((res) => {
      yelpClient = yelp.client(res.jsonBody.access_token);
      yelpClient.search({
        term: 'Sushi',
        location: 'hanover, nh',
      }).then((response) => {
        const data = response.jsonBody;
        data.businesses.forEach((business) => {
          bot.reply(message, business.name);
        });
      }).catch((e) => {
        console.log(e);
      });
    });
});
controller.hears(['italian', 'pizza', 'spaghetti'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'This is what I found in Hanover.');
  let yelpClient;
  yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET)
    .then((res) => {
      yelpClient = yelp.client(res.jsonBody.access_token);
      yelpClient.search({
        term: 'pizza',
        location: 'hanover, nh',
      }).then((response) => {
        const data = response.jsonBody;
        data.businesses.forEach((business) => {
          bot.reply(message, business.name);
        });
      }).catch((e) => {
        console.log(e);
      });
    });
});
controller.hears(['indian', 'curry'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'This is what I found in Hanover.');
  let yelpClient;
  yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET)
    .then((res) => {
      yelpClient = yelp.client(res.jsonBody.access_token);
      yelpClient.search({
        term: 'curry',
        location: 'hanover, nh',
      }).then((response) => {
        const data = response.jsonBody;
        data.businesses.forEach((business) => {
          bot.reply(message, business.name);
        });
      }).catch((e) => {
        console.log(e);
      });
    });
});


// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
