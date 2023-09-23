const express = require('express')
const routes = express.Router()
const controller = require('../controllers/categorieController')

routes.post("/", controller.addCategorie)
routes.get("/", controller.getCategories)
routes.get("/:id", controller.getOneCategory)
routes.put("/:id", controller.updateCategorie)


module.exports = routes
