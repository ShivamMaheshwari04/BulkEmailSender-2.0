# Email Sender Application

This is a Node.js-based email sender application that allows users to send bulk emails by uploading an Excel file containing recipient details and attaching optional files.

## Features
- **Bulk Email Sending**: Upload an Excel file to send personalized emails to multiple recipients.
- **Attachment Support**: Include an optional attachment (e.g., resume or portfolio).
- **Excel Parsing**: Extract email data from an uploaded Excel file.
- **Duplicate Email Handling**: Automatically removes duplicate emails to avoid redundancy.

## Prerequisites
- Node.js installed on your system.
- A Gmail account for sending emails.

## Installation
1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd email-sender-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and configure the following environment variables:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_email_password
   USER_NAME=Your Name
   ```
   > **Note**: Enable "Less secure app access" or set up an app password for your Gmail account.

## Usage
1. Start the server:
   ```bash
   node app.js
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:2000
   ```
3. Upload an Excel file with the recipient details and (optionally) a file to attach.

## Excel File Format
The Excel file should have the following columns:
| **Company Name** | **Emails**                  | **Position**              |
|-------------------|-----------------------------|---------------------------|
| Example Co.       | example1@gmail.com,example2@gmail.com | Web Development Intern |

- The **Emails** column supports multiple email addresses separated by commas.
- The **Position** column defaults to `Web Development Intern Using MERN` if left blank.

## Dependencies
- [dotenv](https://www.npmjs.com/package/dotenv): For managing environment variables.
- [express](https://www.npmjs.com/package/express): Web framework for Node.js.
- [body-parser](https://www.npmjs.com/package/body-parser): Parse incoming request bodies.
- [multer](https://www.npmjs.com/package/multer): Handle file uploads.
- [nodemailer](https://www.npmjs.com/package/nodemailer): Send emails.
- [xlsx](https://www.npmjs.com/package/xlsx): Parse Excel files.

## Project Structure
```
├── app.js               # Main application file
├── uploads/             # Directory for uploaded files
├── views/
│   └── index.html       # Frontend HTML page
├── public/              # Static files (CSS, JS)
├── .env                 # Environment variables
└── README.md            # Documentation
```

## Example Mail Template
```
Dear Sir/Mam,

I hope this email finds you well. My name is Shivam Maheshwari, and I am from Gwalior, where I am currently pursuing my MCA from Madhav Institute of Technology and Science. I am writing to express my interest in the <Position> at <Company Name>.

<Your Custom Message>
```

## Logs
The server logs each email sent with the format:
```
Email - <Company Name> - #<Counter>
```

## Error Handling
- Returns a `400` status code if no Excel file is uploaded.
- Logs detailed errors to the console if email processing fails.

## License
This project is licensed under the MIT License.
