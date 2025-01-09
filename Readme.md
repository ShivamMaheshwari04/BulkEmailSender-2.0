### **README.md**  

```markdown
# Bulk Email Sender  

Bulk Email Sender is a Node.js application that allows users to send personalized emails to multiple recipients individually.  

---

## Features  
- Send emails to multiple recipients, ensuring each recipient sees only their email in the "To" field.  
- Add a subject, message body, and file attachment.  

---

## Setup Instructions  

### 1. Install Dependencies  
```bash
npm install
```

### 2. Configure Environment Variables  
Create a `.env` file in the root directory with the following:  
```env
GMAIL_USER=your-email@gmail.com  
GMAIL_PASS=your-app-password  
USER_NAME=Your Name  
```

---

## Running the Application  
Start the server using:  
```bash
node app.js
```  
Access the app at `http://localhost:3000`.  

---

## How to Use  
1. Fill in the email addresses, subject, and body.  
2. Attach a file if needed.  
3. Click **Send Emails** to send individual emails to recipients.  
