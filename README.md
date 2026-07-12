# ProjectHub Backend

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs

---

## Installation

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```bash
npm run dev
```

---

# API Endpoints

## Authentication

### Signup

**POST**

```
/api/auth/signup
```

### Login

**POST**

```
/api/auth/login
```

---

## User

### Get Profile

**GET**

```
/api/users/profile
```

Authentication Required ✅

---

### Update Profile

**PUT**

```
/api/users/profile
```

Authentication Required ✅

---

## Projects

### Create Project

**POST**

```
/api/projects
```

Authentication Required ✅

---

### Get All Projects

**GET**

```
/api/projects
```

---

### Get Project By ID

**GET**

```
/api/projects/:id
```

---

### Get My Created Projects

**GET**

```
/api/projects/my
```

Authentication Required ✅

---

## Applications

### Apply to Project

**POST**

```
/api/applications/:id/apply
```

Authentication Required ✅

---

### Get My Applications

**GET**

```
/api/applications/my
```

Authentication Required ✅

---

### Get Project Applicants

**GET**

```
/api/applications/:id/applicants
```

Authentication Required ✅

---

## Project Structure

```
backend/
│
├── Controllers/
├── Middleware/
├── Models/
├── Routes/
├── db/
├── .env
├── server.js
└── package.json
```

---

## Current Features

* User Authentication (JWT)
* Password Hashing
* Create Project
* View Projects
* Apply to Projects
* View Applied Projects
* View Created Projects
* Update User Profile

---

## Future Features

* AI Project Description Generator
* AI Candidate Match Score
* AI Feedback
* Accept/Reject Applicants
* GitHub & LinkedIn Integration
* Project Search & Filters
* Notifications
* Deployment
