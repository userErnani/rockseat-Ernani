const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')

const Project = require('../models/project')
const Task = require('../models/task')


router.use(authMiddleware)


router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks'])
        return res.send({ projects })
    } catch (error) {
        res.status(400).send({ error: 'erro ao carregar projetos.' })
    }
})


router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks'])
        return res.send({ project })
    } catch (error) {
        res.status(400).send({ error: 'erro ao carregar projeto.' })
    }
})


router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body

        // cadastrando e recuperando projeto da coleção
        const project = await Project.create({ title, description, user: req.userId })

        // criando tasks
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })

            // cadastrando na coleção de tasks 
            await projectTask.save()

            // inserindo no array do projeto
            project.tasks.push(projectTask)
        }))

        // atualizando o projeto com o array de tasks
        await project.save()

        return res.send({ project })
    } catch (error) {

        res.status(400).send({ error: 'erro ao criar o projeto.' })
    }
})


router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body
        console.log(req.params.projectId)

        // alterando e recuperando projeto da coleção
        const project = await Project.findByIdAndUpdate(req.params.projectId, {
            title, description
        }, { new: true })

        // removendo tasks andes de re-cadastrar
        project.tasks = []
        await Task.remove({ project: project._id })

        // criando tasks
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })

            // cadastrando na coleção de tasks 
            await projectTask.save()

            // inserindo no array do projeto
            project.tasks.push(projectTask)
        }))

        // atualizando o projeto com o array de tasks
        await project.save()

        return res.send({ project })
    } catch (error) {
        console.log(error)
        res.status(400).send({ error: 'erro ao atualizar o projeto.' })
    }
})


router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId)
        return res.send({ mensagem: 'deletado' })
    } catch (error) {
        res.status(400).send({ error: 'erro ao deletar projeto.' })
    }
})

module.exports = router