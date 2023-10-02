const express = require('express')
const routes = express.Router()
const controller = require('../controllers/userController')
const authAdmin = require('../middlewares/authAdmin')
const auth = require('../middlewares/auth')

/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User
 *     summary: Inscription d'un nouvel utilisateur.
 *     description: Inscrivez un nouvel utilisateur avec les détails fournis.
 *     parameters:
 *       - in: body
 *         name: user
 *         description: Les détails de l'utilisateur à inscrire.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: L'adresse e-mail de l'utilisateur.
 *             prenom:
 *               type: string
 *               description: Le prénom de l'utilisateur.
 *             nom:
 *               type: string
 *               description: Le nom de l'utilisateur.
 *             sexe:
 *               type: string
 *               enum: [Homme, Femme]
 *               description: Le sexe de l'utilisateur.
 *             date_naissance:
 *               type: string
 *               format: date
 *               description: La date de naissance de l'utilisateur.
 *             password:
 *               type: string
 *               description: Le mot de passe de l'utilisateur.
 *             rue:
 *               type: string
 *               description: La rue de l'utilisateur.
 *             ville:
 *               type: string
 *               description: La ville de l'utilisateur.
 *             region:
 *               type: string
 *               description: La région de l'utilisateur.
 *             telephone:
 *               type: string
 *               description: Le numéro de téléphone de l'utilisateur.
 *     responses:
 *       200:
 *         description: Inscription réussie.
 *       400:
 *         description: Données d'inscription invalides.
 *       500:
 *         description: Erreur serveur.
 */
routes.post("/", controller.inscription)
/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - User
 *     summary: Récupérer un utilisateur authentifié.
 *     description: Récupère les détails d'un utilisateur authentifié.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Récupération réussie.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */
routes.get("/", auth, controller.getOneUser)
/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Authentification de l'utilisateur.
 *     description: Authentifie un utilisateur en vérifiant les informations de connexion.
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: Les informations de connexion de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: L'adresse e-mail de l'utilisateur.
 *             password:
 *               type: string
 *               description: Le mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Authentification réussie.
 *       401:
 *         description: Informations de connexion incorrectes.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/login', controller.login);
/**
 * @swagger
 * /user/update/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Mettre à jour les informations de l'utilisateur.
 *     description: Met à jour les informations de l'utilisateur avec l'ID spécifié.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: L'ID de l'utilisateur à mettre à jour.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: updatedUser
 *         description: Les nouvelles informations de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: La nouvelle adresse e-mail de l'utilisateur.
 *             prenom:
 *               type: string
 *               description: Le nouveau prénom de l'utilisateur.
 *             nom:
 *               type: string
 *               description: Le nouveau nom de l'utilisateur.
 *             date_naissance:
 *               type: string
 *               format: date
 *               description: La nouvelle date de naissance de l'utilisateur.
 *             password:
 *               type: string
 *               description: Le nouveau mot de passe de l'utilisateur (optionnel).
 *             rue:
 *               type: string
 *               description: La nouvelle rue de l'utilisateur.
 *             ville:
 *               type: string
 *               description: La nouvelle ville de l'utilisateur.
 *             region:
 *               type: string
 *               description: La nouvelle région de l'utilisateur.
 *             telephone:
 *               type: string
 *               description: Le nouveau numéro de téléphone de l'utilisateur.
 *     responses:
 *       200:
 *         description: Mise à jour réussie.
 *       400:
 *         description: Données de mise à jour invalides.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */
routes.put('/update/:id', controller.updateUser)
/**
 * @swagger
 * /user/update:
 *   post:
 *     tags:
 *       - User
 *     summary: Modifier le mot de passe de l'utilisateur.
 *     description: Modifie le mot de passe de l'utilisateur actuellement authentifié.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: newPassword
 *         description: Le nouveau mot de passe de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             newPassword:
 *               type: string
 *               description: Le nouveau mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès.
 *       400:
 *         description: Données de modification de mot de passe invalides.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/update', auth, controller.modifierPassword)
/**
 * @swagger
 * /user/code:
 *   post:
 *     tags:
 *       - User
 *     summary: Demande de réinitialisation du mot de passe.
 *     description: Envoie un code de réinitialisation du mot de passe à l'adresse e-mail ou au numéro de téléphone de l'utilisateur.
 *     parameters:
 *       - in: body
 *         name: requestInfo
 *         description: Les informations pour demander le code de réinitialisation.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: L'adresse e-mail de l'utilisateur (optionnelle).
 *             telephone:
 *               type: string
 *               description: Le numéro de téléphone de l'utilisateur (optionnel).
 *     responses:
 *       200:
 *         description: Code de réinitialisation du mot de passe envoyé avec succès.
 *       400:
 *         description: Données de demande de code de réinitialisation de mot de passe invalides.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/code', controller.passwordOublié)
/**
 * @swagger
 * /user/verify:
 *   post:
 *     tags:
 *       - User
 *     summary: Vérification du code de réinitialisation du mot de passe.
 *     description: Vérifie le code de réinitialisation du mot de passe envoyé par l'utilisateur.
 *     parameters:
 *       - in: body
 *         name: verificationInfo
 *         description: Les informations pour vérifier le code de réinitialisation.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: L'ID de l'utilisateur.
 *             code:
 *               type: string
 *               description: Le code de réinitialisation reçu par l'utilisateur.
 *     responses:
 *       200:
 *         description: Code de réinitialisation validé avec succès.
 *       400:
 *         description: Données de vérification de code de réinitialisation invalides.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/verify', controller.verifierCode);
/**
 * @swagger
 * /user/reset:
 *   post:
 *     tags:
 *       - User
 *     summary: Réinitialisation du mot de passe.
 *     description: Réinitialise le mot de passe de l'utilisateur après avoir vérifié le code de réinitialisation.
 *     parameters:
 *       - in: body
 *         name: resetInfo
 *         description: Les informations pour réinitialiser le mot de passe.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: L'ID de l'utilisateur.
 *             code:
 *               type: string
 *               description: Le code de réinitialisation vérifié.
 *             newPassword:
 *               type: string
 *               description: Le nouveau mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès.
 *       400:
 *         description: Données de réinitialisation de mot de passe invalides.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/reset', controller.resetPassword);
/**
 * @swagger
 * /user/allUsers:
 *   get:
 *     tags:
 *        - User
 *     summary: Récupérer la liste de tous les utilisateurs.
 *     description: Récupère la liste de tous les utilisateurs enregistrés dans le système (nécessite une authentification admin).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *       401:
 *         description: Non autorisé (authentification admin requise).
 *       500:
 *         description: Erreur serveur.
 */
routes.get('/allUsers', authAdmin, controller.allUser)
/**
 * @swagger
 * /user/profil:
 *   post:
 *     tags:
 *        - User
 *     summary: Ajouter une photo de profil à l'utilisateur.
 *     description: Ajoute une photo de profil à l'utilisateur actuellement authentifié.
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: imgae
 *         type: file
 *         description: La photo de profil à ajouter.
 *         required: true
 *     responses:
 *       200:
 *         description: Photo de profil ajoutée avec succès.
 *       400:
 *         description: Données de photo de profil invalides.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */
routes.post('/profil', auth, controller.addProfile);


module.exports = routes