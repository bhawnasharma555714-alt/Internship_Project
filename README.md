# 🚀 CollabConnect

An AI-powered MERN platform that helps students discover, apply for, and collaborate on projects. **CollabConnect** streamlines project recruitment by allowing project owners to post opportunities, applicants to showcase their skills, and AI to provide intelligent application analysis.

---

## ✨ Features

### 🔐 Authentication
- User Signup & Login
- JWT-based Authentication
- Secure Password Hashing using bcryptjs
- Protected Routes

### 👤 User Profile
- View Profile
- Update Bio
- Update Skills
- Update Interests

### 📂 Project Management
- Create Projects
- View All Projects
- View Project Details
- View My Projects
- Edit Projects
- Delete Projects

### 📩 Applications
- Apply to Projects
- Prevent Duplicate Applications
- View My Applications
- Withdraw Applications

### 👥 Applicant Management
- View Applicants for a Project
- Accept Applicants
- Reject Applicants
- Application Status Management

### 🤖 AI Integration
- AI-powered Applicant Analysis
- AI Match Score
- Strengths Identification
- Areas for Improvement
- Graceful fallback when AI service is unavailable

### 🎨 User Experience
- Responsive UI
- Active Navigation
- Custom Toast Notifications
- Clean Dark Theme

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

## AI
- Google Gemini API

---

# 📁 Project Structure

```text
CollabConnect/
│
├── client/
│   ├── Components/
│   ├── Context/
│   ├── Pages/
│   ├── Services/
│   └── Assets/
│
├── server/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   ├── Routes/
│   ├── db/
│   └── server.js
│
├── screenshots/
│   ├── home.png
│   ├── projects.png
│   ├── project-details.png
│   ├── ai-analysis.png
│   ├── my-applications.png
│   ├── applicants.png
│   └── profile.png
│
└── README.md
```

---

# 🔗 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/signup` |
| POST | `/api/auth/login` |

---

## Users

| Method | Endpoint |
|---------|----------|
| GET | `/api/users/profile` |
| PUT | `/api/users/profile` |

Authentication Required ✅

---

## Projects

| Method | Endpoint |
|---------|----------|
| POST | `/api/projects` |
| GET | `/api/projects` |
| GET | `/api/projects/:id` |
| GET | `/api/projects/my` |
| PUT | `/api/projects/:id` |
| DELETE | `/api/projects/:id` |

Authentication Required ✅

---

## Applications

| Method | Endpoint |
|---------|----------|
| POST | `/api/applications/:id/apply` |
| GET | `/api/applications/my` |
| DELETE | `/api/applications/:id` |
| GET | `/api/applications/:id/applicants` |
| PATCH | `/api/applications/:id` |
| PATCH | `/api/applications/:id/analyze` |

Authentication Required ✅

---

# 📸 Screenshots

## 🏠 Home Page

![Home](./screenshots/home.png)

---

## 📂 Browse Projects

![Projects](./screenshots/projects.png)

---

## 📄 Project Details

![Project Details](./screenshots/project-details.png)

---

## 🤖 AI-Powered Applicant Analysis

![AI Analysis](./screenshots/ai-analysis.png)

---

## 📩 My Applications

![My Applications](./screenshots/my-applications.png)

---

## 👥 Applicant Management

![Applicants](./screenshots/applicants.png)

---

## 👤 User Profile

![Profile](./screenshots/profile.png)

---

## 🚀 Future Enhancements (Phase 2)

- 💬 Real-time chat between project owners and accepted collaborators
- 🔔 In-app notifications
- 🤖 AI-powered project recommendations
- 👥 Remove collaborators
- 📧 Email notifications
- 🔍 Advanced search and filtering
- 📊 Project analytics dashboard
- 🌐 GitHub & LinkedIn profile integration

---

# 📦 Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/CollabConnect.git
cd CollabConnect
```

---

## 2️⃣ Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file inside the **server** folder and add the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** Never commit your actual `.env` file or API keys to GitHub.

---

## 4️⃣ Start the Backend

```bash
cd server
npm run dev
```

The backend will run at:

```
http://localhost:3000
```

---

## 5️⃣ Start the Frontend

Open a new terminal and run:

```bash
cd client
npm run dev
```

The frontend will run at:

```
http://localhost:5173
```

---

## 6️⃣ Open the Application

Visit the application in your browser:

```
http://localhost:5173
```

## 👨‍💻 Author

-**Bhawna Sharma**
-**Navya**

If you found this project helpful, feel free to ⭐ the repository!

## 🌐 Live Demo
Frontend: [collabconnect1.vercel.app](https://collabconnect1.vercel.app/)
Backend API: https://internship-project-backend-8lwm.onrender.com