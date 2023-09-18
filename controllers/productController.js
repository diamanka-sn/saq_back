require('dotenv').config();
const { v1: uuidv1 } = require('uuid');
const { Product, Categorie, Image } = require("../models");
const jwtUtils = require("../utils/jwt.utils");
const messages = require("../utils/messages");
const errorMessages = messages[0];
const productMulter = require("../middlewares/multer");

const checkUserIsAdmin = async (userId) => {
    const user = await User.findByPk(userId);
    return user && user.isAdmin;
};

exports.addProduit = async (req, res, next) => {
    try {

        const { nom, description, prix, quantite, categorie } = req.body;
        const foundCategory = await Categorie.findOne({ where: { nom: categorie } });

        if (!foundCategory) {
            return res.status(400).json({ error: true, message: "Catégorie non trouvée" });
        }

        const produit = await Product.create({
            id: uuidv1(),
            nom,
            description,
            prix,
            quantite,
            categorieId: foundCategory.id,
        });

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }

            if (req.files && req.files.length > 0) {
                const imageUrls = [];

                for (const file of req.files) {
                    const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
                    imageUrls.push(imageUrl);

                    await Image.create({
                        productId: produit.id,
                        url: imageUrl,
                    });
                }
            }

            return res.status(200).json({ error: false, message: "Produit ajouté avec succès" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const offset = (page - 1) * limit;

        const products = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Categorie,
                    as: 'categorie',
                    attributes: ['nom'],
                },
                {
                    model: Image,
                    attributes: ['url'],
                },
            ],
        });

        return res.status(200).json({ error: false, products });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getOneProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Categorie,
                    as: 'categorie',
                    attributes: ['nom'],
                },
                {
                    model: Image,
                    attributes: ['url'],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ error: true, message: "Produit non trouvé" });
        }

        return res.status(200).json({ error: false, product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.updateProduit = async (req, res, next) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        if (!userId || !(await checkUserIsAdmin(userId))) {
            return res.status(403).json({ error: true, message: errorMessages.userNotAdmin });
        }

        const { nom, description, prix, quantite, categorie } = req.body;
        const foundCategory = await Categorie.findOne({ where: { nom: categorie } });

        if (!foundCategory) {
            return res.status(400).json({ error: true, message: "Catégorie non trouvée" });
        }

        const produit = await Product.findByPk(req.params.id);

        if (!produit) {
            return res.status(404).json({ error: true, message: "Produit non trouvé" });
        }

        produit.nom = nom;
        produit.description = description;
        produit.prix = prix;
        produit.quantite = quantite;
        produit.categorieId = foundCategory.id;

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }

            if (req.files && req.files.length > 0) {
                const imageUrls = [];

                for (const file of req.files) {
                    const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
                    imageUrls.push(imageUrl);

                    await Image.create({
                        productId: produit.id,
                        url: imageUrl,
                    });
                }
            }

            await produit.save();

            return res.status(200).json({ error: false, message: "Produit mis à jour avec succès" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.deleteProduit = async (req, res, next) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        if (!userId || !(await checkUserIsAdmin(userId))) {
            return res.status(403).json({ error: true, message: errorMessages.userNotAdmin });
        }

        const produit = await Product.findByPk(req.params.id);

        if (!produit) {
            return res.status(404).json({ error: true, message: "Produit non trouvé" });
        }

        await Image.destroy({ where: { productId: produit.id } });
        await produit.destroy();

        return res.status(200).json({ error: false, message: "Produit supprimé avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};
