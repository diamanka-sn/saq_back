require('dotenv').config();
const { v1: uuidv1 } = require('uuid');
const { Product, Categorie, Note } = require("../models");
const productMulter = require("../middlewares/multer");
const sequelize = require('sequelize');

exports.addProduit = async (req, res) => {
    try {
        const { nom, description, prix, quantite, categorie } = req.body;
        const productFound = await Product.findOne({ where: { nom: nom } })
        if (productFound) {
            console.log(productFound)
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

            const imageUrls = [];

            // if (req.files && req.files.length > 0) {
            //     for (const file of req.files) {
            //         const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
            //         imageUrls.push(imageUrl);
            //     }
            // } else {
            //     console.log("Pas d'image")
            // }

            const newProduct = await Product.create({
                id: uuidv1(),
                nom,
                description,
                prix,
                quantite,
                url: req.fil ? `${req.protocol}://${req.get('host')}/images/products/${file.filename}` : "",
                categorieId: foundCategory.id,
            });

            return res.status(200).json({ error: false, message: "Produit ajouté avec succès", product: newProduct });
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const products = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
            attributes: ['id', 'nom', 'description', 'prix', 'quantite', 'url'],
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
                }
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
            const imageUrls = [];


            if (req.files && req.files.length > 0) {

                for (const file of req.files) {
                    const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
                    imageUrls.push(imageUrl);
                }
            } else {
                console.log("Pas d'image")
            }
            produit.nom = nom;
            produit.description = description;
            produit.prix = prix;
            produit.quantite = quantite;
            produit.categorieId = foundCategory.id;
            produit.url = imageUrls

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

        await Note.destroy({
            where: {
                productId: produit.id
            },
            transaction: t
        });

       
        await produit.destroy({ transaction: t });

        await t.commit(); 

        return res.status(200).json({ error: false, message: "Produit et notes associées supprimés avec succès" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};