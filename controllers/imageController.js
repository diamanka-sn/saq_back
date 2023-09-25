require('dotenv').config();
const { v1: uuidv1 } = require('uuid');
const { Product, Image } = require("../models");
const productMulter = require("../middlewares/multer");

exports.addImageProduct = async (req, res, next) => {
    try {
        const productFound = await Product.findByPk(req.params.id);
        if (!productFound) {
            return res.status(400).json({ error: true, message: "Produit non trouvé." });
        }

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }

            const imageUrls = [];

            for (const file of req.files) {
                const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
                imageUrls.push(imageUrl);

                await Image.create({
                    id: uuidv1(),
                    productId: productFound.id,
                    url: imageUrl,
                });
            }

            return res.status(200).json({ error: false, message: "Images ajoutées avec succès", imageUrls });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.updateImageProduct = async (req, res, next) => {
    try {
        const productId = req.params.id; 

        const productFound = await Product.findByPk(productId);
        if (!productFound) {
            return res.status(404).json({ error: true, message: "Produit non trouvé." });
        }

        productMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement des images.' });
            }

            await Image.destroy({ where: { productId: productId } });

            const imageUrls = [];

            for (const file of req.files) {
                const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${file.filename}`;
                imageUrls.push(imageUrl);

                await Image.create({
                    id: uuidv1(),
                    productId: productId,
                    url: imageUrl,
                });
            }

            return res.status(200).json({ error: false, message: "Images ajoutées ou mises à jour avec succès", imageUrls });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.deleteImageProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId; 
        const imageId = req.params.imageId; 

        const productFound = await Product.findByPk(productId);
        if (!productFound) {
            return res.status(404).json({ error: true, message: "Produit non trouvé." });
        }

        const imageFound = await Image.findByPk(imageId);
        if (!imageFound) {
            return res.status(404).json({ error: true, message: "Image non trouvée." });
        }

        if (imageFound.productId !== productId) {
            return res.status(400).json({ error: true, message: "L'image ne correspond pas au produit spécifié." });
        }

        await imageFound.destroy();

        return res.status(200).json({ error: false, message: "Image supprimée avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};



app.delete("/product/:productId/image/:imageId", deleteImageForProduct);
