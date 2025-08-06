require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const session = require('express-session');

const app = express();
const port = 2000;
let counter = 0;

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set true if using HTTPS
}));

// Middleware to check if logged in
function authMiddleware(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Multer setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Routes
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login" style="max-width:400px;margin:50px auto;font-family:sans-serif;">
            <h2>Admin Login</h2>
            <input type="password" name="password" placeholder="Enter Password" required style="width:100%;padding:10px;margin-bottom:10px;"/>
            <button type="submit" style="padding:10px 20px;">Login</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.SECRET) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.send('Invalid password. <a href="/login">Try again</a>');
    }
});

app.get('/', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/send-emails', authMiddleware, upload.fields([{ name: 'file' }, { name: 'attachment' }]), async (req, res) => {
    const { subject,body } = req.body;
    const excelFilePath = req.files['file'] ? req.files['file'][0].path : null;
    const attachmentFilePath = req.files['attachment'] ? req.files['attachment'][0].path : null;

    if (!excelFilePath) {
        return res.status(400).send('No Excel file uploaded.');
    }

    try {
        const workbook = xlsx.readFile(excelFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        const emailsData = [];
        data.slice(1).forEach(row => {
            const companyName = row[0];
            const emails = row[1] ? row[1].split(',').map(email => email.trim()) : [];
            const position = row[2];
            emails.forEach(email => emailsData.push({ companyName, email, position, subject }));
        });

        const uniqueEmailsData = emailsData.filter((v, i, a) =>
            a.findIndex(t => t.email === v.email) === i
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        for (const { companyName, email, position, subject } of uniqueEmailsData) {
            const mailOptions = {
                from: `${process.env.USER_NAME} <${process.env.GMAIL_USER}>`,
                to: email,
                subject: subject,
                text: `${body}`,
            };

            if (attachmentFilePath) {
                mailOptions.attachments = [
                    {
                        filename: path.basename(attachmentFilePath),
                        path: attachmentFilePath,
                    },
                ];
            }

            await transporter.sendMail(mailOptions);
            counter++;
            console.log(`Email - ${companyName} - #${counter}`);
        }

        fs.unlinkSync(excelFilePath);
        res.send('Emails sent successfully!');
    } catch (error) {
        console.error('Error processing emails:', error);
        res.status(500).send('Error processing emails.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
