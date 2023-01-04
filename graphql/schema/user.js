const User = `
scalar JSONObject
  type User {
    id: ID!
    email: String!
    name: String!
    phone: String!
  }
  type Token {
    message: String!,
    jwt: ID!
  }
  type ExchangeRes {
    message: String!,
    account: JSONObject!
  }
  type Balance {
    balance: Int!
  }
  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    createDwollaAccount: String!
    getAccountInfo(token: String!): JSONObject!
    getWalletBalance(userId: String!): JSONObject! 
    getTransactions(userId: String!): JSONObject!
  }
  type Mutation {
    signup(email: String!, name: String!, phone: String!): JSONObject,
    verifyOtp(email: String!, otp: String!): JSONObject,
    linkBank(userId: String!): JSONObject
    exchangeToken(userId: String!, token: String!): JSONObject
    getIdentity(token: String!): JSONObject
    deposit(userId: String!, amount: String!): String!
    withdraw(userId: String!, amount: String!): String!
    createLabel(userId: String!, amount: String!): JSONObject
  }`;

module.exports = User;
