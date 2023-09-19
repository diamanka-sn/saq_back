const express = require('express')
const routes = express.Router()
const controller = require('../controllers/orderController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')


module.exports = routes