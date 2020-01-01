const fs = require('fs');

module.exports = {
  getItems: async (key, appId, currency = 'USD', language = 'en_US') => {
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
  },

  getItem: async (key, appId, classId, language = 'en_US') => {
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
  }
};