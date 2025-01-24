require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // For parsing Excel files

const app = express();
const port = 2000;
let counter = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original filename for uploaded files
    },
});
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/send-emails', upload.fields([{ name: 'file' }, { name: 'attachment' }]), async (req, res) => {
    const { body } = req.body;
    const excelFilePath = req.files['file'] ? req.files['file'][0].path : null;
    const attachmentFilePath = req.files['attachment'] ? req.files['attachment'][0].path : null;

    if (!excelFilePath) {
        return res.status(400).send('No Excel file uploaded.');
    }

    try {
        // Parse Excel file
        const workbook = xlsx.readFile(excelFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        // Extract data from Excel
        const emailsData = [];
        data.slice(1).forEach(row => {
            const companyName = row[0] || 'Unknown Company';
            const emails = row[1] ? row[1].split(',').map(email => email.trim()) : [];
            const position = row[2] || 'Web Development Intern Using MERN';
            emails.forEach(email => emailsData.push({ companyName, email, position }));
        });

        // Remove duplicate emails
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

        // Send emails
        for (const { companyName, email, position } of uniqueEmailsData) {
            const mailOptions = {
                from: `${process.env.USER_NAME} <${process.env.GMAIL_USER}>`,
                to: email,
                subject: `Application for Internship/Entry-Level Position in ${position}`,
                text: `Dear Sir/Mam,
                
I hope this email finds you well. My name is Shivam Maheshwari, and I am from Gwalior, where I am currently pursuing my MCA from Madhav Institute of Technology and Science. I am writing to express my interest in the ${position} at ${companyName}.

${body}`,
            };

            // Attach the resume file if provided
            if (attachmentFilePath) {
                mailOptions.attachments = [
                    {
                        filename: path.basename(attachmentFilePath), // Preserve original filename
                        path: attachmentFilePath,
                    },
                ];
            }

            await transporter.sendMail(mailOptions);
            counter++;
            console.log(`Email - ${companyName} - #${counter}`); // Minimal log output
        }

        // Clean up Excel file (Resume is not deleted)
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
