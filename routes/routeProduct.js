const express = require('express')
const routes = express.Router()
const controller = require('../controllers/productController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

routes.post("/",authAdmin, controller.addProduit)
routes.put("/:id",authAdmin, controller.updateProduit)
routes.get("/", controller.getProducts)
routes.get('/:id', controller.getOneProduct)
routes.delete('/:id', authAdmin, controller.deleteProduit)

module.exports = routes