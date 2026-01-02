import React from 'react'
import EvidenceIntakeForm from './components/EvidenceIntakeForm'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DigiVault</h1>
        <p>Digital Evidences Integrity Management System</p>
      </header>
      <main>
        <EvidenceIntakeForm 
          officerId="OFF-2025-001"
          officerName="AADHISH S"
          stationUnit="Central Police Station - Cyber Crime Division"
          rank="Commissioner of Police"
        />
      </main>
    </div>
  )
}

export default App
