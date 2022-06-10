const mongoose = require('mongoose')

if (process.argv.length < 5) {
  console.log('Please provide the password and name and phonenumber as an argument: node mongo.js <password> <name> <phonenumber>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.6e5vvkl.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)



mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    const newPerson = new Person({
      name: process.argv[3],
      number: process.argv[4]
    })

    return newPerson.save()
  })
  .then(() => {
    console.log('contact saved!')
    console.log('printing all phonebook contacts')
    Person.find({}).then(result => {
      result.forEach(person => {
        console.log(person)
      })
      mongoose.connection.close()
    })
    return
  })
  .catch((err) => console.log(err))