# DCIT 26 Lab 5: Student Records API (Express + MongoDB)

REST API for managing student records using Node.js, Express, MongoDB, and Mongoose.

## Setup
1. Install [Node.js](https://nodejs.org) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas).
2. Clone the repo and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd dcit26-lab5-express-mongodb
   npm install
   ```

## MongoDB Configuration
Copy `.env.example` to `.env` and edit it:
```
MONGODB_URI=mongodb://127.0.0.1:27017/lab5_students
PORT=5000
```
Make sure `mongod` is running. `.env` is git-ignored; never commit it.

## Run
```bash
npm run dev     # development (nodemon)
npm start       # production
```

## API Routes
| Method | Route | Description | Success |
|--------|-------|-------------|---------|
| GET | /api/health | Health check | 200 |
| GET | /api/students | List all students | 200 |
| GET | /api/students/:id | Get one student | 200 / 404 |
| POST | /api/students | Create a student | 201 |
| PUT | /api/students/:id | Update a student | 200 / 404 |
| DELETE | /api/students/:id | Delete a student | 200 / 404 |

Invalid input or malformed IDs return 400; unexpected errors return 500.

## Student Model
`fullName` (String, required), `course` (String, required), `yearLevel` (Number 1-4, required), `section` (String, optional), `createdAt` (Date, default now).

## Sample curl tests
```bash
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/students -H "Content-Type: application/json" \
  -d '{"fullName":"Alex Santos","course":"BSIT","yearLevel":2,"section":"IT-2A"}'
curl http://localhost:5000/api/students
curl -X PUT http://localhost:5000/api/students/<id> -H "Content-Type: application/json" -d '{"yearLevel":3}'
curl -X DELETE http://localhost:5000/api/students/<id>
```
