import React, { useState, useEffect } from 'react';
import { Home, Shield, Activity, Calendar, FileText, ArrowRight, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { getSymptoms, getCycleData } from '../utils/storage';

export default function Dashboard({ setActiveTab }) {
  const [symptomsList, setSymptomsList] = useState([]);
  const [cycleList, setCycleList] = useState([]);
  const [latestEntry, setLatestEntry] = useState(null);
  const [estimatedPhase, setEstimatedPhase] = useState('Not enough data');

  useEffect(() => {
    const syms = getSymptoms();
    const cycs = getCycleData();
    setSymptomsList(syms);
    setCycleList(cycs);
    if (syms.length > 0) {
      setLatestEntry(syms[0]);
    }
    calculatePhase(cycs);
  }, []);

  const calculatePhase = (cycle) => {
    const sortedPeriods = [...cycle]
      .filter(l => l.isPeriod)
      .map(l => l.date)
      .sort();

    if (sortedPeriods.length === 0) {
      setEstimatedPhase('Log periods to estimate phase');
      return;
    }

    // Get latest period start date
    const getPeriodStartDates = () => {
      const startDates = [];
      let lastDate = null;
      for (const dStr of sortedPeriods) {
        if (!lastDate) {
          startDates.push(dStr);
        } else {
          const diffDays = Math.ceil(Math.abs(new Date(dStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
          if (diffDays > 3) {
            startDates.push(dStr);
          }
        }
        lastDate = dStr;
      }
      return startDates;
    };

    const starts = getPeriodStartDates();
    if (starts.length === 0) {
      setEstimatedPhase('Log cycle start date to map phase');
      return;
    }

    const latestStartStr = starts[starts.length - 1];
    const latestStart = new Date(latestStartStr);
    const today = new Date();
    const diffTime = Math.abs(today - latestStart);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 5) {
      setEstimatedPhase('Menstrual Phase (Days 1-5) - Low estrogen and progesterone levels.');
    } else if (diffDays > 5 && diffDays <= 14) {
      setEstimatedPhase('Follicular Phase / Ovulation (Days 6-14) - Surge in estrogen, preparing follicle.');
    } else if (diffDays > 14 && diffDays <= 28) {
      setEstimatedPhase('Luteal Phase (Days 15-28) - Peak progesterone. High correlation with inflammatory flares.');
    } else {
      setEstimatedPhase('Cycle exceeding standard 28-day window. Period is likely late or cycle is long.');
    }
  };

  const getSymptomName = (key) => {
    const names = {
      pelvicPain: 'Pelvic Pain',
      abdominalPain: 'Abdominal Pain',
      fatigue: 'Fatigue',
      palpitations: 'Heart Palpitations',
      irregularBleeding: 'Irregular Bleeding',
      jointPain: 'Joint/Muscle Pain',
      bloating: 'Severe Bloating',
      brainFog: 'Brain Fog'
    };
    return names[key] || key;
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <Home className="icon-primary header-icon" size={32} />
          <div>
            <h1>Command Center</h1>
            <p className="subtitle">Symptom-Match Core Status Dashboard</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* Row 1: Privacy Shield Status */}
        <div className="card privacy-shield-status-card col-span-2">
          <div className="flex-center-gap justify-between">
            <div className="flex-center-gap">
              <div className="shield-icon-wrapper pulse-success">
                <ShieldCheck size={28} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Zero-Cloud Privacy Active</h3>
                <p className="text-xs text-muted">
                  All intimate health logs and diagnostic previews are encrypted and stored 100% locally on this device.
                </p>
              </div>
            </div>
            <span className="badge badge-success flex-center-gap"><Shield size={12} /> SECURED LOCAL</span>
          </div>
        </div>

        {/* Row 2: Left Content Area (Trends & Cycle) */}
        <div className="dashboard-main-column col-span-2">
          <div className="dashboard-section-split">
            {/* Symptom Trends Card */}
            <div className="card active-trends-card">
              <div className="card-header-with-icon">
                <Activity size={20} className="text-primary" />
                <h3>Active Symptom Summary</h3>
              </div>
              
              {latestEntry ? (
                <div className="trends-summary-content mt-3">
                  <div className="severity-banner-box">
                    <span className="label text-xs uppercase font-semibold text-muted">Latest Pain Severity:</span>
                    <div className="flex-center-gap mt-1">
                      <span className="large-severity-number text-primary font-bold">
                        {latestEntry.details?.pain?.intensity || (latestEntry.selectedSymptoms.length * 1.5)}
                      </span>
                      <span className="text-muted text-xs">/ 10</span>
                    </div>
                  </div>

                  <div className="active-symptoms-list mt-3">
                    <h5 className="text-xs uppercase font-semibold text-muted">Logged Symptom Profile:</h5>
                    <div className="flex-gap-2 flex-wrap mt-2">
                      {latestEntry.selectedSymptoms.map((sym, idx) => (
                        <span key={idx} className="badge badge-secondary">{getSymptomName(sym)}</span>
                      ))}
                    </div>
                  </div>

                  <div className="latest-log-meta mt-4 border-top-lavender pt-2 text-xs text-muted justify-between flex">
                    <span>Logs compiled: <strong>{symptomsList.length}</strong></span>
                    <span>Last entry: <strong>{new Date(latestEntry.timestamp).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="empty-state-dashboard flex-col-center py-6">
                  <AlertCircle size={32} className="text-muted mb-2" />
                  <p className="text-xs text-muted text-center">No symptom logs found in local storage.</p>
                  <button onClick={() => setActiveTab(2)} className="btn btn-outline btn-xs mt-3 flex-center-gap">
                    Compile First Log <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Cycle Status Card */}
            <div className="card cycle-status-card">
              <div className="card-header-with-icon">
                <Calendar size={20} className="text-accent" />
                <h3>Cycle & Hormone Phase</h3>
              </div>
              <div className="cycle-phase-content mt-3">
                <div className="phase-indicator-box bg-warm-preview p-3 rounded-lg border-left-plum">
                  <h4 className="text-sm font-semibold text-primary">Estimated Phase:</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{estimatedPhase}</p>
                </div>

                <div className="cycle-quick-info mt-4 text-xs text-muted justify-between flex">
                  <span>Logged Periods: <strong>{cycleList.filter(l => l.isPeriod).length} days</strong></span>
                  <span>Hormonal load: <strong>{cycleList.filter(l => l.tookContraceptive).length} logs</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Action Buttons Grid */}
        <div className="card quick-actions-card col-span-2">
          <h3>Quick-Action Command Center</h3>
          <p className="card-desc text-small">Instantly navigate to primary modules for tracking and advocacy.</p>
          <div className="quick-actions-buttons-grid mt-3">
            <button onClick={() => setActiveTab(2)} className="btn btn-outline flex-col-action">
              <Activity size={24} className="mb-2 text-primary" />
              <span>Launch Smart Check</span>
              <span className="text-xxs text-muted mt-1 text-center">Complete multi-step survey</span>
            </button>

            <button onClick={() => setActiveTab(4)} className="btn btn-outline flex-col-action">
              <Calendar size={24} className="mb-2 text-accent" />
              <span>Log Cycle Calendar</span>
              <span className="text-xxs text-muted mt-1 text-center">Log periods or contraceptives</span>
            </button>

            <button onClick={() => setActiveTab(6)} className="btn btn-outline flex-col-action">
              <FileText size={24} className="mb-2 text-warning" />
              <span>Export Medical Report</span>
              <span className="text-xxs text-muted mt-1 text-center">Print clinical consultation dossier</span>
            </button>

            <button onClick={() => setActiveTab(7)} className="btn btn-outline flex-col-action">
              <ShieldCheck size={24} className="mb-2 text-danger" />
              <span>Get Advocacy Scripts</span>
              <span className="text-xxs text-muted mt-1 text-center">Defend against medical dismissal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
