const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();

module.exports = {
    generateTokenForUser: function (user) {
        return jwt.sign({
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        },
            process.env.JWT_SIGN_SECRET,
            {
                expiresIn: '48h'
            })
    },
    parseAuthorization: function (authorizationHeader) {
        if (authorizationHeader == null) {
            return null;
        }

        const tokenRegex = /Bearer (.+)/;
        const match = authorizationHeader.match(tokenRegex);

        return (match != null) ? match[1] : null;
    },
    getUserId: function (authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token !== null) {
            try {
                var jwtToken = jwt.verify(token, process.env.JWT_SIGN_SECRET);
                if (jwtToken !== null)
                    userId = jwtToken.id;
            } catch (err) {
                return userId
            }
        }
        return userId;
    }
}
