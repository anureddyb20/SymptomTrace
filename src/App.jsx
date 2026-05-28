import React, { useState } from 'react';
import './App.css';
import { 
  Home,
  Shield, 
  Activity, 
  BrainCircuit, 
  Calendar, 
  BarChart3, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  Heart 
} from 'lucide-react';

// Component imports
import Dashboard from './components/Dashboard';
import PrivacyCenter from './components/PrivacyCenter';
import SmartCheck from './components/SmartCheck';
import DiagnosticPreview from './components/DiagnosticPreview';
import CycleTracker from './components/CycleTracker';
import Analytics from './components/Analytics';
import ReportHub from './components/ReportHub';
import ClinicAdvocate from './components/ClinicAdvocate';
import MedicalDecoder from './components/MedicalDecoder';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [dataTrigger, setDataTrigger] = useState(0); // integer to force re-render across components

  const triggerDataRefresh = () => {
    setDataTrigger(prev => prev + 1);
  };

  const handleSurveyCompleted = () => {
    triggerDataRefresh();
    // Redirect to Diagnostic Preview automatically
    setActiveTab(3);
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, component: Dashboard },
    { name: 'Privacy Center', icon: Shield, component: PrivacyCenter },
    { name: 'Smart Check', icon: Activity, component: SmartCheck },
    { name: 'Diagnostic Preview', icon: BrainCircuit, component: DiagnosticPreview },
    { name: 'Cycle Tracker', icon: Calendar, component: CycleTracker },
    { name: 'Analytics', icon: BarChart3, component: Analytics },
    { name: 'Report Hub', icon: FileText, component: ReportHub },
    { name: 'Clinic Advocate', icon: ShieldCheck, component: ClinicAdvocate },
    { name: 'Medical Decoder', icon: BookOpen, component: MedicalDecoder }
  ];

  const ActiveComponent = menuItems[activeTab].component;

  return (
    <div className="app-container">
      {/* 1. DESKTOP SIDEBAR NAVIGATION (Hidden on mobile via CSS) */}
      <aside className="desktop-sidebar no-print">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Heart className="text-accent" size={24} fill="#87A987" />
          </div>
          <div>
            <h2 className="brand-title">Symptom-Match</h2>
            <p className="brand-tagline">Female Diagnostic Engine</p>
          </div>
        </div>

        <nav className="nav-links">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`nav-item ${activeTab === idx ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Symptom-Match v1.0</p>
          <p className="text-muted mt-1">Zero-Cloud / Sandbox Compliant</p>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM STICKY NAVIGATION (Hidden on desktop via CSS) */}
      <nav className="mobile-nav-bar no-print">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          // Shorter names for mobile navigation tags
          const mobileNames = [
            'Home', 'Privacy', 'Check', 'Preview', 'Cycle', 'Trends', 'Report', 'Advocate', 'Decode'
          ];
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`mobile-nav-item ${activeTab === idx ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{mobileNames[idx]}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN WORKSPACE */}
      <main className="main-workspace">
        <ActiveComponent 
          key={`${activeTab}-${dataTrigger}`}
          activeTab={activeTab}
          onSurveyCompleted={handleSurveyCompleted}
          onDataChanged={triggerDataRefresh}
          setActiveTab={setActiveTab}
        />
      </main>
    </div>
  );
}
