# 🧠 Admin Dashboard Full Stack App

An Admin + User Dashboard built with:

- ⚙️ **Express.js** + **Prisma ORM** for backend
- ⚛️ **React.js / Next.js** for frontend
- 🛡️ JWT Auth, Task Management, Role-Based Access Control

---

## 📁 Project Structure

```bash
├── backend/        # Express + Prisma API
├── frontend/       # React or Next.js Frontend
└── README.md
```

🚀 Getting Started

🧱 Backend Setup

cd backend
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm dev

🖥️ Frontend Setup

cd frontend
pnpm install
pnpm dev

🔐 Authentication

    JWT-based login system

    Admin, Reviewer, Editor roles

    Middleware for protected routes

🔙 Backend API Routes

| Method | Endpoint                       | Description                 | Auth Required |
| ------ | ------------------------------ | --------------------------- | ------------- |
| POST   | `/api/admin/signin` /signup    | Admin Login                 | ❌ No         |
| GET    | `/api/admin/users`             | Get all users               | ✅ Yes        |
| POST   | `/api/tasks/add-task/:id`      | Add new task for user       | ✅ Yes        |
| PATCH  | `/api/tasks/update-status/:id` | Update task status          | ✅ Yes        |
| GET    | `/api/tasks/get-task/:id`      | Get tasks for specific user | ✅ Yes        |

🌐 Frontend Routes (React.js)
| Path | Description |
| ---------------- | --------------------------- |
| `/login` | Admin login |
| `/dashboard` | Admin Dashboard |
| `/users` | List of users |
| `/tasks/:userId` | Task list for specific user |
| `/tasks/create` | Create a new task |

🧪 Tech Stack

| Layer    | Tech                   |
| -------- | ---------------------- |
| Frontend | React.js, Tailwind CSS |
| Backend  | Node.js, Express.js    |
| Database | MongoDB (via Prisma)   |
| Auth     | JWT                    |
| ORM      | Prisma                 |

🤝 Contributing

Pull requests are welcome! Feel free to open issues or suggest features.
📄 License

This project is licensed under the MIT License.
