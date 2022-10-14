const fs = require("fs");

export const readAddressList = () => {
  return JSON.parse(fs.readFileSync("info/address.json", "utf-8"));
};

export const storeAddressList = (addressList: Object) => {
  fs.writeFileSync("info/address.json", JSON.stringify(addressList));
};
