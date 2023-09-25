const express = require('express')
const routes = express.Router()
const controller = require('../controllers/noteController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

routes.get('/', auth, controller.getAllNotes)
routes.post('/', auth, controller.ajouterNote)
routes.put('/:id', auth, controller.updateNote)
routes.get('/notes', auth, controller.getNoteProduct)

module.exports = routes