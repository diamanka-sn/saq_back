const { v1: uuidv1 } = require('uuid');
const { Product, User, Note, Order } = require("../models");


exports.ajouterNote = async (req, res, next) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);
    Order.findOne({
        where: {
            productId: req.params.id,
            userId: userId
        }
    }).then(async () => {
        await Note.create({
            id: uuidv1(),
            ...req.body,
            userId: userId,
            productId: req.params.id
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ error: true, message: "Erreur serveur!" })
    })

}

exports.updateNote = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    const note = Note.findByPk(req.params.noteId)

    if (note && note.userId === userId && note.productId === req.params.productId) {

        note.avis = req.body.avis ? req.body.avis : note.avis
        note.note = req.body.note ? req.body.note : note.note

        await note.save()
    } else {
        console.log("Vous n'etes pas autorisée à modifier cette note")
    }
}

exports.getAllnote = async (req, res) => {
  //admin recuperer toutes les notes sur les produits
}

exports.deleteNote = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    const note = Note.findByPk(req.params.noteId)

    if (note && note.userId === userId && note.productId === req.params.productId) {
        await note.destroy()
        return res.status(200).json({ error: false, message: "Note supprimée avec succès" });
    } else {
        console.log("Vous n'etes pas autorisé à supprimer cette note.")
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