process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let Models = require('../models')
let User = Models.User
let AdminToken = Models.AdminToken
const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('User', () => {
	//Delete all rows in table after
	//tests completed
	after((done) => {
		Promise.all[
			User.sync({ force: true }),
			AdminToken.sync({ force: true })
		]
			.then(() => {
				done(null);
			})
			.catch((err) => {
				done(err)
			})
	})

	describe('POST /admin_token', async (done) => {
		try {
			let token
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})

			it('should generate a token if logged in', (done) => {
				let res = await agent.post('/api/v1/admin_token')

				res.should.have.status(200)
				res.body.should.have.property('token')

				token = res.body.token

				done()
			})

			it('should generate a different token if logged in', (done) => {
				let res = await agent.post('/api/v1/admin_token')

				res.should.have.status(200)
				res.body.should.have.property('token')
				res.body.token.should.not.equal(token)

				done()
			})

			it('should give an error if not logged in', (done) => {
				let res = await chai.request(server).post('/api/v1/admin_token')

				res.should.have.status(403)
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

				done()
			})
		} catch (err) {
			done(err)
		}
	})
})