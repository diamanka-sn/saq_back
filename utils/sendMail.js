const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMail= async (destinataire, objet, messages) =>{
    const transporter = await  nodemailer.createTransport({
        service: 'gmail ',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            username: 'Sàq S U N U G A L',
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    const message = await {
        from:  process.env.GMAIL_USERNAME,
        to: destinataire,
        subject: objet,
        html: messages
    };

   await transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi du mail :', error);
        } else {
            console.log('Mail envoyé :', info);
        }
    })
}

