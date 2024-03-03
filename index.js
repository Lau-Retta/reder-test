require('dotenv').config()
const express = require('express')
const app = express()

const Person = require('./models/person')


//---------------Manejo de errores--------------
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


var morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

morgan.token('postData', function(req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :response-time ms - :res[content-length] :postData'))



app.get('/info',(request, response) => {
  let totalPerson =[]
  Person.find({}).then(persons => {
    this.totalPerson = persons
  })
  const currentDate = new Date()
  response.send(`<div> 
    <p>Phonebook has info for ${totalPerson.length} people</p>
    <p>${currentDate}</p> 
    </div>`)

})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(
    person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    }).catch(error => {next(error)})
})

app.delete('/api/persons/:id', (request, response,next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})



app.post('/api/persons', (request, response, next) => {

  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }else if(!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.findOne({ name: person.name }).then(existingPerson => {
    if (existingPerson) {
      existingPerson.number = person.number
      return existingPerson.save()
    } else {
      return person.save().then(savedPerson => {
        response.json(savedPerson)
      }).catch(error => next(error))
    }
  }).then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))



})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

// controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})