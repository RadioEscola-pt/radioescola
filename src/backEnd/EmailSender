require('dotenv').config(); // Load environment variables from .env file
const nodemailer = require('nodemailer');

// Specify the path to the .env file
const envPath = path.resolve(__dirname, '..', 'password.env');

// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(to, subject, text, html) {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // HTML body content
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = EmailSender;
