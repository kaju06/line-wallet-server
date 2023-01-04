const Account = require("../models/account");

var Client = require("dwolla-v2").Client;

var dwolla = new Client({
  key: "YR4CLzaaZSy111ATbpvp2ZcPGZiwj0gQGzU0PyCMElHOT0BHCF",
  secret: "EvV1WyTbejW95PULKTz4Qsc8gdjrVlEwd4n6sLI7JUKEkx4uSm",
  environment: "sandbox",
});

const createDwollaCustomer = async (requestBody) => {
  const res = await dwolla.post("customers", requestBody);
  return res.headers.get("location");
};

const createFundingSource = async (customerUrl, requestBody) => {
  console.log(customerUrl, requestBody);
  const res = await dwolla.post(`${customerUrl}/funding-sources`, requestBody);
  return res.headers.get("location");
};

const getWalletBalance = async (userId) => {
  const account = await Account.findOne({ user_id: userId });
  console.log({ link: account.dwolla_link });
  const res = await dwolla.get(`${account.dwolla_link}/balance`);
  console.log(res.body.balance);
  return res.body.balance.value;
};

const getFundings = async (link) => {
  const res = await dwolla.get(`${link}/funding-sources`);
  console.log(JSON.stringify(res.body._embedded["funding-sources"]));
  return res.body._embedded["funding-sources"];
};

module.exports = {
  createDwollaCustomer,
  createFundingSource,
  getWalletBalance,
  getFundings,
};
