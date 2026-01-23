# Project Management API

A secure, scalable, and role-based backend API for a **Project Management System**, built using **Node.js, Express.js, and MongoDB (Mongoose)**.

This API focuses on **authentication**, **role-based authorization**, and a **modular architecture** suitable for real-world applications.

---

## 🎯 Project Overview

The system supports three types of users:

- **ADMIN** – Manages the entire system
- **MANAGER** – Creates and manages projects / requests
- **STAFF** – Accepts and completes assigned tasks

The application follows best practices including:
- Secure authentication
- Role-based access control
- Invitation-based user registration
- Modular and maintainable code structure

---

## 🧰 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

### Security & Utilities
- JWT Authentication
- Password Hashing (bcrypt)
- Environment Variables (`dotenv`)

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based authorization middleware
- Secure invite-token based registration
- User status management (ACTIVE / INACTIVE)

---

## 👥 User Roles

| Role     | Description |
|--------|------------|
| ADMIN   | Full system control |
| MANAGER | Create & manage projects |
| STAFF   | Accept and complete tasks |

---

## 📩 Invitation Flow

### 1️⃣ Send Invitation

**Request Body**
```json
{
  "email": "subahanislam2@gmail.com",
  "password": "1234M@r1",
  "role": "MANAGER"
}


{
  "statusCode": 200,
  "message": "Invitation sent successfully",
  "success": true,
  "data": {
    "inviteToken": ""
  }
}



{
  "name": "Subahan Islam",
  "inviteToken": "",
  "email": "subahanaislam@gmail.com",
  "password": "1234M@r1"
}



{
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true,
  "data": {
    "name": "Subahan Islam",
    "email": "subahanislam2@gmail.com",
    "role": "MANAGER",
    "isDeleted": false,
    "isActive": "ACTIVE",
    "isVerified": true,
    "_id": "6973aad61ef8abd994efd9f374",
    "auths": [],
    "createdAt": "2026-01-23T17:07:34.577Z",
    "updatedAt": "2026-01-23T17:07:34.577Z"
  }
}



src/
 ├── modules/
 │   ├── auth/
 │   ├── user/
 │   ├── invite/
 │   └── project/
 ├── middlewares/
 ├── utils/
 ├── config/
 ├── app.ts
 └── server.ts
