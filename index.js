// const http = require('http')
require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const { trusted } = require('mongoose')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())


morgan.token('post', function (req, res) {
  if (req.method === 'POST' && res.statusCode < 400) {
    return JSON.stringify(req.body)
  }
  // can also check if error code is 400, return the error/json
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))

  // const id = Number(request.params.id)
  // persons = persons.filter(person => person.id !== id)

  // response.status(204).end()
})

// add the new person and return the json object created
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // uses json parser
  // console.log(body)
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // in the front end, we already check for dups
  // but if we use POSTMAN, it does not go through the front end
  // this denies if there is a POST and name already exists
  Person.find({}).then(persons => {
    let res = false
    persons.forEach((person) => {
      // console.log(person)
      if (person.name === body.name) {
        res = true
      }
    })
    if (res === false) {
      const person = new Person({
        name: body.name,
        number: body.number
      })

      person.save().then(savedPerson => {
        // only return json as response once the person is saved into db
        response.json(savedPerson)
      }).catch((error) => {
        next(error)
      })
    }
    else {
      console.log('dup name')
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
  }).catch((error) => {
    next(error)
  })


})

app.get('/api/persons', (request, response, next) => {
  // we configure the personSchema in person.js
  // to return from Person model the object we want (without _id and _v)
  // to here
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch((error) => {
    next(error)
  })
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person,
    { new: true, runValidators: true, context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {

  Person.find({}).then(persons => {
    let responseString = `<p>Phonebook has info for ${persons.length} people </p>`
        + `<p>${new Date()}</p>`
    response.send(responseString)
  }).catch((error) => {
    next(error)
  })
})

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)


// to catch non existent routes, have to be after all routes
// but be before the error handler
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)



const errorHandler = (error, request, response, next) => {
  //console.error(error.message)
  console.log(error.name)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    //console.log('val error')
    return response.status(400).json({ errorMessage: error.message, errorName: error.name })
  }
  // goes to default express error handler
  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)
