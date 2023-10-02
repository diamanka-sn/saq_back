require('dotenv').config();
const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwt.utils");
const models = require("../models");
const { Op } = require('sequelize');
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
const codesDeReinitialisation = {}
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
                return res.status(200).json({ error: true, message: errorMessages.emailInUse, errorEmail: true });
            } else {
                return res.status(200).json({ error: true, message: errorMessages.phoneInUse, errorTelephone: true });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const u = await User.create({
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
        const s = {
            userId: u.id,
            email: u.email,
            token: jwtUtils.generateTokenForUser(u)
        }
        return res.status(200).json({ error: false, s });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur inatendu, veuillez reessayer" });
    }
};

exports.login = async (req, res) => {
    const { email, password, telephone } = req.body;
    if (!email && !telephone) {
        return res.status(400).json({ error: true, message: 'L\'e-mail ou le numéro de téléphone est requis' });
    }
    try {
        let user;

        if (telephone) {
            user = await User.findOne({
                where: { telephone }
            });

        } else if (email) {
            user = await User.findOne({
                where: { email }
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
            error: false,
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            telephone: user.telephone,
            prenom: user.prenom,
            nom: user.nom,
            rue: user.rue,
            ville: user.ville,
            region: user.region,
            sexe: user.sexe,
            date_naissance: user.date_naissance,
            image: user.image,
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

        user.prenom = req.body.prenom ? req.body.prenom : user.prenom
        user.nom = req.body.nom ? req.body.nom : user.nom
        user.email = req.body.email ? req.body.email : user.email
        user.sexe = req.body.sexe ? req.body.sexe : user.sexe
        user.telephone = req.body.telephone ? req.body.telephone : user.telephone
        user.date_naissance = req.body.date_naissance ? req.body.date_naissance : user.date_naissance
        user.rue = req.body.rue ? req.body.rue : user.rue
        user.ville = req.body.ville ? req.body.ville : user.ville
        user.region = req.body.region ? req.body.region : user.region

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
                    email: email.trim()
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
        const expiration = Date.now() + 5 * 60 * 1000;

        codesDeReinitialisation[user.id] = {
            code: code,
            expiration: expiration,
        };

        const message = `<p>Bonjour ${user.prenom} ${user.nom}, </p>
        <p>Nous vous informons que votre code de réinitialisation de mot de passe a été généré avec succès :</p>
        <p><strong>${code}</strong></p>
        <p>Ce code est valable pendant 5 minutes à des fins de sécurité.</p>
        <p>En cas de questions ou d'assistance supplémentaire, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.</p>
        <p>Cordialement,</p>
        `;

        if (email) {
            const envoie = await envoyer.sendMail(user.email, '[Mot de passe] Code de réinitialisation', message);
            return res.status(200).json(envoie);

        } else if (telephone) {
            await client.messages.create({
                body: `SAQ S U N U G A L \nVotre code de réinitialisation de mot de passe : ${code}.\nCe code est valable pendant 5 minutes à des fins de sécurité.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: '+221' + telephone,
                timeout: 70000,
            });
            return res.status(200).json({ error: false, message: 'Un code de réinitialisation a été envoyé' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erreur au niveau du serveur' });
    }
};

exports.verifierCode = async (req, res) => {
    try {
        const { email, code, telephone } = req.body;

        let user;

        if (telephone) {
            user = await User.findOne({
                where: { telephone }
            });
        } else if (email) {
            user = await User.findOne({
                where: { email }
            });
        }

        if (!user) {
            return res.status(404).json({ error: true, message: 'Utilisateur non trouvé' });
        }

        const storedCode = codesDeReinitialisation[user.id];

        if (!storedCode || storedCode.code !== code) {
            return res.status(403).json({ error: true, message: 'Code de réinitialisation incorrect' });
        }

        const now = Date.now();

        if (now > storedCode.expiration) {
            return res.status(401).json({ error: true, message: 'Code de réinitialisation expiré' });
        }

        return res.status(200).json({ error: false, user: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erreur au niveau du serveur' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, telephone, nouveau } = req.body;

    try {
        let user;

        if (email) {
            user = await User.findOne({
                where: {
                    email: email.trim()
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

        const hashedPassword = await bcrypt.hash(nouveau.trim(), 8);
        await User.update({ password: hashedPassword }, { where: { id: user.id } });

        return res.status(200).json({ error: false, message: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: 'Une erreur s\'est produite lors de la réinitialisation du mot de passe' });
    }
}

exports.allUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await User.findAll({
            limit: limit,
            offset: offset,
        });

        return res.status(200).json(users);
    } catch (err) {
        console.error(err);
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

exports.supprimerPhoto = async (req, res) => {
    const userId = jwtUtils.getUserId(req.headers["authorization"]);

    try {
        const user = await User.findByPk(userId);

        user.image = null

        await user.save()
        return res.status(200).json({ error: false, message: "Profil supprimer avec succés" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
}