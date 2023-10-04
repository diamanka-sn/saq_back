const express = require('express')
const routes = express.Router()
const controller = require('../controllers/categorieController')
const authAdmin = require('../middlewares/authAdmin')

routes.post("/", authAdmin, controller.addCategorie)
routes.get("/",controller.getCategories)
routes.get("/:id", authAdmin, controller.getOneCategory)
routes.put("/:id", authAdmin, controller.updateCategorie)


module.exports = routes
