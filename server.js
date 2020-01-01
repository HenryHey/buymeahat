// server.js
// where your node app starts

// init project
const axios = require('axios');
const fs = require('fs');
const express = require("express");
const Twit = require('twit');
const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("/", function(request, response) {
  main(response);  
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});


const key = process.env.key;
const TF_APP_ID = 440;

const tweetHat = (async (hat) => {
  const config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
    twitter: {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    }
  };
  const T = new Twit(config.twitter);
  const image = await axios.get(hat.icon_url, {responseType: 'arraybuffer'});
  const image64 = Buffer.from(image.data, 'binary').toString('base64');
  try {
    const data = await T.post('media/upload', { media_data: image64});
    const text = `${hat.name} (Team Fortress 2)`;
    await T.post('statuses/update', {
      status: text,
      media_ids: new Array(data.data.media_id_string)
    });
    console.log(hat);
  } catch (e) {
    console.log(e);
  }
});

const getItems = async (appId, currency = 'USD', language = 'en_US') => {
  const baseUrl = 'http://api.steampowered.com/ISteamEconomy/GetAssetPrices/v0001/';
  const url = `${baseUrl}?key=${key}&appId=${appId}&language=${language}&currency=${currency}`;
  try {
    let result = await axios.get(url);
    result = result.data.result;

    if (result.success) {
      result = result.assets
        .filter(asset => asset.tags.includes('Cosmetics'))
        .map(asset => asset.class[0].value);
      return result;
    } else {
      console.log('Error getting asset prices');
      return {};
    }
  } catch (e) {
    console.error(e);
    return {};
  }
};

const getItem = async (appId, classId, language = 'en_US') => {
  const iconCDN = 'http://cdn.steamcommunity.com/economy/image/';
  const baseUrl = 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v0001/';
  const url = `${baseUrl}?key=${key}&appid=${appId}&class_count=1&language=${language}&classid0=${classId}`;
  try {
    let result = await axios.get(url);
    result = result.data.result[classId];
    const out = {
      icon_url: iconCDN + result.icon_url,
      name: result.name,
      type: result.type
    }

    return out;
  } catch (e) {
    console.error(e);
    return {};
  }
};

const main = async (response) => {
  try {
    let ids;
    if (!fs.existsSync('./prices.json')) {
      ids = await getItems(TF_APP_ID);
      const content = {
        lastModified: Date.now(),
        ids: ids
      };
      fs.writeFileSync('./prices.json', JSON.stringify(content));
    } else {
      ids = JSON.parse(fs.readFileSync('./prices.json'));
      ids = ids.ids;
    }
    let item;
    do {
      const randAsset = ids[Math.floor(Math.random() * ids.length)];
      item = await getItem(TF_APP_ID, randAsset);
      process.stdout.write('.');
    } while (!item.type || !item.type.toLowerCase().includes('hat'));
    tweetHat(item);
    console.log(item);
  } catch (e) {
    console.log(e);
  }
//   try {
//     let prices;
//     if (!fs.existsSync('./prices.json')) {
//       prices = await getItems(TF_APP_ID);
//       const content = {
//         lastModified: Date.now(),
//         prices: prices
//       }
//       fs.writeFileSync('./prices.json', JSON.stringify(content));
//     } else {
//       prices = JSON.parse(fs.readFileSync('./prices.json'));
//       prices = prices.prices;
//     }
//     let res;
//     do {
//       const randAsset = prices[Math.floor(Math.random() * prices.length)];
//       const item = await getItem(TF_APP_ID, randAsset.id);
//     } while (!res.type.toLowerCase().includes('hat'));
//     console.log(res);
//     const html = `
//       <html><body><div style="border: 1px solid black; width: 512px; text-align: center">
//       <h1>${res.name}</h1>
//       <img src="${res.icon_url}"</img>
//       <p>Price: $${res.price / 100.0}</p>
//       </div></body></html>
//     `;
//     response.send(html);
//   } catch (e) {
//     console.log(e);
//   }
}