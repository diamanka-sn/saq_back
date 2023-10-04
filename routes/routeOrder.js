const express = require('express')
const routes = express.Router()
const controller = require('../controllers/orderController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

routes.get("/", auth,controller.getPanier)
routes.get("/historrique",auth, controller.getHistorique)
routes.post("/",auth, controller.ajouterPanier)
routes.post("/:id",auth, controller.validerPanier)
routes.put("/:id",auth, controller.modifierPanier)
routes.post("/noter",auth, controller.noterProduct)
routes.delete("/:id",auth, controller.supprimerPanier)

module.exports = routes