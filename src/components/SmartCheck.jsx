import React, { useState } from 'react';
import { Activity, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { saveSymptomEntry } from '../utils/storage';

export default function SmartCheck({ onSurveyCompleted }) {
  const [step, setStep] = useState(1);
  
  // Questionnaire state
  const [symptoms, setSymptoms] = useState({
    pelvicPain: false,
    abdominalPain: false,
    fatigue: false,
    palpitations: false,
    irregularBleeding: false,
    jointPain: false,
    bloating: false,
    brainFog: false,
  });

  const [painDetails, setPainDetails] = useState({
    intensity: 5,
    quadrants: {
      luq: false, // Left Upper
      ruq: false, // Right Upper
      llq: false, // Left Lower
      rlq: false, // Right Lower
      suprapubic: false, // Lower Pelvic
    },
    frequency: 'cyclical', // cyclical, constant, intermittent, postcoital
  });

  const [fatigueDetails, setFatigueDetails] = useState({
    type: 'both', // mental, physical, both
    sleepRest: 'unrelieved', // relieved, unrelieved
  });

  const [palpDetails, setPalpDetails] = useState({
    triggers: {
      resting: false,
      postural: false,
      lutealPhase: false,
      postprandial: false,
    }
  });

  const [generalFactors, setGeneralFactors] = useState({
    durationMonths: '1', // <1, 1-6, 6-12, 12+
    familyAutoimmune: 'no', // yes, no, unsure
    contraceptiveUse: 'none', // pill, iud, implant, none
    notes: '',
  });

  const handleSymptomToggle = (key) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuadrantToggle = (key) => {
    setPainDetails(prev => ({
      ...prev,
      quadrants: {
        ...prev.quadrants,
        [key]: !prev.quadrants[key]
      }
    }));
  };

  const handlePalpTriggerToggle = (key) => {
    setPalpDetails(prev => ({
      ...prev,
      triggers: {
        ...prev.triggers,
        [key]: !prev.triggers[key]
      }
    }));
  };

  // Determine if conditional step is needed
  // Conditional step is needed if pelvicPain, abdominalPain, fatigue, or palpitations are checked.
  const hasConditionalSymptoms = symptoms.pelvicPain || symptoms.abdominalPain || symptoms.fatigue || symptoms.palpitations;

  const totalSteps = hasConditionalSymptoms ? 3 : 2;

  const nextStep = () => {
    if (step === 1) {
      // Validate that at least one symptom is checked
      const checkedCount = Object.values(symptoms).filter(Boolean).length;
      if (checkedCount === 0) {
        alert('Please select at least one symptom to proceed.');
        return;
      }
      setStep(2);
    } else if (step === 2 && totalSteps === 3) {
      setStep(3);
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const submitForm = () => {
    const logData = {
      selectedSymptoms: Object.keys(symptoms).filter(k => symptoms[k]),
      details: {
        pain: (symptoms.pelvicPain || symptoms.abdominalPain) ? painDetails : null,
        fatigue: symptoms.fatigue ? fatigueDetails : null,
        palpitations: symptoms.palpitations ? palpDetails : null,
      },
      general: generalFactors,
    };

    saveSymptomEntry(logData);
    if (onSurveyCompleted) {
      onSurveyCompleted();
    }
  };

  // UI calculations
  const progressPercent = Math.min((step / totalSteps) * 100, 100);

  return (
    <div className="smart-check-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <Activity className="icon-primary header-icon" size={32} />
          <div>
            <h1>Smart Check</h1>
            <p className="subtitle">Clinical Diagnostic Wizard & Adaptive Log</p>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="progress-tracker-card card">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-labels">
          <span className={`step-badge ${step >= 1 ? 'active' : ''}`}>1. Core Symptoms</span>
          {hasConditionalSymptoms && (
            <span className={`step-badge ${step >= 2 ? 'active' : ''}`}>2. Symptom Details</span>
          )}
          <span className={`step-badge ${step === totalSteps ? 'active' : ''}`}>
            {totalSteps === 3 ? '3. Health Context' : '2. Health Context'}
          </span>
        </div>
      </div>

      <div className="card wizard-form-card">
        {/* STEP 1: CORE SYMPTOMS */}
        {step === 1 && (
          <div className="wizard-step-content fade-in">
            <h2>Select All Symptoms You Have Experienced Recently</h2>
            <p className="wizard-desc">
              We look specifically at markers relevant to female endocrine, autoimmune, cardiac, and gynecological pathways. Select all that apply.
            </p>

            <div className="symptoms-grid-select">
              <div 
                className={`symptom-select-card ${symptoms.pelvicPain ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('pelvicPain')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Pelvic Pain</h4>
                <p>Severe cramps, deep pelvic ache, lower back pain, or painful intercourse.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.abdominalPain ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('abdominalPain')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Abdominal Pain</h4>
                <p>Sharp, dull, cyclical, or generalized discomfort below the ribs.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.fatigue ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('fatigue')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Fatigue</h4>
                <p>Profound exhaustion that doesn't resolve with rest or sleep.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.palpitations ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('palpitations')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Heart Palpitations</h4>
                <p>Fluttering, racing, skipped beats, especially during rest or hormonal shifts.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.irregularBleeding ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('irregularBleeding')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Irregular / Heavy Bleeding</h4>
                <p>Spotting between cycles, heavy bleeding (menorrhagia), or skipped cycles.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.jointPain ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('jointPain')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Joint or Muscle Pain</h4>
                <p>Generalized aches, joint stiffness, or migratory nerve/muscle pain.</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.bloating ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('bloating')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Severe Bloating</h4>
                <p>Pronounced swelling of abdomen, cycle-linked, often called "endo belly".</p>
              </div>

              <div 
                className={`symptom-select-card ${symptoms.brainFog ? 'selected' : ''}`}
                onClick={() => handleSymptomToggle('brainFog')}
              >
                <div className="checkbox-indicator"></div>
                <h4>Brain Fog & Memory Issues</h4>
                <p>Difficulty concentrating, word-finding gaps, or severe cognitive fatigue.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 (CONDITIONAL): SPECIFIC DETAILS */}
        {step === 2 && hasConditionalSymptoms && (
          <div className="wizard-step-content fade-in">
            <h2>Specify Symptom Characteristics</h2>
            <p className="wizard-desc">
              Your subsequent questions have adapted to capture crucial details regarding your primary symptom selections.
            </p>

            {/* Pain Details */}
            {(symptoms.pelvicPain || symptoms.abdominalPain) && (
              <div className="detail-section card inner-card">
                <h3>Pain Details & Location</h3>
                <div className="form-group">
                  <label className="input-label">Pain Intensity Slider: <span className="font-semibold text-primary">{painDetails.intensity} / 10</span></label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={painDetails.intensity} 
                    onChange={(e) => setPainDetails(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="custom-range"
                  />
                  <div className="slider-labels">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Select Pain Quadrants (Location):</label>
                  <div className="quadrant-grid">
                    <button 
                      type="button" 
                      className={`quad-btn ${painDetails.quadrants.ruq ? 'active' : ''}`}
                      onClick={() => handleQuadrantToggle('ruq')}
                    >
                      RUQ (Right Upper)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${painDetails.quadrants.luq ? 'active' : ''}`}
                      onClick={() => handleQuadrantToggle('luq')}
                    >
                      LUQ (Left Upper)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${painDetails.quadrants.rlq ? 'active' : ''}`}
                      onClick={() => handleQuadrantToggle('rlq')}
                    >
                      RLQ (Right Lower / Appendix / Ovary)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${painDetails.quadrants.llq ? 'active' : ''}`}
                      onClick={() => handleQuadrantToggle('llq')}
                    >
                      LLQ (Left Lower / Colon / Ovary)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${painDetails.quadrants.suprapubic ? 'active' : ''}`}
                      onClick={() => handleQuadrantToggle('suprapubic')}
                    >
                      Suprapubic / Pelvic (Lower Uterus / Bladder)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Pain Pattern & Frequency:</label>
                  <div className="radio-group-vertical">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="painFreq" 
                        value="cyclical"
                        checked={painDetails.frequency === 'cyclical'}
                        onChange={(e) => setPainDetails(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                      <span><strong>Cyclical:</strong> Flares up specifically around period or ovulation windows</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="painFreq" 
                        value="constant"
                        checked={painDetails.frequency === 'constant'}
                        onChange={(e) => setPainDetails(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                      <span><strong>Constant:</strong> Present almost every day, independent of cycle</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="painFreq" 
                        value="intermittent"
                        checked={painDetails.frequency === 'intermittent'}
                        onChange={(e) => setPainDetails(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                      <span><strong>Intermittent:</strong> Comes and goes randomly without calendar links</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="painFreq" 
                        value="postcoital"
                        checked={painDetails.frequency === 'postcoital'}
                        onChange={(e) => setPainDetails(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                      <span><strong>Deep / Post-Coital:</strong> Triggered during or immediately after intercourse</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Fatigue Details */}
            {symptoms.fatigue && (
              <div className="detail-section card inner-card mt-4">
                <h3>Fatigue Profile</h3>
                <div className="form-group">
                  <label className="input-label">Primary Fatigue Type:</label>
                  <div className="radio-group">
                    <button 
                      type="button" 
                      className={`quad-btn ${fatigueDetails.type === 'physical' ? 'active' : ''}`}
                      onClick={() => setFatigueDetails(prev => ({ ...prev, type: 'physical' }))}
                    >
                      Physical (Heavy limbs, muscular weakness)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${fatigueDetails.type === 'mental' ? 'active' : ''}`}
                      onClick={() => setFatigueDetails(prev => ({ ...prev, type: 'mental' }))}
                    >
                      Mental (Unable to focus, sleepiness)
                    </button>
                    <button 
                      type="button" 
                      className={`quad-btn ${fatigueDetails.type === 'both' ? 'active' : ''}`}
                      onClick={() => setFatigueDetails(prev => ({ ...prev, type: 'both' }))}
                    >
                      Combined (Severe total exhaustion)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Does Sleep or Resting Resolve It?</label>
                  <div className="radio-group-vertical">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="fatigueRest" 
                        value="relieved"
                        checked={fatigueDetails.sleepRest === 'relieved'}
                        onChange={(e) => setFatigueDetails(prev => ({ ...prev, sleepRest: e.target.value }))}
                      />
                      <span>Yes, rest or an extra night of sleep helps restore my energy</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="fatigueRest" 
                        value="unrelieved"
                        checked={fatigueDetails.sleepRest === 'unrelieved'}
                        onChange={(e) => setFatigueDetails(prev => ({ ...prev, sleepRest: e.target.value }))}
                      />
                      <span>No, I wake up feeling just as exhausted as when I went to bed (Unrefreshing sleep)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Heart Palpitations Details */}
            {symptoms.palpitations && (
              <div className="detail-section card inner-card mt-4">
                <h3>Heart Palpitation Triggers</h3>
                <div className="form-group">
                  <label className="input-label">Select When Palpitations Occur Most (Atypical Female Markers):</label>
                  <div className="symptom-check-list">
                    <label className="check-option">
                      <input 
                        type="checkbox"
                        checked={palpDetails.triggers.resting}
                        onChange={() => handlePalpTriggerToggle('resting')}
                      />
                      <span><strong>Occur at Rest:</strong> Racing starts while sitting, reading, or lying down, rather than during exercise.</span>
                    </label>

                    <label className="check-option">
                      <input 
                        type="checkbox"
                        checked={palpDetails.triggers.postural}
                        onChange={() => handlePalpTriggerToggle('postural')}
                      />
                      <span><strong>Postural Shifts:</strong> Heart races or flutters immediately upon standing up, accompanied by dizziness.</span>
                    </label>

                    <label className="check-option">
                      <input 
                        type="checkbox"
                        checked={palpDetails.triggers.lutealPhase}
                        onChange={() => handlePalpTriggerToggle('lutealPhase')}
                      />
                      <span><strong>Cycle-Linked:</strong> Palpitations increase noticeably during the Luteal phase (days 15-28) or right before period.</span>
                    </label>

                    <label className="check-option">
                      <input 
                        type="checkbox"
                        checked={palpDetails.triggers.postprandial}
                        onChange={() => handlePalpTriggerToggle('postprandial')}
                      />
                      <span><strong>After Eating:</strong> Flutters or spikes happen shortly after eating a heavy meal.</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 (OR 2 IF NO DYNAMIC SYMPTOMS): GENERAL CONTEXT */}
        {((step === 2 && !hasConditionalSymptoms) || step === 3) && (
          <div className="wizard-step-content fade-in">
            <h2>General Health & Family History Context</h2>
            <p className="wizard-desc">
              These factors help isolate systemic autoimmune patterns and chronic hormonal dynamics that frequently affect diagnosis timelines.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label className="input-label">Symptom Duration:</label>
                <select 
                  value={generalFactors.durationMonths}
                  onChange={(e) => setGeneralFactors(prev => ({ ...prev, durationMonths: e.target.value }))}
                  className="custom-select"
                >
                  <option value="1">Less than 1 month</option>
                  <option value="1-6">1 to 6 months</option>
                  <option value="6-12">6 to 12 months</option>
                  <option value="12+">More than 1 year (Chronic)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Family History of Autoimmune Conditions?</label>
                <select 
                  value={generalFactors.familyAutoimmune}
                  onChange={(e) => setGeneralFactors(prev => ({ ...prev, familyAutoimmune: e.target.value }))}
                  className="custom-select"
                >
                  <option value="no">No known history</option>
                  <option value="yes">Yes (Thyroid, Lupus, MS, Rheumatoid Arthritis, Celiac, etc.)</option>
                  <option value="unsure">Unsure / Not discussed in family</option>
                </select>
                <p className="text-xs text-muted mt-1"><Info size={12} className="inline mr-1" /> Autoimmune conditions are 4x more prevalent in females.</p>
              </div>

              <div className="form-group col-span-2">
                <label className="input-label">Current Synthetic Hormone or Contraceptive Use:</label>
                <select 
                  value={generalFactors.contraceptiveUse}
                  onChange={(e) => setGeneralFactors(prev => ({ ...prev, contraceptiveUse: e.target.value }))}
                  className="custom-select"
                >
                  <option value="none">None / Non-hormonal</option>
                  <option value="pill">Oral Contraceptive (Combined / Progestin-only Pill)</option>
                  <option value="iud">Hormonal IUD (Mirena, Kyleena, etc.)</option>
                  <option value="implant">Hormonal Implant or Injection (Nexplanon / Depo)</option>
                  <option value="hrt">Hormone Replacement Therapy (HRT)</option>
                </select>
                <p className="text-xs text-muted mt-1">Hormonal contraceptives can temporarily mask underlying conditions like Endometriosis or PCOS.</p>
              </div>

              <div className="form-group col-span-2">
                <label className="input-label">Custom Notes & Descriptions (Describe in your own words):</label>
                <textarea
                  value={generalFactors.notes}
                  onChange={(e) => setGeneralFactors(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. stomach feels swollen like a balloon before my period; racing heart when standing up to wash dishes; doctor told me it's just stress..."
                  className="custom-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="wizard-nav-buttons mt-6">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="btn btn-outline flex-center-gap">
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <div></div> // empty placeholder for layout grid alignment
          )}

          <button type="button" onClick={nextStep} className="btn btn-primary flex-center-gap">
            {step === totalSteps ? (
              <>
                <CheckCircle2 size={18} /> Compile Diagnostic Preview
              </>
            ) : (
              <>
                Next Step <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
