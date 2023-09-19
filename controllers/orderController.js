const { v1: uuidv1 } = require('uuid');
const { Product, Order } = require("../models");


exports.ajouterPanier = async (req, res, next) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);
    const productId = req.params.id

    const product = await Product.findByPk(productId)
    if (!product) {
        return res.status(403).json({ error: true, message: "Produit n'est pas disponible." })
    }

    await Order.create({
        id: uuidv1(),
        productId: productId,
        userId: userId,
        ...req.body
    })
}

exports.modifierPanier = async (req, res, next) => {

}

exports.supprimerPanier = async (req, res, next) => {

}

exports.getHistorique = async (req, res, next) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);
    const historiques = await Order.findAndCountAll({
        limit: limit,
        offset: offset,
        include: [
            {
                model: Product,
            }, {
                user
            }
        ],
    });
}

exports.validerPanier = async (req, res, next) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    
}

exports.noterProduct = async (req, res, next) => {

}