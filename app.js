require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Retains the original filename
    },
});
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/send-emails', upload.single('attachment'), async (req, res) => {
    const { emails, subject, body } = req.body;
    const attachmentPath = req.file ? req.file.path : null;

    const emailList = emails.split(',').map(email => email.trim());

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    try {
        for (const email of emailList) {
            await transporter.sendMail({
                from: `${process.env.USER_NAME} <${process.env.GMAIL_USER}>`,
                to: email,
                subject,
                text: body,
                attachments: attachmentPath
                    ? [
                          {
                              filename: path.basename(attachmentPath), // Extract only the filename
                              path: attachmentPath, // File path for the attachment
                          },
                      ]
                    : [],
            });
            console.log(`Email sent to: ${email}`);
        }

        if (attachmentPath) fs.unlinkSync(attachmentPath);

        res.send('Emails sent successfully!');
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).send('Error sending emails.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
