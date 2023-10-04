require('dotenv').config();
const { v1: uuidv1 } = require('uuid');
const { Product, Categorie, Note, Image } = require("../models");
const productMulter = require("../middlewares/productMulter");
const { sequelize } = require('../models')
exports.addProduit = async (req, res) => {
    try {
        const { nom, description, prix, quantite, categorie } = req.body;
        const productFound = await Product.findOne({ where: { nom: nom } })
        if (productFound) {
            return res.status(400).json({ error: true, message: "Produit existe déjà." });
        }
        const foundCategory = await Categorie.findOne({ where: { nom: categorie } });

        if (!foundCategory) {
            return res.status(400).json({ error: true, message: "Catégorie non trouvée" });
        }

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }

            const newProduct = await Product.create({
                id: uuidv1(),
                nom,
                description,
                prix,
                quantite,
                image: req.file ? `${req.protocol}://${req.get('host')}/images/products/${file.filename}` : '',
                categorieId: foundCategory.id,
            });

            return res.status(200).json({ error: false, message: "Produit ajouté avec succès", product: newProduct });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const products = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
            attributes: ['id', 'nom', 'description', 'prix', 'quantite'],
            include: [
                {
                    model: Categorie,
                    attributes: ['nom', 'description'],
                }
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
            attributes: ['id', 'nom', 'description', 'prix', 'quantite'],
            include: [
                {
                    model: Categorie,
                    attributes: ['nom', 'description'],
                },
                {
                    model: Note,
                    attributes: [
                        [sequelize.fn('AVG', sequelize.col('note')), 'note'],
                    ],
                    group: ['productId'],
                },
                {
                    model: Image,
                    attributes: ['url'],
                },
            ]
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

exports.updateProduit = async (req, res) => {
    try {
        const { nom, description, prix, quantite, categorie } = req.body;
        const foundCategory = await Categorie.findOne({ where: { nom: categorie } });

        if (!foundCategory) {
            return res.status(400).json({ error: true, message: "Catégorie non trouvée" });
        }

        const produit = await Product.findByPk(req.params.id);

        if (!produit) {
            return res.status(404).json({ error: true, message: "Produit non trouvé" });
        }

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }
            produit.nom = nom;
            produit.description = description;
            produit.prix = prix;
            produit.quantite = quantite;
            produit.categorieId = foundCategory.id;

            await produit.save();

            return res.status(200).json({ error: false, message: "Produit mis à jour avec succès" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.deleteProduit = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const produit = await Product.findByPk(req.params.id, { transaction: t });

        if (!produit) {
            await t.rollback();
            return res.status(404).json({ error: true, message: "Produit non trouvé" });
        }

        const images = await Image.findAll({
            where: {
                productId: produit.id
            },
            transaction: t
        });

        for (const image of images) {
            await image.destroy({ transaction: t });
        }

        await Note.destroy({
            where: {
                productId: produit.id
            },
            transaction: t
        });

        await produit.destroy({ transaction: t });

        await t.commit();

        return res.status(200).json({ error: false, message: "Produit, images et notes associées supprimés avec succès" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};