const https = require("https");
const fs = require("fs");

const process = (data) => {
  return data
    .filter(
      (d) => d.platforms.ethereum !== undefined && d.platforms.ethereum !== ""
    )
    .reduce((result, curr) => {
      const { id, name } = curr;
      result[curr.platforms.ethereum] = {
        id,
        name,
      };
      return result;
    }, {});
};


//https://api.coingecko.com/api/v3/coins/list?include_platform=true

const data = require("../src/repos/tokenAddressMapping.json")
const processedData = process(data);
const filepath = "../src/repos/tokenAddressMapping1.json";

fs.writeFileSync(filepath, JSON.stringify(processedData, 2, 2));