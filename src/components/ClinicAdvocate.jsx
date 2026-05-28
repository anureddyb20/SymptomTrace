import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, Copy, ShieldAlert, Award, PlayCircle, Eye, EyeOff } from 'lucide-react';

export default function ClinicAdvocate() {
  const [selectedScenario, setSelectedScenario] = useState('cramps');
  const [testName, setTestName] = useState('Pelvic MRI to rule out deep infiltrating endometriosis');
  const [copied, setCopied] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceResponse, setPracticeResponse] = useState('');
  const [submittedPractice, setSubmittedPractice] = useState(false);

  const scenarios = {
    cramps: {
      title: 'Dismissing Severe Pain as "Normal"',
      description: 'Use this script when a doctor tells you that severe, debilitating period cramps or pelvic aches are "just part of being a woman" or "normal period pain."',
      script: '“While I understand that moderate menstrual cramping is common, the pain intensity I am experiencing (logging at a severe level) interferes with my basic daily functioning and does not respond to standard over-the-counter NSAIDs. Given that this degree of dysmenorrhea is a clinical indicator for structural anomalies like endometriosis or adenomyosis, I would like to outline a diagnostic pathway. What diagnostic imaging or referral can we initiate today to rule these conditions out?”'
    },
    anxiety: {
      title: 'Attributing Physical Symptoms to "Stress/Anxiety"',
      description: 'Use this script when physical symptoms (like racing heart, chronic exhaustion, joint pain) are dismissed as panic attacks, stress, or psychological anxiety.',
      script: '“I appreciate that stress and anxiety can affect physiology, but my physical symptoms—specifically the palpitations, joint flares, and profound fatigue—occur independently of my mental state and follow clear cyclical timelines. In order to provide comprehensive care, I would like to rule out organic, systemic causes before attributing this to a psychiatric diagnosis. Let\'s review what serology or specialized workups are standard to rule out dysautonomia or autoimmune disease.”'
    },
    normal_labs: {
      title: 'Dismissal Because "Your Blood Work is Normal"',
      description: 'Use this script when a provider tells you everything is fine because a basic blood count or metabolic panel was within normal reference ranges.',
      script: '“I am glad my basic blood panels are normal, but standard metabolic panels do not screen for autoimmune conditions, hormonal imbalances, or localized pelvic lesions. Since my symptoms persist and continue to impact my quality of life, a normal basic CBC does not rule out underlying conditions. What advanced panels—such as Thyroid Peroxidase Antibodies (TPO), free/total testosterone levels, or specific autoimmune markers—can we order to get a complete picture?”'
    },
    refusal: {
      title: 'Provider Refuses to Order a Specific Diagnostic Test',
      description: 'Use this script when you request a diagnostic test (e.g., pelvic ultrasound, tilt table test, or specific blood draw) and the doctor refuses.',
      script: `“I understand that you do not feel a ${testName || 'requested test'} is clinically indicated at this moment. However, as this test is crucial for my diagnostic peace of mind and is standard protocol for these symptoms, I would like to request that you explicitly document my request for this test, along with your clinical rationale for refusal, in my official medical chart. I would also like a printout of today's visit notes before I leave.”`
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    if (!practiceResponse.trim()) return;
    setSubmittedPractice(true);
  };

  const getEncouragement = () => {
    const feedback = [
      "Excellent. You spoke clearly and stood your ground.",
      "Powerful response. Asserting your boundaries in a clinical setting is a form of self-care.",
      "Well done! You redirected the conversation back to objective diagnostic milestones."
    ];
    return feedback[Math.floor(Math.random() * feedback.length)];
  };

  return (
    <div className="clinic-advocate-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <ShieldCheck className="icon-primary header-icon" size={32} />
          <div>
            <h1>Clinic Advocate</h1>
            <p className="subtitle">The Gaslighting Defense & Self-Advocacy Script Generator</p>
          </div>
        </div>
      </div>

      <div className="advocate-dashboard-grid">
        {/* Scenarios and Script Generator Card */}
        <div className="card advocate-card col-span-2">
          <div className="card-header-with-icon">
            <MessageSquare className="text-primary" size={24} />
            <h2>Advocacy Script Generator</h2>
          </div>
          <p className="card-desc text-small">
            Select a scenario below to generate a professional, assertive, and clinically sound script that you can use to counter provider bias.
          </p>

          <div className="scenario-selector-tabs mt-3">
            <button 
              onClick={() => { setSelectedScenario('cramps'); setPracticeMode(false); setSubmittedPractice(false); }}
              className={`btn btn-sm ${selectedScenario === 'cramps' ? 'btn-primary' : 'btn-outline'}`}
            >
              Normal Pain Dismissal
            </button>
            <button 
              onClick={() => { setSelectedScenario('anxiety'); setPracticeMode(false); setSubmittedPractice(false); }}
              className={`btn btn-sm ${selectedScenario === 'anxiety' ? 'btn-primary' : 'btn-outline'}`}
            >
              "Just Anxiety"
            </button>
            <button 
              onClick={() => { setSelectedScenario('normal_labs'); setPracticeMode(false); setSubmittedPractice(false); }}
              className={`btn btn-sm ${selectedScenario === 'normal_labs' ? 'btn-primary' : 'btn-outline'}`}
            >
              "Labs are Normal"
            </button>
            <button 
              onClick={() => { setSelectedScenario('refusal'); setPracticeMode(false); setSubmittedPractice(false); }}
              className={`btn btn-sm ${selectedScenario === 'refusal' ? 'btn-primary' : 'btn-outline'}`}
            >
              Refusing Tests
            </button>
          </div>

          <div className="script-generation-container mt-4 border-top-lavender pt-4">
            <div className="scenario-details">
              <h3>{scenarios[selectedScenario].title}</h3>
              <p className="text-xs text-muted mb-3">{scenarios[selectedScenario].description}</p>
            </div>

            {selectedScenario === 'refusal' && (
              <div className="form-group mb-3 bg-lavender-light p-3 rounded-lg border-left-plum">
                <label className="input-label text-xs">Specify the test you are requesting:</label>
                <input 
                  type="text" 
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Pelvic MRI, standing Tilt Table test"
                  className="custom-input bg-white"
                />
              </div>
            )}

            <div className="generated-script-box">
              <p className="script-text italic font-serif">
                {scenarios[selectedScenario].script}
              </p>
              <div className="script-actions justify-between border-top-lavender pt-3 mt-3">
                <button 
                  onClick={() => setPracticeMode(!practiceMode)} 
                  className="btn btn-outline btn-sm flex-center-gap"
                >
                  <PlayCircle size={16} />
                  {practiceMode ? 'Close Practice Mode' : 'Practice Saying This'}
                </button>
                <button 
                  onClick={() => handleCopy(scenarios[selectedScenario].script)} 
                  className="btn btn-primary btn-sm flex-center-gap"
                >
                  <Copy size={16} />
                  {copied ? 'Copied to Clipboard!' : 'Copy Script'}
                </button>
              </div>
            </div>

            {/* Practice Arena */}
            {practiceMode && (
              <div className="practice-arena-box mt-4 border-top-lavender pt-4 fade-in">
                <h4>Advocacy Practice Lounge</h4>
                <p className="text-xs text-muted">
                  Rehearse this aloud. Try typing how you would respond to the doctor if they push back, or type notes to consolidate your thoughts.
                </p>
                
                <form onSubmit={handlePracticeSubmit} className="mt-3">
                  <div className="form-group">
                    <label className="input-label">Imagine the doctor responds: <em>"We want to avoid unnecessary testing."</em> Type your rebuttal:</label>
                    <textarea
                      value={practiceResponse}
                      onChange={(e) => { setPracticeResponse(e.target.value); setSubmittedPractice(false); }}
                      placeholder="e.g. I hear you, but the impact of this pain justifies finding a definitive answer rather than waiting. Let's document this refusal in my record."
                      className="custom-textarea"
                      rows="3"
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-outline btn-sm mt-2">Submit and Get Tips</button>
                </form>

                {submittedPractice && (
                  <div className="alert-card note-banner mt-3 fade-in">
                    <div className="flex-center-gap">
                      <Award className="text-accent" size={18} />
                      <span className="font-semibold text-xs text-accent-dark">{getEncouragement()}</span>
                    </div>
                    <p className="text-xs mt-1">
                      <strong>Tip:</strong> Always maintain eye contact, hold your compiled report from the Report Hub in your lap, and use "I" statements paired with logged quantities. For example: <em>"My records indicate this has happened for 18 consecutive cycle days, which exceeds normal physiologic fluctuations."</em>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advocacy Info Panel */}
        <div className="info-sidebar-panel">
          <div className="card educational-card bg-plum text-white">
            <h3 className="text-white">Why Advocate?</h3>
            <p className="text-xs leading-relaxed mt-2">
              Medical gaslighting occurs when physical symptoms are dismissed, downplayed, or attributed entirely to psychological factors without proper testing. 
            </p>
            <p className="text-xs leading-relaxed mt-2">
              In women's health, this contributes significantly to delayed diagnosis timelines. Having standardized terminology and a direct response script changes the power dynamic in the exam room.
            </p>
            <div className="alert-card warning-banner bg-plum-dark border-plum-light mt-4 text-xs text-white">
              <ShieldAlert className="text-warning flex-shrink-0" size={18} />
              <span>
                <strong>Charting is legal documentation:</strong> If a doctor refuses to order a test, requesting them to document their refusal in your record forces them to take accountability. Many doctors will order the test rather than sign off on a refusal of standard care.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
