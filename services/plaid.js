const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const Account = require("../models/account");
const {
  createDwollaCustomer,
  createFundingSource,
  getFundings,
} = require("./dwolla");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "63b4334a8cf12300128e2f26",
      "PLAID-SECRET": "9aeea48658931c7ac7344a21da9c92",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const linkTokenCreate = async (userId) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "Plaid Test App",
      products: ["auth", "transactions"],
      country_codes: ["US"],
      language: "en",
    });
    console.log(response.data.link_token);
    return response.data.link_token;
  } catch (e) {
    console.log("Error while getting link token.", e.response.data);
    throw e;
  }
};
const publicTokenExchange = async (public_token) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const access_token = response.data.access_token;
    return access_token;
  } catch (e) {
    console.log("Error while getting link token.", e);
    throw e;
  }
};
const getProcessorToken = async (req) => {
  const requestBody = {
    ...req,
    processor: "dwolla",
  };

  try {
    const processorTokenResponse = await plaidClient.processorTokenCreate(
      requestBody
    );
    const processorToken = processorTokenResponse.data.processor_token;
    return processorToken;
  } catch (e) {
    console.log("Error while getting link token.", e);
    throw e;
  }
};
const getIdentity = async (accessToken) => {
  const request = {
    access_token: accessToken,
  };
  try {
    const response = await plaidClient.identityGet(request);
    console.log({ response });
    const identities = response.data.accounts.flatMap(
      (account) => account.owners
    );
    console.log({ identities });
    return identities;
  } catch (error) {
    console.log("Error while fetching identity.", e);
    throw e;
  }
};
const connectDwolla = async (userId, accessToken, identities) => {
  try {
    const { addresses, names, emails } = identities[0];
    const requestBody = {
      firstName: names[0],
      lastName: names[0],
      email: emails[0].data,
      type: "personal",
      address1: addresses[0].data.street,
      city: addresses[0].data.city,
      state: "CA",
      postalCode: addresses[0].data.postal_code,
      dateOfBirth: "1970-01-01",
      ssn: "1234",
    };

    console.log({ requestBody });
    const link = await createDwollaCustomer(requestBody);
    const accountInfo = await getAccountInfo(accessToken);

    console.log({ accountInfo });

    const processorToken = await getProcessorToken({
      access_token: accessToken,
      account_id: accountInfo.account_id,
    });

    const requestObj = {
      plaidToken: processorToken,
      name: "Checking",
    };

    const bankLink = await createFundingSource(link, requestObj);

    const fundingSources = await getFundings(link);
    const dwollaLink = fundingSources.filter((i) => i.type === "balance")[0]
      ._links.self.href;

    console.log({ dwollaLink });

    const account = new Account({
      user_id: userId,
      account_id: accountInfo.account_id,
      routing: accountInfo.routing,
      customer_link: link,
      bank_link: bankLink,
      dwolla_link: dwollaLink,
    });

    account.save();

    return { message: "Dwolla account created!", account };
  } catch (e) {
    console.log("Error while connecting to Dwolla.", e.response.data);
    throw e;
  }
};

const getAccountInfo = async (accessToken) => {
  const request = {
    access_token: accessToken,
  };
  try {
    const response = await plaidClient.authGet(request);
    const accountInfo = response.data.numbers.ach;
    return accountInfo[0];
  } catch (error) {
    // handle error
  }
};

module.exports = {
  linkTokenCreate,
  publicTokenExchange,
  getProcessorToken,
  getIdentity,
  connectDwolla,
  getAccountInfo,
};
