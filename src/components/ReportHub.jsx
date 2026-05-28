import React, { useState, useEffect } from 'react';
import { FileText, Printer, CheckCircle, Heart, User, ClipboardList, BookOpen } from 'lucide-react';
import { getSymptoms, getCycleData } from '../utils/storage';

export default function ReportHub() {
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [cycleLogs, setCycleLogs] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState('');
  
  useEffect(() => {
    setSymptomLogs(getSymptoms());
    setCycleLogs(getCycleData());
  }, []);

  const translateVocabulary = (text) => {
    if (!text) return 'None logged';
    let mapped = text;
    const conversions = [
      { regex: /\bbad stomach cramps\b|\bterrible stomach cramps\b|\bbad pelvic cramps\b|\bsevere period cramps\b/gi, replace: 'severe dysmenorrhea / pelvic pain' },
      { regex: /\bheavy bleeding with clots\b|\bheavy period with clots\b|\bbleeding lots\b/gi, replace: 'menorrhagia with coagulated discharge' },
      { regex: /\bracing heart when standing\b|\bheart racing standing up\b|\bheart racing when I stand\b/gi, replace: 'postural orthostatic palpitations / tachycardia' },
      { regex: /\bextreme fatigue\b|\bsuper tired\b|\bexhausted all the time\b|\bexhaustion\b/gi, replace: 'severe chronic exhaustion / physical fatigue' },
      { regex: /\bbrain fog\b|\bcannot focus\b|\bforgetful\b|\bhead fog\b/gi, replace: 'cognitive dysfunction / mental fatigue' },
      { regex: /\bbad mood before period\b|\bmood swings before period\b|\bfeeling crazy before period\b/gi, replace: 'premenstrual dysphoric flare-up' },
      { regex: /\bpain during sex\b|\bpainful sex\b|\bpain during intercourse\b/gi, replace: 'dyspareunia' },
      { regex: /\bswollen stomach\b|\bbloated belly\b|\bendo belly\b/gi, replace: 'severe abdominal distension / pelvic bloating' }
    ];

    conversions.forEach(c => {
      mapped = mapped.replace(c.regex, `[Clinical term: ${c.replace.toUpperCase()}]`);
    });
    return mapped;
  };

  const renderDetailedCharacteristics = (entry) => {
    if (!entry || !entry.details) return null;
    const details = entry.details;
    const items = [];

    if (details.pain) {
      const activeQuads = Object.keys(details.pain.quadrants).filter(q => details.pain.quadrants[q]).map(q => q.toUpperCase()).join(', ') || 'None selected';
      items.push({
        label: 'Pain Profile',
        value: `Intensity: ${details.pain.intensity}/10 | Location(s): ${activeQuads} | Frequency: ${details.pain.frequency}`
      });
    }
    if (details.fatigue) {
      items.push({
        label: 'Fatigue Profile',
        value: `Type: ${details.fatigue.type} | Sleep Resolution: ${details.fatigue.sleepRest === 'unrelieved' ? 'Unrefreshing sleep' : 'Relieved by rest'}`
      });
    }
    if (details.palpitations) {
      const triggers = Object.keys(details.palpitations.triggers).filter(t => details.palpitations.triggers[t]).join(', ') || 'None logged';
      items.push({
        label: 'Palpitation Triggers',
        value: triggers
      });
    }
    if (details.bleeding) {
      items.push({
        label: 'Bleeding Profile',
        value: `Regularity: ${details.bleeding.regularity} | Volume: ${details.bleeding.volume} | Clots: ${details.bleeding.clotSize}`
      });
    }
    if (details.digestive) {
      const gi = [];
      if (details.digestive.painBowel) gi.push('Pain during bowel movements');
      if (details.digestive.cycleLinkedIbs) gi.push('Cycle-linked IBS');
      if (details.digestive.nausea) gi.push('Nausea/Reflux');
      items.push({
        label: 'Gastrointestinal',
        value: gi.join(', ') || 'None reported'
      });
    }
    if (details.dizziness) {
      const orth = [];
      if (details.dizziness.standingUp) orth.push('Lightheadedness on standing');
      if (details.dizziness.heatIntolerance) orth.push('Heat/Shower triggered');
      if (details.dizziness.fainting) orth.push('History of fainting/syncope');
      items.push({
        label: 'Orthostatic Dizziness',
        value: orth.join(', ') || 'None reported'
      });
    }
    if (details.temperature) {
      const temp = [];
      if (details.temperature.coldIntolerance) temp.push('Cold intolerance');
      if (details.temperature.heatIntolerance) temp.push('Heat intolerance');
      if (details.temperature.hairThinning) temp.push('Hair/Eyebrow thinning');
      items.push({
        label: 'Thyroid & Temperature',
        value: temp.join(', ') || 'None reported'
      });
    }
    if (details.mood) {
      const md = [];
      if (details.mood.pmddSigns) md.push('PMDD (premenstrual dysphoric) flares');
      if (details.mood.insomnia) md.push('Cycle-linked insomnia');
      items.push({
        label: 'Neuro-Hormonal & Sleep',
        value: md.join(', ') || 'None reported'
      });
    }

    if (items.length === 0) return null;

    return (
      <div className="report-section mt-3">
        <h3 className="report-sec-title"><ClipboardList size={16} className="inline mr-1" /> PATIENT-SPECIFIC SYMPTOM CHARACTERISTICS</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Symptom Group</th>
              <th>Detailed Characteristics & Clinical Markers</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td><strong>{item.label}</strong></td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const latestSymptom = symptomLogs[0] || null;

  return (
    <div className="report-hub-container fade-in">
      {/* Hide this header when printing */}
      <div className="tab-header no-print">
        <div className="brand-logo-container">
          <FileText className="icon-primary header-icon" size={32} />
          <div>
            <h1>Report Hub</h1>
            <p className="subtitle">Compile "Doctor-Ready" Consultation Dossier</p>
          </div>
        </div>
        <button onClick={handlePrint} disabled={symptomLogs.length === 0} className="btn btn-primary flex-center-gap">
          <Printer size={16} />
          Export / Print PDF Report
        </button>
      </div>

      <div className="report-hub-grid no-print">
        {/* Editor controls */}
        <div className="card editor-card">
          <h2>Clinical Translator & Prep</h2>
          <p className="card-desc text-small">
            This module automatically compiles your local data and maps casual descriptions (like "bad cramps") into standardized clinical terminology, helping you communicate with providers effectively.
          </p>

          <div className="form-group mt-3">
            <label className="input-label">Add Custom Notes/Questions for Your Provider:</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. I want to check for endometriosis or adenomyosis. I'd like to request a pelvic ultrasound. Why does joint pain flare up right before my period?"
              className="custom-textarea"
              rows="6"
            ></textarea>
          </div>

          <div className="vocabulary-mapping-guide mt-4 border-top-lavender pt-3">
            <h4>Vocabulary Translation Map</h4>
            <p className="text-xs text-muted mb-2">How Symptom-Match maps your expressions for clinical contexts:</p>
            <div className="vocab-table">
              <div className="vocab-row header"><span>Your Description</span><span>Medical Translation</span></div>
              <div className="vocab-row"><span>"Bad stomach/period cramps"</span><span className="medical">Dysmenorrhea / Pelvic Pain</span></div>
              <div className="vocab-row"><span>"Heavy bleeding with clots"</span><span className="medical">Menorrhagia / Coagulates</span></div>
              <div className="vocab-row"><span>"Racing heart when standing"</span><span className="medical">Postural Palpitations / POTS</span></div>
              <div className="vocab-row"><span>"Pain during intercourse"</span><span className="medical">Dyspareunia</span></div>
              <div className="vocab-row"><span>"Swollen stomach / bloating"</span><span className="medical">Abdominal Distension / Endo Belly</span></div>
            </div>
          </div>
        </div>

        {/* Print Preview Container */}
        <div className="card report-preview-card">
          <div className="preview-label">Live PDF Print Preview</div>
          <div className="print-report-paper">
            {/* THIS IS THE DETAILED REPORT BLOCK THAT WILL PRINT */}
            <div className="report-print-container">
              <div className="report-header">
                <div>
                  <h1 className="report-title">CLINICAL SYMPTOM REPORT</h1>
                  <p className="report-subtitle">Symptom-Match Patient Advocacy Dossier</p>
                </div>
                <div className="report-meta text-right">
                  <div><strong>Date Compiled:</strong> {new Date().toLocaleDateString()}</div>
                  <div><strong>Patient ID:</strong> LOCAL-USER-SANDBOX</div>
                  <div><strong>Security Protocol:</strong> Client-Side Encrypted</div>
                </div>
              </div>

              <div className="report-divider"></div>

              <div className="report-section">
                <h3 className="report-sec-title"><User size={16} className="inline mr-1" /> CLINICAL PROFILE SUMMARY</h3>
                <table className="report-table">
                  <tbody>
                    <tr>
                      <td><strong>Core Symptoms Logged:</strong></td>
                      <td>
                        {latestSymptom ? latestSymptom.selectedSymptoms.map(s => {
                          const nameMap = {
                            pelvicPain: 'Pelvic Pain',
                            abdominalPain: 'Abdominal Pain',
                            fatigue: 'Fatigue',
                            palpitations: 'Heart Palpitations',
                            irregularBleeding: 'Irregular Bleeding',
                            jointPain: 'Joint/Muscle Pain',
                            bloating: 'Bloating',
                            brainFog: 'Cognitive Dysfunction',
                            digestiveIssues: 'Gastrointestinal & Bowel Issues',
                            dizziness: 'Orthostatic Dizziness / Fainting',
                            coldSensitivity: 'Thyroid & Temperature Markers',
                            moodFluctuations: 'Cycle-Linked Mood Shifts'
                          };
                          return nameMap[s] || s;
                        }).join(', ') : 'No data'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Hormone / Contraceptive Use:</strong></td>
                      <td>
                        {latestSymptom?.general?.contraceptiveUse === 'none' ? 'None (Non-hormonal)' : 
                         latestSymptom?.general?.contraceptiveUse === 'pill' ? 'Oral Contraceptives' :
                         latestSymptom?.general?.contraceptiveUse === 'iud' ? 'Hormonal IUD' : 
                         latestSymptom?.general?.contraceptiveUse === 'implant' ? 'Hormonal Implant/Injection' : 
                         latestSymptom?.general?.contraceptiveUse === 'hrt' ? 'Hormone Replacement Therapy (HRT)' : 'Not recorded'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Symptom Duration:</strong></td>
                      <td>{latestSymptom ? `${latestSymptom.general.durationMonths} months` : 'Not recorded'}</td>
                    </tr>
                    <tr>
                      <td><strong>Family Autoimmune History:</strong></td>
                      <td>{latestSymptom?.general?.familyAutoimmune === 'yes' ? 'Positive (Increased risk of systemic flares)' : 'None reported / Unknown'}</td>
                    </tr>
                    <tr>
                      <td><strong>History of Clinical Dismissal:</strong></td>
                      <td>
                        {latestSymptom?.general?.dismissalHistory === 'no' ? 'No dismissal reported' : 
                         latestSymptom?.general?.dismissalHistory === 'yes-once' ? 'Yes, at least once (told symptoms are just stress/anxiety)' :
                         latestSymptom?.general?.dismissalHistory === 'yes-multiple' ? 'Yes, multiple times by different providers' : 'Not recorded'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Pregnancy & Vascular History:</strong></td>
                      <td>
                        {latestSymptom?.general?.pregnancyComplications === 'preeclampsia' ? 'Positive (History of Preeclampsia/Gestational Hypertension)' : 
                         latestSymptom?.general?.pregnancyComplications === 'diabetes' ? 'Positive (History of Gestational Diabetes)' :
                         latestSymptom?.general?.pregnancyComplications === 'none' ? 'No pregnancy complications reported' : 'Not Applicable / Not recorded'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {renderDetailedCharacteristics(latestSymptom)}

              <div className="report-section">
                <h3 className="report-sec-title"><ClipboardList size={16} className="inline mr-1" /> VOCABULARY MAPPING & NOTES</h3>
                <div className="report-field-box">
                  <strong>Narrative History (Translated to Clinical Terminology):</strong>
                  <p className="mt-1 text-sm bg-warm-preview p-2 border-left-plum">
                    {latestSymptom?.general?.notes ? translateVocabulary(latestSymptom.general.notes) : 'No narrative history entered.'}
                  </p>
                </div>
              </div>

              <div className="report-section">
                <h3 className="report-sec-title"><BookOpen size={16} className="inline mr-1" /> CLINICAL TRACKING CORRELATIONS</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Metric Category</th>
                      <th>Logged Value</th>
                      <th>Clinical Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Symptom Records:</strong></td>
                      <td>{symptomLogs.length} total entries</td>
                      <td>Historical logging provides evidence of chronicity.</td>
                    </tr>
                    <tr>
                      <td><strong>Menstrual Flow Logs:</strong></td>
                      <td>{cycleLogs.filter(l => l.isPeriod).length} cycle dates recorded</td>
                      <td>Assists in mapping temporal flares against cycle phases.</td>
                    </tr>
                    <tr>
                      <td><strong>Synthetic Hormonal Load:</strong></td>
                      <td>{cycleLogs.filter(l => l.tookContraceptive).length} days active</td>
                      <td>Evaluates hormone-induced symptom suppression.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {doctorNotes && (
                <div className="report-section">
                  <h3 className="report-sec-title"><Heart size={16} className="inline mr-1" /> QUESTIONS & TOPICS FOR CLINICAL REVIEW</h3>
                  <div className="report-field-box text-sm bg-warm-preview p-2 border-left-plum">
                    {doctorNotes}
                  </div>
                </div>
              )}

              <div className="report-footer mt-8 border-top-lavender pt-3 text-xs text-muted text-center">
                This report is compiled by Symptom-Match Clinical Decision Support System. 
                Data is client-side encrypted and verified local-only. 
                Reference code: CDSS-F-09
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER INVISIBLE IN MAIN WINDOW, DISPLAY ONLY FOR PRINT PREVIEW */}
      <div className="only-print">
        <div className="report-print-container">
          <div className="report-header">
            <div>
              <h1 className="report-title">CLINICAL SYMPTOM REPORT</h1>
              <p className="report-subtitle">Symptom-Match Patient Advocacy Dossier</p>
            </div>
            <div className="report-meta text-right">
              <div><strong>Date Compiled:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>Patient ID:</strong> LOCAL-USER-SANDBOX</div>
              <div><strong>Security Protocol:</strong> Client-Side Encrypted</div>
            </div>
          </div>

          <div className="report-divider"></div>

          <div className="report-section">
            <h3 className="report-sec-title"><User size={16} className="inline mr-1" /> CLINICAL PROFILE SUMMARY</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Core Symptoms Logged:</strong></td>
                  <td>
                    {latestSymptom ? latestSymptom.selectedSymptoms.map(s => {
                      const nameMap = {
                        pelvicPain: 'Pelvic Pain',
                        abdominalPain: 'Abdominal Pain',
                        fatigue: 'Fatigue',
                        palpitations: 'Heart Palpitations',
                        irregularBleeding: 'Irregular Bleeding',
                        jointPain: 'Joint/Muscle Pain',
                        bloating: 'Bloating',
                        brainFog: 'Cognitive Dysfunction',
                        digestiveIssues: 'Gastrointestinal & Bowel Issues',
                        dizziness: 'Orthostatic Dizziness / Fainting',
                        coldSensitivity: 'Thyroid & Temperature Markers',
                        moodFluctuations: 'Cycle-Linked Mood Shifts'
                      };
                      return nameMap[s] || s;
                    }).join(', ') : 'No data'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Hormone / Contraceptive Use:</strong></td>
                  <td>
                    {latestSymptom?.general?.contraceptiveUse === 'none' ? 'None (Non-hormonal)' : 
                     latestSymptom?.general?.contraceptiveUse === 'pill' ? 'Oral Contraceptives' :
                     latestSymptom?.general?.contraceptiveUse === 'iud' ? 'Hormonal IUD' : 
                     latestSymptom?.general?.contraceptiveUse === 'implant' ? 'Hormonal Implant/Injection' : 
                     latestSymptom?.general?.contraceptiveUse === 'hrt' ? 'Hormone Replacement Therapy (HRT)' : 'Not recorded'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Symptom Duration:</strong></td>
                  <td>{latestSymptom ? `${latestSymptom.general.durationMonths} months` : 'Not recorded'}</td>
                </tr>
                <tr>
                  <td><strong>Family Autoimmune History:</strong></td>
                  <td>{latestSymptom?.general?.familyAutoimmune === 'yes' ? 'Positive (Increased risk of systemic flares)' : 'None reported / Unknown'}</td>
                </tr>
                <tr>
                  <td><strong>History of Clinical Dismissal:</strong></td>
                  <td>
                    {latestSymptom?.general?.dismissalHistory === 'no' ? 'No dismissal reported' : 
                     latestSymptom?.general?.dismissalHistory === 'yes-once' ? 'Yes, at least once (told symptoms are just stress/anxiety)' :
                     latestSymptom?.general?.dismissalHistory === 'yes-multiple' ? 'Yes, multiple times by different providers' : 'Not recorded'}
                  </td>
                </tr>
                <tr>
                  <td><strong>Pregnancy & Vascular History:</strong></td>
                  <td>
                    {latestSymptom?.general?.pregnancyComplications === 'preeclampsia' ? 'Positive (History of Preeclampsia/Gestational Hypertension)' : 
                     latestSymptom?.general?.pregnancyComplications === 'diabetes' ? 'Positive (History of Gestational Diabetes)' :
                     latestSymptom?.general?.pregnancyComplications === 'none' ? 'No pregnancy complications reported' : 'Not Applicable / Not recorded'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {renderDetailedCharacteristics(latestSymptom)}

          <div className="report-section">
            <h3 className="report-sec-title"><ClipboardList size={16} className="inline mr-1" /> VOCABULARY MAPPING & NOTES</h3>
            <div className="report-field-box">
              <strong>Narrative History (Translated to Clinical Terminology):</strong>
              <p className="mt-1 text-sm bg-warm-preview p-2 border-left-plum">
                {latestSymptom?.general?.notes ? translateVocabulary(latestSymptom.general.notes) : 'No narrative history entered.'}
              </p>
            </div>
          </div>

          <div className="report-section">
            <h3 className="report-sec-title"><BookOpen size={16} className="inline mr-1" /> CLINICAL TRACKING CORRELATIONS</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Metric Category</th>
                  <th>Logged Value</th>
                  <th>Clinical Context</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Symptom Records:</strong></td>
                  <td>{symptomLogs.length} total entries</td>
                  <td>Historical logging provides evidence of chronicity.</td>
                </tr>
                <tr>
                  <td><strong>Menstrual Flow Logs:</strong></td>
                  <td>{cycleLogs.filter(l => l.isPeriod).length} cycle dates recorded</td>
                  <td>Assists in mapping temporal flares against cycle phases.</td>
                </tr>
                <tr>
                  <td><strong>Synthetic Hormonal Load:</strong></td>
                  <td>{cycleLogs.filter(l => l.tookContraceptive).length} days active</td>
                  <td>Evaluates hormone-induced symptom suppression.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {doctorNotes && (
            <div className="report-section">
              <h3 className="report-sec-title"><Heart size={16} className="inline mr-1" /> QUESTIONS & TOPICS FOR CLINICAL REVIEW</h3>
              <div className="report-field-box text-sm bg-warm-preview p-2 border-left-plum">
                {doctorNotes}
              </div>
            </div>
          )}

          <div className="report-footer mt-8 border-top-lavender pt-3 text-xs text-muted text-center">
            This report is compiled by Symptom-Match Clinical Decision Support System. 
            Data is client-side encrypted and verified local-only. 
            Reference code: CDSS-F-09
          </div>
        </div>
      </div>
    </div>
  );
}
