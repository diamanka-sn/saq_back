const express = require('express')
const routes = express.Router()
const controller = require('../controllers/categorieController')

routes.post("/", controller.addCategorie)


module.exports = routes
