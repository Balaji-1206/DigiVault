/**
 * DigiVault Backend Server
 * 
 * SECURITY NOTICE:
 * - MongoDB connection string is stored in .env file (NOT in this code)
 * - .env file is in .gitignore and will NEVER be committed to Git
 * - Copy .env.example to .env and add your real MongoDB Atlas credentials
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { encryptEvidence } = require('./encrypt');

// Load environment variables
dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection - MUST be set in .env file
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  console.error('Please create a .env file and add your MongoDB Atlas connection string:');
  console.error('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digivault');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// Evidence Schema
const evidenceSchema = new mongoose.Schema({
  // Officer Information (encrypted)
  officerId: String,
  officerName: String,
  stationUnit: String,
  rank: String,
  
  // Case Details
  caseNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  caseTitle: String,
  crimeType: String,
  investigatingOfficer: String,
  
  // Evidence Details (encrypted)
  evidenceId: String,
  evidenceType: String,
  evidenceDescription: String,
  sourceOfEvidence: String,
  deviceId: String,
  deviceOwner: String,
  
  // Proof Image (encrypted)
  proofImage: String,
  proofImageOriginalName: String
}, {
  versionKey: false
});

// Evidence Model
const Evidence = mongoose.model('Evidence', evidenceSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DigiVault API is running' });
});

// Upload proof image
app.post('/api/evidence/upload-image', upload.single('proofImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Submit evidence
app.post('/api/evidence/submit', async (req, res) => {
  try {
    const evidenceData = req.body;
    
    // Encrypt the evidence data
    const encryptionResult = encryptEvidence(evidenceData);
    
    // Create evidence document with encrypted data
    // Create evidence document with encrypted data ONLY
    const evidence = new Evidence({
      caseNumber: encryptionResult.caseId,
      officerId: encryptionResult.encryptedData.officerId,
      officerName: encryptionResult.encryptedData.officerName,
      stationUnit: encryptionResult.encryptedData.stationUnit,
      rank: encryptionResult.encryptedData.rank,
      caseTitle: encryptionResult.encryptedData.caseTitle,
      crimeType: encryptionResult.encryptedData.crimeType,
      investigatingOfficer: encryptionResult.encryptedData.investigatingOfficer,
      evidenceId: encryptionResult.encryptedData.evidenceId,
      evidenceType: encryptionResult.encryptedData.evidenceType,
      evidenceDescription: encryptionResult.encryptedData.evidenceDescription,
      sourceOfEvidence: encryptionResult.encryptedData.sourceOfEvidence,
      deviceId: encryptionResult.encryptedData.deviceId,
      deviceOwner: encryptionResult.encryptedData.deviceOwner,
      proofImage: encryptionResult.encryptedData.proofImage,
      proofImageOriginalName: encryptionResult.encryptedData.proofImageOriginalName
    });
    
    await evidence.save();
    
    res.status(201).json({
      message: 'Evidence submitted and encrypted successfully',
      caseNumber: encryptionResult.caseId,
      success: true
    });
  } catch (error) {
    console.error('Error submitting evidence:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all evidence records
app.get('/api/evidence', async (req, res) => {
  try {
    const { status, crimeType, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (crimeType) filter.crimeType = crimeType;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const evidences = await Evidence.find(filter)
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Evidence.countDocuments(filter);
    
    res.json({
      success: true,
      data: evidences,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evidence records',
      error: error.message
    });
  }
});

// Get evidence by ID
app.get('/api/evidence/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found'
      });
    }
    
    res.json({
      success: true,
      data: evidence
    });
    
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evidence',
      error: error.message
    });
  }
});

// Update evidence status
app.patch('/api/evidence/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Submitted', 'Under Review', 'Verified', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const evidence = await Evidence.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Evidence status updated',
      data: evidence
    });
    
  } catch (error) {
    console.error('Error updating evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evidence',
      error: error.message
    });
  }
});

// Delete evidence (admin only - you should add authentication)
app.delete('/api/evidence/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findByIdAndDelete(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evidence',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
