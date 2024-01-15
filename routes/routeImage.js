const express = require('express')
const routes = express.Router()
const controller = require('../controllers/imageController')
const authAdmin = require('../middlewares/authAdmin')

routes.post("/:id", authAdmin, controller.addImageProduct)
routes.put("/:id", authAdmin, controller.updateImageProduct)
routes.delete("/:productId/images/:imageId", authAdmin, controller.deleteImageProduct)

module.exports = routes