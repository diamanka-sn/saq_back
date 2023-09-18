const { v1: uuidv1 } = require('uuid');
const { Product, Categorie } = require("../models");


exports.addCategorie = async (req, res) => {
    try {
       
        const { nom, description } = req.body;

        const existingCategory = await Categorie.findOne({ where: { nom } });

        if (existingCategory)
            return res.status(400).json({ error: true, message: "La catégorie existe déjà" });

        await Categorie.create({ id: uuidv1(), nom, description });

        return res.status(200).json({ error: false, message: "Catégorie ajoutée avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.updateCategorie = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const categorie = await Categorie.findByPk(categoryId);

        if (!categorie)
            return res.status(404).json({ error: true, message: "Catégorie non trouvée" });

        const existingCategory = await Categorie.findOne({ where: { nom: req.body.nom } });

        if (existingCategory && existingCategory.id !== categorie.id)
            return res.status(400).json({ error: true, message: "Une autre catégorie avec ce nom existe déjà" });

        categorie.nom = req.body.nom;
        categorie.description = req.body.description;

        await categorie.save();

        return res.status(200).json({ error: false, message: "Catégorie modifiée avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
};

exports.getOneCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await Categorie.findByPk(categoryId, {
            include: {
                model: Product,
                as: 'products',
            },
        });

        if (!category)
            return res.status(404).json({ error: true, message: "Catégorie non trouvée" });

        return res.status(200).json({ error: false, category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Categorie.findAll({
            include: {
                model: Product,
                as: 'products',
            },
        });

        return res.status(200).json({ error: false, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
};
