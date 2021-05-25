
const User = `
  type User {
    id: ID!
    email: String!
    username: String!
    password: String
  }
  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }
  type Mutation {
    singup(email: String!, username: String!, password: String!): String!,
    login(email: String, username: String, password: String!): String!,
    deleteUser(id: ID!): String
  }`

module.exports = User