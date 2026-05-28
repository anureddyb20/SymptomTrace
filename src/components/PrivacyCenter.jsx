import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Download, Upload, AlertTriangle, CheckCircle, Database, FileCode } from 'lucide-react';
import { getSymptoms, getCycleData, clearAllLocalData, exportDataJSON, importDataJSON } from '../utils/storage';

export default function PrivacyCenter({ onDataChanged }) {
  const [symptomCount, setSymptomCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [rawDbData, setRawDbData] = useState('');
  const [importStatus, setImportStatus] = useState(null); // { success: boolean, msg: string }
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = () => {
    const sym = getSymptoms();
    const cyc = getCycleData();
    setSymptomCount(sym.length);
    setCycleCount(cyc.length);
    setRawDbData(exportDataJSON());
  };

  const handleClearData = () => {
    clearAllLocalData();
    refreshStats();
    setShowConfirmClear(false);
    if (onDataChanged) onDataChanged();
    setImportStatus({ success: true, msg: 'All local health records have been permanently wiped from this browser.' });
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleExport = () => {
    const dataStr = exportDataJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `symptom_match_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const result = importDataJSON(event.target.result);
      if (result.success) {
        refreshStats();
        if (onDataChanged) onDataChanged();
        setImportStatus({
          success: true,
          msg: `Successfully imported: ${result.symptomCount} symptom entries and ${result.cycleCount} cycle logs.`,
        });
      } else {
        setImportStatus({
          success: false,
          msg: `Import failed: ${result.error || 'Invalid file format'}`,
        });
      }
      setTimeout(() => setImportStatus(null), 6000);
    };
    fileReader.readAsText(file);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawDbData);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="privacy-center-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <Shield className="icon-primary header-icon" size={32} />
          <div>
            <h1>Privacy Center</h1>
            <p className="subtitle">Zero-Cloud Privacy & Local Storage Shield</p>
          </div>
        </div>
      </div>

      <div className="privacy-dashboard-grid">
        {/* Privacy Assurance Banner */}
        <div className="card privacy-shield-card col-span-2">
          <div className="shield-banner">
            <div className="shield-badge">
              <Shield size={48} className="shield-icon" />
              <span className="secure-badge-label">100% LOCAL</span>
            </div>
            <div className="shield-text">
              <h3>Your Intimate Health Data Never Leaves Your Device</h3>
              <p>
                Symptom-Match is engineered as a zero-cloud application. We do not use external trackers, cloud databases, 
                or account profiles. All tracking data, diagnostic simulations, and logs are kept strictly 
                within your browser's localized storage sandbox.
              </p>
              <div className="confirmation-checklist">
                <div className="chk-item"><CheckCircle size={16} className="text-success" /> No Sign-up/Email Required</div>
                <div className="chk-item"><CheckCircle size={16} className="text-success" /> No Remote API Logs</div>
                <div className="chk-item"><CheckCircle size={16} className="text-success" /> HIPAA Compliant Local Storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Metrics Card */}
        <div className="card stats-card">
          <div className="card-header-with-icon">
            <Database className="text-primary" size={24} />
            <h2>Stored Records Metric</h2>
          </div>
          <p className="card-desc text-small">Review the quantities of individual records compiled locally inside your browser.</p>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-name">Symptom Log Entries:</span>
              <span className="metric-val">{symptomCount}</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Menstrual/Contraceptive Logs:</span>
              <span className="metric-val">{cycleCount}</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Storage Engine:</span>
              <span className="metric-val font-mono">localStorage</span>
            </div>
          </div>
        </div>

        {/* Control Actions Card */}
        <div className="card controls-card">
          <div className="card-header-with-icon">
            <Trash2 className="text-danger" size={24} />
            <h2>Data Management Controls</h2>
          </div>
          <p className="card-desc text-small">Backup your records, import a previous profile, or wipe your medical records permanently.</p>
          
          {importStatus && (
            <div className={`status-banner ${importStatus.success ? 'banner-success' : 'banner-danger'}`}>
              {importStatus.msg}
            </div>
          )}

          <div className="button-group-vertical">
            <button onClick={handleExport} className="btn btn-outline flex-center-gap">
              <Download size={18} />
              Export Backup (.JSON)
            </button>

            <label className="btn btn-outline flex-center-gap cursor-pointer text-center">
              <Upload size={18} />
              Import Backup (.JSON)
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            {!showConfirmClear ? (
              <button onClick={() => setShowConfirmClear(true)} className="btn btn-danger flex-center-gap">
                <Trash2 size={18} />
                Wipe Local Database
              </button>
            ) : (
              <div className="confirm-clear-box">
                <p className="text-danger flex-center-gap font-semibold">
                  <AlertTriangle size={18} /> Are you absolutely sure?
                </p>
                <p className="text-xs text-muted mb-2">This will permanently delete all logged symptoms and cycle tracking records. There is no undo.</p>
                <div className="flex-gap-2">
                  <button onClick={handleClearData} className="btn btn-danger-confirm btn-sm">Yes, Permanently Delete</button>
                  <button onClick={() => setShowConfirmClear(false)} className="btn btn-outline btn-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JSON Inspector Card */}
        <div className="card db-inspector-card col-span-2">
          <div className="card-header-with-icon justify-between">
            <div className="flex-center-gap">
              <FileCode className="text-primary" size={24} />
              <h2>Browser Database Inspector</h2>
            </div>
            <button onClick={handleCopyRaw} className="btn btn-outline btn-xs">
              {copiedText ? 'Copied!' : 'Copy Raw Database'}
            </button>
          </div>
          <p className="card-desc text-small">
            Below is the exact JSON structure stored inside your browser's local sandbox. You can audit this data directly to verify no personal details are processed elsewhere.
          </p>
          <div className="json-editor-container">
            <pre className="json-display">
              <code>{rawDbData || '{\n  "empty": true\n}'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
