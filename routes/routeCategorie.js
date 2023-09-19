const express = require('express')
const routes = express.Router()
const controller = require('../controllers/categorieController')
const authAdmin = require('../middlewares/authAdmin')

routes.post("/",authAdmin, controller.addCategorie)


module.exports = routes
