var bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");
var models = require("../models");
const { Op } = require('sequelize');
const crypto = require('crypto');
const Joi = require('joi');

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const generercode = () => {
    return crypto.randomBytes(4).toString('hex');
}

const codesDeReinitialisation = {}; 

exports.inscription = async (req, res, next) => {
    try {

        const { email, telephone } = req.body;

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
                return res.status(200).json({ err: true, message: errorMessages.emailInUse, errorEmail: true });
            } else {
                return res.status(200).json({ err: true, message: errorMessages.phoneInUse, errorTelephone: true });
            }
        }

        await models.User.create({

        });

        return res.status(200).json({ err: false, message: "" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: errorMessages.unableToAdd });
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

    if (userId < 0) {
        return res.status(401).json({ error: true, message: errorMessages.userNoAuthentified });
    }

    try {
        const user = await models.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: true, message: errorMessages.userNotFound });
        }

        if (user.id !== userId) {
            return res.status(401).json({ error: true, message: errorMessages.userNotAuthorize });
        }

        const updatedFields = {
            matricule: req.body.matricule,

        };

        await user.update(updatedFields);

        return res.status(200).json({ error: false, message: successMessages.successUpdate });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: errorMessages.errorUserUpdate });
    }
};

exports.passwordOublié = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Cette adresse mail n\'existe pas' });
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
        <p>Cordialement,</p>
        `;

        await envoyer.sendMail(user.email, '[Mot de passe] Code de réinitialisation', message);

        return res.status(200).json({ message: 'Email de réinitialisation du mot de passe est envoyé' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur au niveau du serveur' });
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
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const storedCode = codesDeReinitialisation[user.id];

        if (!storedCode || storedCode.code !== code) {
            return res.status(404).json({ error: 'Code de réinitialisation incorrect' });
        }

        const now = Date.now();

        if (now > storedCode.expiration) {
            return res.status(401).json({ error: 'Code de réinitialisation expiré' });
        }

        return res.status(200).json({ message: 'Code de réinitialisation valide' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur au niveau du serveur' });
    }
};
