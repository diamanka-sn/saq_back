const express = require('express')
const routes = express.Router()
const controller = require('../controllers/userController')


routes.post("/", controller.inscription)
routes.get("/", controller.getOneUser)
routes.post('/login', controller.login)
routes.post('/update/:id', controller.updateUser)
routes.post('/update', controller.modifierPassword)

module.exports = routes