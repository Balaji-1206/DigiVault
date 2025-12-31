import React, { useMemo, useState } from 'react';
import axios from 'axios';

// Simple evidence intake form; auto-filled officer fields are read-only to discourage tampering.
export default function EvidenceIntakeForm({
  officerId = '',
  officerName = '',
  stationUnit = '',
  rank = '',
  onSubmit,
}) {
  const generatedEvidenceId = useMemo(
    () => `EVID-${Date.now().toString(36).toUpperCase()}`,
    []
  );

  const [form, setForm] = useState({
    officerId,
    officerName,
    stationUnit,
    rank,
    caseNumber: '',
    caseTitle: '',
    crimeType: '',
    investigatingOfficer: '',
    evidenceId: generatedEvidenceId,
    evidenceType: '',
    evidenceDescription: '',
    sourceOfEvidence: '',
    deviceId: '',
    deviceOwner: '',
  });

  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, BMP, or WebP)');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      
      setProofImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let proofImagePath = '';
      let proofImageOriginalName = '';
      
      // Upload image first if provided
      if (proofImage) {
        const imageFormData = new FormData();
        imageFormData.append('proofImage', proofImage);
        
        const imageResponse = await axios.post(
          'http://localhost:5000/api/evidence/upload-image',
          imageFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (imageResponse.data.success) {
          proofImagePath = imageResponse.data.data.path;
          proofImageOriginalName = imageResponse.data.data.originalName;
        }
      }
      
      // Submit evidence data with image path
      const payload = { 
        ...form,
        proofImage: proofImagePath,
        proofImageOriginalName: proofImageOriginalName
      };
      
      // Send data to backend API
      const response = await axios.post('http://localhost:5000/api/evidence/submit', payload);
      
      console.log('✅ Evidence submitted successfully:', response.data);
      setSubmitStatus('success');
      
      // Custom callback if provided
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setForm({
          officerId,
          officerName,
          stationUnit,
          rank,
          caseNumber: '',
          caseTitle: '',
          crimeType: '',
          investigatingOfficer: '',
          evidenceId: `EVID-${Date.now().toString(36).toUpperCase()}`,
          evidenceType: '',
          evidenceDescription: '',
          sourceOfEvidence: '',
          deviceId: '',
          deviceOwner: '',
        });
        setProofImage(null);
        setImagePreview(null);
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error submitting evidence:', error);
      setSubmitStatus('error');
      
      // Show error message from backend if available
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to submit evidence. Please check if the server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle = {
    border: '1px solid #d0d7de',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    background: '#f9fbfd',
  };

  const labelStyle = {
    display: 'block',
    marginTop: 10,
    fontWeight: 600,
    color: '#0f172a',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    marginTop: 4,
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
  };

  const requiredNote = {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 20,
        fontFamily: 'Segoe UI, sans-serif',
        color: '#0f172a',
      }}
    >
      <h2 style={{ marginBottom: 4 }}>Evidence Intake</h2>
      <p style={{ marginTop: 0, color: '#475569' }}>
        Auto-filled officer fields are locked. Provide complete case and evidence details.
      </p>

      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Officer</h3>
        <label style={labelStyle}>Officer ID</label>
        <input style={inputStyle} value={form.officerId} readOnly />

        <label style={labelStyle}>Officer Name</label>
        <input style={inputStyle} value={form.officerName} readOnly />

        <label style={labelStyle}>Police Station / Unit</label>
        <input style={inputStyle} value={form.stationUnit} readOnly />

        <label style={labelStyle}>Rank / Designation</label>
        <input style={inputStyle} value={form.rank} readOnly />
      </section>

      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Case Details</h3>
        <label style={labelStyle}>Case Number / FIR Number</label>
        <input
          style={inputStyle}
          value={form.caseNumber}
          onChange={handleChange('caseNumber')}
          required
        />

        <label style={labelStyle}>Case Title / Description</label>
        <input
          style={inputStyle}
          value={form.caseTitle}
          onChange={handleChange('caseTitle')}
          required
        />

        <label style={labelStyle}>Crime Type</label>
        <select
          style={inputStyle}
          value={form.crimeType}
          onChange={handleChange('crimeType')}
          required
        >
          <option value="">Select crime type</option>
          <option value="Theft">Theft</option>
          <option value="Cybercrime">Cybercrime</option>
          <option value="Assault">Assault</option>
          <option value="Fraud">Fraud</option>
          <option value="Homicide">Homicide</option>
        </select>

        <label style={labelStyle}>Investigating Officer Name</label>
        <input
          style={inputStyle}
          value={form.investigatingOfficer}
          onChange={handleChange('investigatingOfficer')}
          required
        />
      </section>

      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Evidence Details</h3>

        <label style={labelStyle}>Evidence ID (auto-generated)</label>
        <input style={inputStyle} value={form.evidenceId} readOnly />

        <label style={labelStyle}>Evidence Type</label>
        <select
          style={inputStyle}
          value={form.evidenceType}
          onChange={handleChange('evidenceType')}
          required
        >
          <option value="">Select evidence type</option>
          <option value="Image">Image</option>
          <option value="Video">Video</option>
          <option value="Audio">Audio</option>
          <option value="Document">Document</option>
          <option value="Log file">Log file</option>
        </select>

        <label style={labelStyle}>Evidence Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
          value={form.evidenceDescription}
          onChange={handleChange('evidenceDescription')}
          placeholder="Example: CCTV footage from ATM camera near XYZ bank"
          required
        />
        <div style={requiredNote}>Add context so the chain of custody is clear.</div>

        <label style={labelStyle}>Source of Evidence</label>
        <select
          style={inputStyle}
          value={form.sourceOfEvidence}
          onChange={handleChange('sourceOfEvidence')}
          required
        >
          <option value="">Select source</option>
          <option value="CCTV camera">CCTV camera</option>
          <option value="Mobile phone">Mobile phone</option>
          <option value="Laptop">Laptop</option>
          <option value="Server logs">Server logs</option>
        </select>

        <label style={labelStyle}>Device ID / Serial Number (if available)</label>
        <input
          style={inputStyle}
          value={form.deviceId}
          onChange={handleChange('deviceId')}
          placeholder="Optional"
        />

        <label style={labelStyle}>Owner of Device (optional)</label>
        <input
          style={inputStyle}
          value={form.deviceOwner}
          onChange={handleChange('deviceOwner')}
          placeholder="Optional"
        />

        <label style={labelStyle}>Proof Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            ...inputStyle,
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        />
        <div style={requiredNote}>Upload an image as proof (Max 10MB, JPEG/PNG/GIF/BMP/WebP)</div>
        
        {imagePreview && (
          <div style={{
            marginTop: 12,
            border: '2px solid #cbd5e1',
            borderRadius: 8,
            padding: 12,
            background: '#ffffff',
            position: 'relative'
          }}>
            <img
              src={imagePreview}
              alt="Proof preview"
              style={{
                maxWidth: '100%',
                maxHeight: 300,
                display: 'block',
                margin: '0 auto',
                borderRadius: 4
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              Remove
            </button>
          </div>
        )}
      </section>

      {submitStatus === 'success' && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: 6,
          color: '#065f46',
          fontWeight: 600
        }}>
          ✅ Evidence submitted successfully to MongoDB Atlas!
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: 6,
          color: '#991b1b',
          fontWeight: 600
        }}>
          ❌ Failed to submit evidence. Please check server connection.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSubmitting ? '#94a3b8' : '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
        </button>
      </div>
    </form>
  );
}
