const { v1: uuidv1 } = require('uuid');
const { Product, User, Note, Order } = require("../models");


exports.ajouterNote = async (req, res, next) => {
    try {
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        const order = await Order.findOne({
            where: {
                productId: req.params.id,
                userId: userId
            }
        });

        if (!order) {
            return res.status(404).json({ error: true, message: "Commande introuvable ou non autorisée." });
        }

        await sequelize.transaction(async (t) => {
            await Note.create({
                id: uuidv1(),
                ...req.body,
                userId: userId,
                productId: req.params.id
            }, { transaction: t });
        });

        return res.status(201).json({ success: true, message: "Note ajoutée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
}


exports.updateNote = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    try {
        await sequelize.transaction(async (t) => {
            const note = await Note.findByPk(req.params.noteId);

            if (note && note.userId === userId && note.productId === req.params.productId) {
                note.note = req.body.note ? req.body.note : note.note;
                note.avis = req.body.avis ? req.body.avis : note.avis;

                await note.save({ transaction: t });
                return res.status(200).json({ success: true, message: "Note mise à jour avec succès." });
            } else {
                return res.status(403).json({ error: true, message: "Vous n'êtes pas autorisé à modifier cette note." });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
}


exports.getAllNotes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const notes = await Note.findAndCountAll({
            limit: limit,
            offset: offset,
        });

        return res.status(200).json({ error: false, notes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
};

exports.deleteNote = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    try {
        await sequelize.transaction(async (t) => {
            const note = await Note.findByPk(req.params.noteId);

            if (!note) {
                return res.status(404).json({ error: true, message: "Note introuvable." });
            }

            if (note.userId !== userId || note.productId !== req.params.productId) {
                return res.status(403).json({ error: true, message: "Vous n'êtes pas autorisé à supprimer cette note." });
            }

            await note.destroy({ transaction: t });

            return res.status(200).json({ error: false, message: "Note supprimée avec succès." });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur." });
    }
}


exports.getNoteProduct = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);
    const productId = req.params.productId


}

// Livreur a un compte avec une historique de ces gains et autres informations au besoins un pourcentages est appliques à chaque course du livreur
// Le livreur peut aussi passer ces commandes
// Les livraisons hors de Dakar on implique les transporteur routier(7 places, particulier, ou une personne lambda)
// Les tarifs par zones
// Trois options: Envoyer son livreur, Venir le recuperer ou se faire livrer
// Tables => Livreur(Prenom, nom, adresse, CNI, date_naissance, permis, plaque, cni_recto, cni_verso, assurances), options, tarifs(debut, fin, prix), 