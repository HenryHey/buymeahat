// server.js
// where your node app starts

// init project
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const Twit = require('twit');

// const dota2 = require('./dota2.js');
const tf2 = require('./tf2.js');

const app = express();
const { key } = process.env;

const tweetHat = (async (hat) => {
  const config = {
    twitter: {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    },
  };
  const T = new Twit(config.twitter);
  const image = await axios.get(hat.icon_url, { responseType: 'arraybuffer' });
  const image64 = Buffer.from(image.data, 'binary').toString('base64');
  try {
    const data = await T.post('media/upload', { media_data: image64 });
    const text = `${hat.name} (Team Fortress 2)`;

    await T.post('statuses/update', {
      status: text,
      media_ids: new Array(data.data.media_id_string),
    });
    console.log(hat);
  } catch (e) {
    console.log(e);
  }
});

const main = async () => {
  try {
    let ids;
    if (!fs.existsSync('./prices.json')) {
      ids = await tf2.getItems(key);
      const content = {
        lastModified: Date.now(),
        ids,
      };
      fs.writeFileSync('./prices.json', JSON.stringify(content));
    } else {
      ids = JSON.parse(fs.readFileSync('./prices.json'));
      ids = ids.ids;
    }
    const item = await tf2.getItem(key, ids);
    tweetHat(item);
    console.log(item);
  } catch (e) {
    console.log(e);
  }
};

app.use(express.static('public'));

app.get('/', (request, response) => {
  main(response);
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port http://localhost:${listener.address().port}`);
});
