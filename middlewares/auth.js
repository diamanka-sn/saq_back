const jwtUtils = require('../utils/jwt.utils');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(401).json({ error: true, message: "Utilisateur non authentifié" });
        }

        const user = await User.findByPk(userId);

        if (!user || user.id !== userId) {
            return res.status(403).json({ error: true, message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Erreur serveur" });
    }
};
