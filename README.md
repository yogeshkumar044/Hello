👋 Hello – Anonymous Messaging Platform
Hello is a modern, secure, and anonymous messaging platform inspired by Qooh.me, designed to let users receive honest feedback and messages from friends, followers, or anonymous visitors.

✨ Features
🕶️ Anonymous Messaging – Send and receive messages anonymously

🧑‍💼 User Profiles – Each user gets a personal message board with a unique URL

🤖 AI Message Suggestions – Smart, AI-powered prompts via Cohere

📬 Message Management – View, manage, and delete received messages

⚙️ Customizable Settings – Control anonymity, message acceptance, and more

🔐 Email Verification – Secure sign-up with code-based verification

📱 Responsive Design – Mobile-first, modern user experience

🛠️ Tech Stack
Layer	Tech
Framework	Next.js 14 (App Router)
Frontend	React, TailwindCSS
UI Components	Shadcn UI
Database	MongoDB + Mongoose
Auth	NextAuth.js
Forms & Validation	React Hook Form, Zod
Email	Resend + React Email
AI	Cohere API for message suggestions

🚀 Getting Started
✅ Prerequisites
Node.js v18+

MongoDB database

Cohere API key

Resend API key

📁 Environment Setup
Create a .env file in your root directory:

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# API Keys
COHERE_API_KEY=your_cohere_api_key
RESEND_API_KEY=your_resend_api_key


📦 Installation
bash
Copy
Edit
# Clone the repo
git clone https://github.com/yourusername/hello.git
cd hello

# Install dependencies
npm install

# Run locally
npm run dev
Then open http://localhost:3000 in your browser.

📂 Project Structure
csharp
Copy
Edit
src/
├── app/                 # App Router layout
│   ├── (app)/           # Main app pages
│   ├── (auth)/          # Login, signup, verification routes
│   ├── api/             # API route handlers
│   └── u/               # Public user profiles
├── components/          # Reusable components
├── lib/                 # Utility functions (resend, cohere, etc.)
├── model/               # Mongoose schemas
├── schemas/             # Zod form validation
├── context/             # Context providers
├── helpers/             # Helper utilities
emails/                  # React email templates
public/                  # Static assets
🔄 Application Flow
🔐 Authentication
Register with email, username, and password

Receive a verification code via email (Resend)

Verify account to activate messaging

Login via email or username

🧑‍💼 User Dashboard
View all received messages

Toggle settings (accept messages, anonymous replies)

Copy and share your message link

🌐 Public Profile
Unique message board at /u/username

Send messages anonymously or publicly

Get AI-suggested questions via Cohere

📡 API Endpoints
Feature	Endpoint
Auth	/api/auth/[...nextauth]
Register	/api/sign-up
Verify Email	/api/verify-code
User Info	/api/get-user
Send Message	/api/send-message
View Messages	/api/get-messages
Delete Message	/api/delete-message/[id]
Settings	/api/accept-messages, /api/send-anonymously
AI Suggestions	/api/suggest-messages
Check Username	/api/check-username-unique

🌐 Deployment
This project is pre-configured for Vercel:

bash
Copy
Edit
npm run build
For other platforms, follow the Next.js deployment guide.

🤝 Contributing
Contributions are welcome! If you'd like to add features, fix bugs, or improve docs, feel free to:

Fork the repo

Open an issue

Submit a pull request

🙏 Acknowledgements
Next.js

Shadcn UI

MongoDB

Cohere AI

NextAuth.js

Resend

React Email

Built with ❤️ using Next.js, React, and a passion for anonymous honesty.



