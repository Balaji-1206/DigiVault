# DigiVault - Digital Evidence Integrity Management System

Complete full-stack application with React frontend and Express backend connected to MongoDB Atlas.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user with username and password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/digivault?retryWrites=true&w=majority
PORT=5000
```

### 4. Run the Application

**Terminal 1 - Start the Backend Server:**
```bash
npm run server
```

Or with auto-restart on changes:
```bash
npm run server:dev
```

**Terminal 2 - Start the React Frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)
The backend API will run on `http://localhost:5000`

## 📡 API Endpoints

### Evidence Management

- **POST** `/api/evidence/submit` - Submit new evidence
- **GET** `/api/evidence` - Get all evidence records (with pagination)
- **GET** `/api/evidence/:id` - Get specific evidence by ID
- **PATCH** `/api/evidence/:id/status` - Update evidence status
- **DELETE** `/api/evidence/:id` - Delete evidence

### Health Check

- **GET** `/api/health` - Check if API is running

## 🗂️ Project Structure

```
DigiVault/
├── server/
│   └── server.js          # Express backend with MongoDB
├── src/
│   ├── components/
│   │   └── EvidenceIntakeForm.jsx  # Main form component
│   ├── App.jsx            # Main React app
│   ├── main.jsx          # React entry point
│   ├── App.css           # App styles
│   └── index.css         # Global styles
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment file
└── package.json          # Dependencies and scripts
```

## 🔒 Security Notes

- Never commit `.env` file to git
- Use proper authentication in production
- Implement role-based access control
- Add request rate limiting
- Validate and sanitize all inputs
- Use HTTPS in production

## 📝 Form Fields

### Officer Information (Auto-filled, Read-only)
- Officer ID
- Officer Name
- Police Station/Unit
- Rank/Designation

### Case Details
- Case Number/FIR Number
- Case Title
- Crime Type
- Investigating Officer Name

### Evidence Details
- Evidence ID (auto-generated)
- Evidence Type
- Evidence Description
- Source of Evidence
- Device ID/Serial Number (optional)
- Device Owner (optional)

## 🧪 Testing the API

You can test the API using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Submit evidence
curl -X POST http://localhost:5000/api/evidence/submit \
  -H "Content-Type: application/json" \
  -d '{
    "officerId": "OFF-2025-001",
    "officerName": "John Smith",
    "stationUnit": "Central Police Station",
    "rank": "Inspector",
    "caseNumber": "FIR-2025-001",
    "caseTitle": "Cybercrime Investigation",
    "crimeType": "Cybercrime",
    "investigatingOfficer": "John Smith",
    "evidenceId": "EVID-TEST001",
    "evidenceType": "Image",
    "evidenceDescription": "Screenshot of fraudulent transaction",
    "sourceOfEvidence": "Mobile phone"
  }'
```

## 📦 Dependencies

### Frontend
- React 18
- Axios (for API calls)
- Vite (build tool)

### Backend
- Express
- Mongoose (MongoDB ODM)
- CORS
- dotenv

## 🛠️ Development

To run with auto-reload during development:

```bash
# Terminal 1
npm run server:dev

# Terminal 2
npm run dev
```

## 📄 License

ISC
