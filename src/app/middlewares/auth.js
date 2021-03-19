const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next) => {
    
    const emitirErro = error => res.status(401).send({ error })

    const authHeader = req.headers.authorization
    if (!authHeader) return emitirErro('token não definido.')
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2) return emitirErro('token erro.')

    const [schema, token] = parts
    if (!/^Bearer$/i.test(schema)) return emitirErro('token mal formatado.')

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return emitirErro('token invalido.')
        
        req.userId = decoded.id
        return next()
    })
}