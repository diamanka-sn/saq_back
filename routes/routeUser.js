const express = require('express')
const routes = express.Router()
const controller = require('../controllers/userController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

routes.post("/", controller.inscription)
routes.get("/", auth, controller.getOneUser)
routes.post('/login', controller.login)
routes.post('/update/:id', controller.updateUser)
routes.post('/update',auth, controller.modifierPassword)
routes.post('/code', controller.passwordOublié)
routes.post('/verify', controller.verifierCode)
routes.get('/allUsers', authAdmin, controller.allUser)

module.exports = routes