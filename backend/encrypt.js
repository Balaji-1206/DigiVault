/**
 * DigiVault Evidence Encryption Script
 * 
 * This script encrypts evidence intake form data using AES-256-GCM encryption
 * and stores the encrypted data with its hash in a secure format.
 * 
 * Usage: node encrypt.js
 * 
 * Security Features:
 * - AES-256-GCM encryption with authenticated encryption
 * - Secure random key generation (256-bit)
 * - Secure random IV generation (96-bit)
 * - SHA-256 hash for integrity verification
 * - Case ID stored in plaintext for indexing
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate a secure random encryption key
 * @returns {Buffer} 256-bit (32 bytes) encryption key
 */
function generateEncryptionKey() {
  // Generate a secure random 256-bit key (32 bytes) for AES-256
  return crypto.randomBytes(32);
}

/**
 * Generate a secure random initialization vector
 * @returns {Buffer} 96-bit (12 bytes) IV for GCM mode
 */
function generateIV() {
  // Generate a secure random 96-bit IV (12 bytes) - recommended for GCM
  return crypto.randomBytes(12);
}

/**
 * Encrypt data using AES-256-GCM (IV generated internally)
 * @param {string} plaintext - Data to encrypt
 * @param {Buffer} key - 256-bit encryption key
 * @returns {Object} Encrypted data with auth tag and internal IV
 */
function encryptData(plaintext, key) {
  // Generate IV internally (not exposed)
  const iv = generateIV();
  
  // Create cipher using AES-256-GCM algorithm
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag (used for verifying data integrity)
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedValue: encrypted,
    authTag: authTag.toString('hex'),
    internalIV: iv
  };
}

/**
 * Encrypt a single field (IV is generated internally)
 * @param {string} fieldName - Name of the field
 * @param {string} fieldValue - Value to encrypt
 * @param {Buffer} key - Encryption key
 * @returns {Object} Encrypted field with metadata
 */
function encryptField(fieldName, fieldValue, key) {
  const { encryptedValue, authTag, internalIV } = encryptData(String(fieldValue || ''), key);
  
  return {
    fieldName,
    encryptedValue,
    authTag,
    internalIV
  };
}

/**
 * Prepare evidence data for field-by-field encryption
 * @param {Object} evidenceData - Evidence intake form data
 * @returns {Object} Separated case ID and fields to encrypt
 */
function prepareEvidenceData(evidenceData) {
  // Extract case ID (stored in plaintext)
  const caseId = evidenceData.caseNumber || 'UNKNOWN';
  
  // Define fields to encrypt (all except caseNumber)
  const fieldsToEncrypt = [
    'officerId',
    'officerName',
    'stationUnit',
    'rank',
    'caseTitle',
    'crimeType',
    'investigatingOfficer',
    'evidenceId',
    'evidenceType',
    'evidenceDescription',
    'sourceOfEvidence',
    'deviceId',
    'deviceOwner',
    'proofImage',
    'proofImageOriginalName'
  ];
  
  // Create object with only fields that need encryption
  const dataToEncrypt = {};
  fieldsToEncrypt.forEach(field => {
    if (evidenceData[field] !== undefined) {
      dataToEncrypt[field] = evidenceData[field];
    }
  });
  
  return {
    caseId,
    fieldsToEncrypt: dataToEncrypt
  };
}

/**
 * Save only integrity verification and auth key to enchash.txt (no IVs)
 * Appends to file instead of overwriting to maintain all records
 * @param {string} caseId - Case ID
 * @param {string} globalHash - SHA-256 hash of all encrypted data
 * @param {string} authKey - Single auth key (hex encoded)
 * @param {string} outputPath - Path to output file
 */
