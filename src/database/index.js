const mongoose = require('mongoose')

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect('mongodb://localhost/noderest')

const db = mongoose.connection

db.on('error', error => console.log(error))
db.once('open', () => console.log('* banco carregado !'))

module.exports = mongoose