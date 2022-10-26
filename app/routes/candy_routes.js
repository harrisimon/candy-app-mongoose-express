// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

const Candy = require('../models/candy')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const candy = require('../models/candy')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//INDEX
// GET /pets
router.get('/candies', requireToken, (req, res, next) => {
	Candy.find()
		.then(candies => {
			return candies.map(candy => candy)
		})
		.then(candies => {
			res.status(200).json({candies: candies})
		})
		.catch(next)
})

//SHOW
// candies/:id
router.get('/candies/:id', requireToken, (req, res, next) => {
	candy.findById(req.params.id)
		.then(handle404)
		.then(candy => {
			res.status(200).json({ candy: candy })
		})
		.catch(next)
})

// CREATE
// POST /examples
router.post('/candies', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.candy.owner = req.user.id

	Candy.create(req.body.candy)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then((candy) => {
            res.status(201).json({ candy: candy })
        })
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// /candies/:id
router.patch('/candies/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.candy.owner

	Candy.findById(req.params.id)
		.then(handle404)
		.then((candy) => {
			requireOwnership(req, candy)
			return candy.updateOne(req.body.candy)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})



module.exports = router