const { v1: uuidv1 } = require('uuid');
const { Product, Order } = require("../models");
var jwtUtils = require("../utils/jwt.utils");

exports.ajouterPanier = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);
        const productId = req.body.id

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: true, message: "Produit n'est pas disponible." });
        }
        const productInOrder = await Order.findOne({
            where: {
                ProductId: product.id,
                UserId: userId,
                status: false
            }
        });
        let order
        if (productInOrder) {
            order = await productInOrder.update({ quantite: req.body.quantite });
        } else {
            order = await Order.create({
                id: uuidv1(),
                ProductId: req.body.id,
                UserId: userId,
                quantite: req.body.quantite,
                status: false
            });
        }


        return res.status(201).json({ error: false, message: "Produit ajouté au panier avec succès", order: order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getPanier = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const panier = await Order.findAndCountAll({
            where: {
                UserId: userId,
                status: false
            },
            include: [
                {
                    model: Product
                }
            ],
            limit: limit,
            offset: offset
        });

        return res.status(200).json({ error: false, panier });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.modifierPanier = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);
        const productId = req.params.id;

        const commande = await Order.findOne({
            where: {
                UserId: userId,
                ProductId: productId,
                status: false
            }
        });

        if (!commande) {
            return res.status(404).json({ error: true, message: "Commande non trouvée dans le panier." });
        }

        const nouvelleQuantite = req.body.quantite;

        if (nouvelleQuantite >= 0) {
            commande.quantite = nouvelleQuantite;
        }

        await commande.save();

        return res.status(200).json({ error: false, message: "Commande modifiée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.supprimerPanier = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);
        const productId = req.params.id;

        const order = await Order.findOne({
            where: {
                UserId: userId,
                ProductId: productId,
                status: false
            }
        });

        if (!order) {
            return res.status(404).json({ error: true, message: "Produit non trouvé dans le panier." });
        }

        await order.destroy();

        return res.status(200).json({ error: false, message: "Produit supprimé du panier avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getHistorique = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const historiques = await Order.findAndCountAll({
            where: {
                UserId: userId,
                status: true
            },
            include: [
                {
                    model: Product
                }
            ],
            limit: limit,
            offset: offset
        });

        return res.status(200).json({ error: false, historiques: historiques.rows, totalItems: historiques.count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.validerPanier = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        const panier = await Order.findAll({
            where: {
                UserId: userId,
                status: false
            }
        });

        for (const commande of panier) {
            commande.status = true;
            await commande.save();
        }

        return res.status(200).json({ error: false, message: "Panier validé avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.noterProduct = async (req, res) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);
        const productId = req.params.id;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: true, message: "Produit n'est pas disponible." });
        }

        const { note, avis } = req.body;

        const newNote = await Note.create({
            id: uuidv1(),
            userId: userId,
            productId: productId,
            note: note,
            avis: avis,
        });

        return res.status(201).json({ error: false, message: "Produit noté avec succès", note: newNote });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};