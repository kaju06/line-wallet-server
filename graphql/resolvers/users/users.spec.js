const User = require('../../../models/user')
const resolvers = require('./users')
const { setupDB } = require('../test-setup')

setupDB('users')

describe('getUser', () => {
  it('Should save user to database', async done => {
    const newUser = new User({email: 'steeve@wemaintain.com', username: 'steeveo', password: 'plop'})
    await newUser.save()
  
    const fetchedUser = await resolvers.Query.getUser({}, {id: newUser.id})
  
    expect(fetchedUser.id).toBe(newUser.id)
  
    done()
  })
})
