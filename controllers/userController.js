require('dotenv').config();
const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwt.utils");
const models = require("../models");
const { Op } = require('sequelize');
const crypto = require('crypto');
const Joi = require('joi');
const messages = require("../utils/messages");
const { v1: uuidv1 } = require('uuid');
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const errorMessages = messages[0];
const successMessages = messages[1];
const envoyer = require('../utils/sendMail');
const User = models.User;
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const min = 100000;
const max = 999999;

const profileMulter = require('../middlewares/profileMulter')


exports.inscription = async (req, res) => {
    try {
        const { email, prenom, nom, sexe, date_naissance, password, rue, ville, region, telephone } = req.body;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: true, message: errorMessages.invalidEmail });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ email }, { telephone }]
            }
        });

        if (user) {
            if (user.email === email) {
                return res.status(200).json({ error: true, message: errorMessages.emailInUse });
            } else {
                return res.status(200).json({ error: true, message: errorMessages.phoneInUse });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        await User.create({
            id: uuidv1(),
            email,
            prenom,
            nom,
            sexe,
            date_naissance,
            password: hashedPassword,
            rue,
            ville,
            region,
            telephone,
            isAdmin: false
        });

        return res.status(200).json({ error: false, message: "Inscription effectuée avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: errorMessages.unableToAdd });
    }
};

exports.login = async (req, res) => {
    const { email, password, telephone } = req.body;

    try {
        let user;

        if (email) {
            user = await User.findOne({
                where: { email }
            });
        } else if (telephone) {
            user = await User.findOne({
                where: { telephone }
            });
        }

        if (!user) {
            return res.status(404).json({ error: true, message: errorMessages.passwordOrEmailIncorrect });
        }

        const passwordVerif = await bcrypt.compare(password, user.password);

        if (!passwordVerif) {
            return res.status(403).json({ error: true, message: errorMessages.passwordIncorrect });
        }

        return res.status(200).json({
            userId: user.id,
            email: user.email,
            token: jwtUtils.generateTokenForUser(user)
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: errorMessages.connectionError });
    }
};

exports.getOneUser = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    const user = await User.findByPk(userId, {
        attributes: {
            exclude: ["password"],
        }
    });
    if (user) {
        return res.status(200).json(user);
    } else {
        return res.status(401).json({ error: false, message: "User non trouvé" });
    }
};

exports.modifierPassword = async (req, res) => {
    try {
        const donnees = req.body;
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        const user = await User.findByPk(userId);
        if (!user || user.id !== userId) {
            return res.status(404).json({ error: true, message: errorMessages.userNotFound });
        }

        const isPasswordCorrect = await bcrypt.compare(donnees.ancien, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: true, message: errorMessages.incorrectPassword });
        }

        const hashedPassword = await bcrypt.hash(donnees.password, 8);
        await User.update({ password: hashedPassword }, { where: { id: userId } });

        return res.status(200).json({ error: false, message: successMessages.successUpdatePassword });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: errorMessages.errorPasswordUpdate });
    }
};

exports.updateUser = async (req, res) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    try {
        const user = await User.findByPk(userId);

        user.prenom = req.body.prenom ? req.body.prenom : user.prenom;
        user.nom = req.body.nom;
        user.email = req.body.email;
        user.sexe = req.body.sexe;
        user.telephone = req.body.telephone;
        user.date_naissance = req.body.date_naissance;
        user.rue = req.body.rue;
        user.ville = req.body.ville;
        user.region = req.body.region;

        const updatedUser = await user.save();

        if (updatedUser) {
            return res.status(200).json({ error: false, message: successMessages.successUpdate });
        } else {
            return res.status(500).json({ error: true, message: errorMessages.errorUserUpdate });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: errorMessages.errorUserUpdate });
    }
};

exports.passwordOublié = async (req, res) => {
    try {
        const { email, telephone } = req.body;
        let user;
        if (email) {
            user = await User.findOne({
                where: {
                    email: email,
                },
            });
        } else if (telephone) {
            user = await User.findOne({
                where: {
                    telephone: telephone.trim(),
                },
            });
        } else {
            return res.status(400).json({ error: true, message: 'Veuillez fournir une adresse e-mail ou un numéro de téléphone' });
        }

        if (!user) {
            return res.status(404).json({ error: true, message: 'Cet utilisateur n\'existe pas' });
        }

        // const code = crypto.randomBytes(4).toString('hex');
        const code = Math.floor(Math.random() * (max - min + 1)) + min;
        const expiration = Date.now() + 15 * 60 * 1000;

        codesDeReinitialisation[user.id] = {
            code: code,
            expiration: expiration,
        };

        const message = `<p>Bonjour ${user.prenom} ${user.nom}, </p>
        <p>Votre code de réinitialisation de mot de passe : <b>${code}</b></p>
        <p>Cordialement,</p> `;

        if (email) {
            await envoyer.sendMail(user.email, '[Mot de passe] Code de réinitialisation', message);
        } else if (telephone) {
            await client.messages.create({
                body: `SAQ S U N U G A L \nVotre code de réinitialisation de mot de passe : ${code}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: telephone,
                timeout: 60000,
            });
        }

        return res.status(200).json({ error: false, message: 'Un code de réinitialisation a été envoyé' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erreur au niveau du serveur' });
    }
};

exports.verifierCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res.status(404).json({ error: true, message: 'Utilisateur non trouvé' });
        }

        const storedCode = codesDeReinitialisation[user.id];

        if (!storedCode || storedCode.code !== code) {
            return res.status(404).json({ error: true, message: 'Code de réinitialisation incorrect' });
        }

        const now = Date.now();

        if (now > storedCode.expiration) {
            return res.status(401).json({ error: true, message: 'Code de réinitialisation expiré' });
        }

        return res.status(200).json({ error: false, message: 'Code de réinitialisation valide' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erreur au niveau du serveur' });
    }
};

exports.allUser = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(201).json(users);
    } catch (err) {
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};

exports.addProfile = async (req, res) => {
    const userId = jwtUtils.getUserId(req.headers["authorization"]);

    try {
        const user = await User.findByPk(userId);

        profileMulter(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: true, message: 'Erreur lors du téléchargement de l\'image.' });
            }

            user.image = req.file ? `${req.protocol}://${req.get('host')}/images/profile/${req.file.filename}` : null;

            try {
                await user.save();
                return res.status(200).json({ error: false, message: "Profil mis à jour avec succès" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: true, message: "Erreur serveur" });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};
