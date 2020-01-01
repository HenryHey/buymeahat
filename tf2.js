const axios = require('axios');

const TF_APP_ID = 440;

module.exports = {
  getItems: async (key, currency = 'USD', language = 'en_US') => {
    const baseUrl = 'http://api.steampowered.com/ISteamEconomy/GetAssetPrices/v0001/';
    const url = `${baseUrl}?key=${key}&appId=${TF_APP_ID}&language=${language}&currency=${currency}`;
    try {
      let result = await axios.get(url);
      result = result.data.result;

      if (result.success) {
        result = result.assets
          .filter((asset) => asset.tags.includes('Cosmetics'))
          .map((asset) => asset.class[0].value);
        return result;
      }
      console.log('Error getting asset prices');
      return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  },

  getItem: async (key, ids, language = 'en_US') => {
    const iconCDN = 'http://cdn.steamcommunity.com/economy/image/';
    const baseUrl = 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v0001/';
    // item = await getItem(TF_APP_ID, randAsset);
    let out;
    try {
      do {
        const randAsset = ids[Math.floor(Math.random() * ids.length)];
        const url = `${baseUrl}?key=${key}&appid=${TF_APP_ID}&class_count=1&language=${language}&classid0=${randAsset}`;
        let result = await axios.get(url);
        result = result.data.result[randAsset];
        out = {
          icon_url: iconCDN + result.icon_url,
          name: result.name,
          type: result.type,
        };
        process.stdout.write('.');
      } while (!out.type || !out.type.toLowerCase().includes('hat'));
      return out;
    } catch (e) {
      console.error(e);
      return {};
    }
  },
};
