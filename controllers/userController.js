var bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");
var models = require("../models");
const { Op } = require('sequelize');
const crypto = require('crypto');
const Joi = require('joi');
const messages = require("../utils/messages");

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const errorMessages = messages[0];
const successMessages = messages[1];
const generercode = () => {
    return crypto.randomBytes(4).toString('hex');
}

const codesDeReinitialisation = {};

exports.inscription = async (req, res, next) => {
    try {
        const {
            email,
            prenom,
            nom,
            sexe,
            date_naissance,
            password,
            rue,
            ville,
            region,
            telephone
        } = req.body;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: true, message: errorMessages.invalidEmail });
        }

        const user = await models.User.findOne({
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

        await models.User.create({
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
            user = await models.User.findOne({
                where: { email }
            });
        } else if (telephone) {
            user = await models.User.findOne({
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

exports.getOneUser = async (req, res, next) => {
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    if (userId == -1) {
        return res.status(401).json({ error: true, messages: "User non authentifier" });
    }
    const user = await models.User.findByPk(userId, {
        attributes: {
            exclude: ["password"],
        }
    });
    if (user) {
        return res.status(200).json(user);
    } else {
        return res.status(401).json({ error: false, message: "User non trouvé" });
    }
}

exports.modifierPassword = async (req, res, next) => {
    try {
        const donnees = req.body;
        const headerAuth = req.headers["authorization"];
        const userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(401).json({ error: true, message: errorMessages.userNoAuthentified });
        }

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: true, message: errorMessages.userNotFound });
        }

        const isPasswordCorrect = await bcrypt.compare(donnees.ancien, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: true, message: errorMessages.incorrectPassword });
        }

        const hashedPassword = await bcrypt.hash(donnees.password, 8);
        await models.User.update({ password: hashedPassword }, { where: { id: userId } });

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

        if (userId < 0) {
            return res.status(401).json({ error: true, message: errorMessages.userNoAuthentified });
        }
        const user = await models.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: true, message: errorMessages.userNotFound });
        }

        if (user.id !== userId) {
            return res.status(401).json({ error: true, message: errorMessages.userNotAuthorize });
        }

        User.prenom = req.body.prenom ? req.body.prenom : User.prenom
        User.nom = req.body.nom
        User.email = req.body.email
        User.sexe = req.body.sexe
        User.telephone = req.body.telephone;
        User.date_naissance = req.body.date_naissance;
        User.rue = req.body.rue;
        User.ville = req.body.ville;
        User.region = req.body.region;

        const updatedUser = await User.save();

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
        const { email, phone } = req.body;

        let user;

        if (email) {
            user = await User.findOne({
                where: {
                    email: email,
                },
            });
        } else if (phone) {
            user = await User.findOne({
                where: {
                    phone: phone,
                },
            });
        } else {
            return res.status(400).json({ error: true, message: 'Veuillez fournir une adresse e-mail ou un numéro de téléphone' });
        }

        if (!user) {
            return res.status(404).json({ error: true, message: 'Cet utilisateur n\'existe pas' });
        }

        const code = genererCode();
        const expiration = Date.now() + 15 * 60 * 1000;

        codesDeReinitialisation[user.id] = {
            code: code,
            expiration: expiration,
        };

        await User.update(
            {
                code: code,
            },
            {
                where: {
                    id: user.id,
                },
            }
        );

        const message = `<p>Bonjour ${user.prenom} ${user.nom}, </p>
        <p>Votre code de réinitialisation de mot de passe : <b>${code}</b></p>
        <p>Cordialement,</p> `;

        if (email) {
            await envoyer.sendMail(user.email, '[Mot de passe] Code de réinitialisation', message);
        } else if (phone) {
            //logique d'envoie de messages 
        }

        return res.status(200).json({ error: false, message: 'Un code de réinitialisation a été envoyé' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, error: 'Erreur au niveau du serveur' });
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
