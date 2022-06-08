// const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
// app.use(morgan('tiny'))
app.use(cors())


morgan.token('post', function (req, res) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    // else {
    //     console.log(req.method)
    // }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



app.get('/api/persons/:id', (request, response) => {
    let id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    // console.log(typeof(person))
    if (person === undefined) {
        console.log('no person found')
        return response.status(404).end()

    } 

    response.json(person)

})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    
    response.status(204).end()
})

const generateId = () => {
    min = 1
    max = Number.MAX_SAFE_INTEGER

    return Math.floor(Math.random() * (max-min) + min)

}

const checkForDuplicateName = (name) => {

    const person = persons.find(person => person.name === name)
    if (person === undefined) {
        return false
    }
    else {
        return true
    }
}
// add the new person and return the json object created
app.post('/api/persons', (request, response) => {
    const body = request.body
    // uses json parser


    // console.log(body)
    if (!body.name || !body.number) {
        return response.status(400).json({ 
          error: 'content missing' 
        })
    }

    if (checkForDuplicateName(body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)

})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    let responseString = `<p>Phonebook has info for ${persons.length} people </p>` 
        + `<p>${new Date()}</p>`
    response.send(responseString)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)


// to catch non existent routes, have to be after all routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