function saveEncryptedEvidence(caseId, globalHash, authKey, outputPath) {
  // Format the output as readable text with separator
  const outputText = 
`
Case ID: ${caseId}
Key: ${authKey}
Hash: ${globalHash}
====================================
`;
  
  // Ensure uploads directory exists
  const uploadDir = path.dirname(outputPath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Append to file instead of overwriting
  fs.appendFileSync(outputPath, outputText, 'utf8');
  console.log(`✅ Encryption parameters appended to: ${outputPath}`);
}

/**
 * Main encryption function - encrypts each field separately
 * @param {Object} evidenceData - Evidence intake form data
 * @returns {Object} Encryption results with encrypted fields for database
 */
function encryptEvidence(evidenceData) {
  console.log('🔐 Starting evidence encryption process...\n');
  
  // Step 1: Prepare data
  console.log('Step 1: Preparing evidence data...');
  const { caseId, fieldsToEncrypt } = prepareEvidenceData(evidenceData);
  console.log(`  - Case ID: ${caseId}`);
  console.log(`  - Fields to encrypt: ${Object.keys(fieldsToEncrypt).length}`);
  
  // Step 2: Generate encryption key (one key for all fields)
  console.log('\nStep 2: Generating secure 256-bit encryption key...');
  const encryptionKey = generateEncryptionKey();
  console.log(`  - Key generated: ${encryptionKey.toString('hex').substring(0, 16)}... (32 bytes)`);
  
  // Step 3: Encrypt each field separately
  console.log('\nStep 3: Encrypting fields individually with AES-256-GCM...');
  const encryptedFields = [];
  const encryptedDataForDb = { caseNumber: caseId };
  let hashInput = '';
  
  Object.entries(fieldsToEncrypt).forEach(([fieldName, fieldValue]) => {
    const encryptedField = encryptField(fieldName, fieldValue, encryptionKey);
    encryptedFields.push(encryptedField);
    
    // Store in database: only encrypted value (base64) - IV generated internally
    encryptedDataForDb[fieldName] = Buffer.from(encryptedField.encryptedValue, 'hex').toString('base64');
    
    // Accumulate hash input (internal IV + encrypted data + auth tag)
    hashInput += encryptedField.encryptedValue + encryptedField.internalIV.toString('hex') + encryptedField.authTag;
    
    console.log(`  - Encrypted: ${fieldName}`);
  });
  
  // Step 4: Compute global hash of all encrypted data
  console.log('\nStep 4: Computing SHA-256 hash for integrity verification...');
  const hash = crypto.createHash('sha256');
  hash.update(hashInput);
  const globalHash = hash.digest('hex');
  console.log(`  - Hash: ${globalHash}`);
  
  // Step 5: Use the first field's auth tag as the single auth key
  const authKey = encryptedFields[0].authTag;
  
  // Step 6: Save encryption parameters to file
  console.log('\nStep 5: Saving encryption parameters to file...');
  const outputPath = path.join(__dirname, 'uploads', 'enchash.txt');
  saveEncryptedEvidence(caseId, globalHash, authKey, outputPath);
  
  console.log('\n✅ Encryption process completed successfully!\n');
  console.log('⚠️  IMPORTANT: Store the encryption key securely!');
  console.log(`Encryption Key (hex): ${encryptionKey.toString('hex')}`);
  console.log('\nWithout this key, the encrypted data cannot be decrypted.');
  
  return {
    caseId,
    encryptedData: encryptedDataForDb,
    encryptionKey: encryptionKey.toString('hex'),
    hash: globalHash,
    authKey: authKey,
    outputPath
  };
}

// ============================================================================
// EXAMPLE USAGE (for testing only)
// ============================================================================

// Run encryption with sample data only when executed directly
if (require.main === module) {
  // Sample evidence intake form data (for testing only)
  const sampleEvidenceData = {
    // Officer Information (auto-filled from login)
    officerId: 'OFF-12345',
    officerName: 'John Smith',
    stationUnit: 'Central Police Station - Unit 7',
    rank: 'Detective',
    
    // Case Information
    caseNumber: 'CASE-2026-00123',
    caseTitle: 'Theft Investigation - Downtown Store',
    crimeType: 'Property Crime - Theft',
    investigatingOfficer: 'Det. John Smith',
    
    // Evidence Information
    evidenceId: 'EVID-LQ1234ABC',
    evidenceType: 'Digital Evidence - Mobile Phone',
    evidenceDescription: 'Samsung Galaxy S21, Black color, IMEI: 123456789012345, found at crime scene',
    sourceOfEvidence: 'Crime Scene - 123 Main Street',
    
    // Device Information
    deviceId: 'IMEI: 123456789012345',
    deviceOwner: 'Jane Doe',
    
    // Proof Image Information
    proofImage: '/uploads/evidence-1735857600000-123456789.jpg',
    proofImageOriginalName: 'evidence-photo.jpg'
  };

  try {
    const result = encryptEvidence(sampleEvidenceData);
    
    console.log('\n' + '='.repeat(70));
    console.log('Encryption Summary:');
    console.log('='.repeat(70));
    console.log(`Case ID: ${result.caseId}`);
    console.log(`Output File: ${result.outputPath}`);
    console.log(`Hash: ${result.hash}`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = { encryptEvidence, generateEncryptionKey, generateIV };
