const express = require('express')
const bodyParser = require('body-parser')
const authRoute = require('./app/controllers/authController')
const projectRoute = require('./app/controllers/projectController')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/auth', authRoute)
app.use('/projects', projectRoute)

app.listen(3000, () => console.log('> servindo na porta 3000'))