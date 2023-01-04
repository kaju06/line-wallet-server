const Account = require("../models/account");
require('dotenv').config()
var Client = require("dwolla-v2").Client;

var dwolla = new Client({
  key: process.env.DWOLLA_KEY,
  secret: process.env.DWOLLA_SECRET,
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

const deposit = async (userId, amount) => {
  const account = await Account.findOne({ user_id: userId });
  let transferRequest = {
    _links: {
      source: {
        href: `${account.bank_link}`,
      },
      destination: {
        href: `${account.dwolla_link}`,
      },
    },
    amount: {
      currency: "USD",
      value: amount,
    },
  };

  const res = await dwolla.post("transfers", transferRequest);
  console.log(res.headers.get("location"));
  return true;
};

const withdraw = async (userId, amount) => {
  const account = await Account.findOne({ user_id: userId });
  let transferRequest = {
    _links: {
      source: {
        href: `${account.dwolla_link}`,
      },
      destination: {
        href: `${account.bank_link}`,
      },
    },
    amount: {
      currency: "USD",
      value: amount,
    },
  };

  const res = await dwolla.post("transfers", transferRequest);
  console.log(res.headers.get("location"));
  return true;
};

const createLabel = async (userId, amount) => {
  const account = await Account.findOne({ user_id: userId });

  var customerUrl = account.customer_link;
  var requestBody = {
    amount: {
      currency: "USD",
      value: amount,
    },
  };

  const res = await dwolla.post(`${customerUrl}/labels`, requestBody);
  return res.headers.get("location");
};

const getTransactions = async (userId) => {
  const account = await Account.findOne({ user_id: userId });
  const res = await dwolla.get(`${account.customer_link}/transfers`);
  console.log(res.body._embedded["transfers"]);
  return res.body._embedded["transfers"].map((i) => {
    return { id: i.id, amount: i.amount, status: i.status, created: i.created };
  });
};

module.exports = {
  createDwollaCustomer,
  createFundingSource,
  getWalletBalance,
  getFundings,
  deposit,
  withdraw,
  createLabel,
  getTransactions,
};
