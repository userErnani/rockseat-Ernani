const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth.json')
const User = require('../models/user')

const emitirErro = (res, error) => res.status(400).send({ error })

const gerarToken = (params = {}) => jwt.sign(params, authConfig.secret, { expiresIn: 86400 })


// --- Rotas

router.post('/register', async (req, res) => {
    try {

        const { email } = req.body

        if (await User.findOne({ email })) return res.status(400).send({ error: 'Email ja cadastrado.' })

        const user = await User.create(req.body)

        user.password = undefined

        return res.send({ user, token: gerarToken({ id: user.id }) })

    } catch (error) {
        emitirErro(res, 'Falha no registro.')
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) return emitirErro(res, 'usuario não encontrado.')

    if (!await bcrypt.compare(password, user.password)) return emitirErro(res, 'senha invalida.')

    user.password = undefined

    res.send({ user, token: gerarToken({ id: user.id }) })
})

router.post('/forgot_password', async (req, res) => {
    try {

        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) return emitirErro(res, 'usuario não encontrado.')

        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date()
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': { passwordResetToken: token, passwordResetExpires: now }
        })

        const estruturaDoEmail = {
            to: email,
            from: 'contatodevsp@gmail.com',
            template: 'auth/forgot_password',
            context: { token }
        }
        mailer.sendMail(estruturaDoEmail, (err, info) => {
            if (err) return emitirErro(res, 'email para recuperar a senha não enviado.')

            return res.send('email enviado')
        })

    } catch (error) {
        emitirErro(res, 'erro ao capturar o email.')
    }
})

router.post('/reset_password', async (req, res) => {
    try {

        const { email, token, password } = req.body

        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')
        if (!user) return emitirErro(res, 'usuario não encontrado.')

        if (token !== user.passwordResetToken) return emitirErro(res, 'token invalido.')

        const now = new Date()
        if(now > user.passwordResetExpires) return emitirErro(res, 'token expirado.')

        user.password = password

        await user.save()

        res.send('senha modificada.')

    } catch (error) {
        emitirErro(res, 'erro ao recuperar a senha.')
    }
})

module.exports = router