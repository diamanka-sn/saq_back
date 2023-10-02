const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMail = async (destinataire, objet, messages) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const message = {
            from: process.env.GMAIL_USERNAME,
            to: destinataire,
            subject: objet,
            html: messages
        };

        const info = await transporter.sendMail(message);

        console.log('Mail envoyé :', info);

        return { error: false, message: 'Mail envoyé avec succès' };
    } catch (error) {
        return { error: true, message: 'Erreur lors de l\'envoi du mail' };
    }
}
