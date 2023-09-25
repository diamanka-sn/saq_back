const express = require('express')
const routes = express.Router()
const controller = require('../controllers/noteController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

routes.get('/', controller.getAllNotes)
routes.post('/', controller.ajouterNote)
routes.put('/:id', controller.updateNote)
routes.get('/notes', controller.getNoteProduct)

module.exports = routes