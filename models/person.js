const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      minLength: 8,
      validate: {
        validator: function(num) {
          return /\d{2,3}-\d+/.test(num)
        },
        message: 'A valid number has the format: <2 or 3 digits><-><any amount of digits> ex: 23-1000000'

      },
      required: true
    }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // replace _id with id, and change it from object to string type
    // only for front end showing.
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)