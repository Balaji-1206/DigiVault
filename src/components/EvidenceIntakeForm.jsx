import React, { useMemo, useState } from 'react';

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

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      // Fallback for quick wiring tests.
      console.log('Evidence intake payload', payload);
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
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          type="submit"
          style={{
            background: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Submit Evidence
        </button>
      </div>
    </form>
  );
}
