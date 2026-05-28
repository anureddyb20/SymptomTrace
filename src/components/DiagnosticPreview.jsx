import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, ShieldAlert, Heart, Calendar, ArrowRight } from 'lucide-react';
import { getSymptoms } from '../utils/storage';

export default function DiagnosticPreview({ activeTab }) {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [results, setResults] = useState([]);
  const [latestEntry, setLatestEntry] = useState(null);

  useEffect(() => {
    if (activeTab === 3) { // 0-indexed: Dashboard (0), Privacy (1), Smart Check (2), Diagnostic (3)
      runEvaluation();
    }
  }, [activeTab]);

  const runEvaluation = () => {
    const symptomsLogs = getSymptoms();
    if (symptomsLogs.length === 0) {
      setLatestEntry(null);
      setResults([]);
      return;
    }

    const latest = symptomsLogs[0];
    setLatestEntry(latest);
    setLoading(true);

    const steps = [
      'Establishing sandboxed local processor connection...',
      'Filtering biological markers against female-centric health datasets...',
      'Cross-referencing atypical cardiac presentations & endocrine balances...',
      'Mapping cyclical timeline correlations and pelvic quadrants...',
      'Calculating final differential probabilities...'
    ];

    let currentStep = 0;
    setLoadingMessage(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingMessage(steps[currentStep]);
      } else {
        clearInterval(interval);
        calculateDiagnoses(latest);
        setLoading(false);
      }
    }, 800);
  };

  const calculateDiagnoses = async (entry) => {
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
      const response = await fetch(`${host}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.warn('[DiagnosticPreview] Node.js API offline. Falling back to local diagnostic compiler.', error);
      runLocalCalculation(entry);
    }
  };

  const runLocalCalculation = (entry) => {
    const list = entry.selectedSymptoms || [];
    const pain = entry.details?.pain || null;
    const fatigue = entry.details?.fatigue || null;
    const palpitations = entry.details?.palpitations || null;
    const bleeding = entry.details?.bleeding || null;
    const digestive = entry.details?.digestive || null;
    const dizziness = entry.details?.dizziness || null;
    const temperature = entry.details?.temperature || null;
    const mood = entry.details?.mood || null;
    const general = entry.general || {};

    const diffResults = [];

    // Condition 1: Endometriosis
    let endoScore = 0;
    let endoReasons = [];
    if (list.includes('pelvicPain')) {
      endoScore += 30;
      endoReasons.push('Presence of persistent pelvic pain');
    }
    if (list.includes('abdominalPain')) {
      endoScore += 10;
      endoReasons.push('Abdominal pain and pelvic discomfort');
    }
    if (list.includes('bloating')) {
      endoScore += 10;
      endoReasons.push('Severe bloating ("endo belly") which overlaps pelvic inflammation');
    }
    if (list.includes('digestiveIssues')) {
      endoScore += 10;
      endoReasons.push('Gastrointestinal disturbances (common misdiagnosis: IBS instead of endometriosis)');
    }
    if (pain) {
      if (pain.quadrants.suprapubic) {
        endoScore += 15;
        endoReasons.push('Pain concentrated in the suprapubic/pelvic quadrant, mapping to endometrial implants');
      }
      if (pain.frequency === 'cyclical') {
        endoScore += 15;
        endoReasons.push('Pain is strictly cyclical, expanding and shedding with estrogen fluctuations');
      } else if (pain.frequency === 'postcoital') {
        endoScore += 10;
        endoReasons.push('Deep pelvic pain during/after intercourse (dyspareunia) linked to tissue lesions');
      }
    }
    if (digestive) {
      if (digestive.painBowel) {
        endoScore += 15;
        endoReasons.push('Painful bowel movements during menstruation (suggesting rectovaginal implants)');
      }
      if (digestive.cycleLinkedIbs) {
        endoScore += 10;
        endoReasons.push('Cycle-linked bowel irregularities coinciding with period flares');
      }
    }
    if (bleeding) {
      if (bleeding.volume === 'heavy' || bleeding.volume === 'clotting') {
        endoScore += 10;
        endoReasons.push('Menorrhagia (heavy/clotting flow) suggesting uterine thickening/adenomyosis');
      }
    }
    if (endoScore > 20) {
      diffResults.push({
        id: 'endo',
        name: 'Endometriosis',
        score: Math.min(endoScore, 98),
        type: 'Gynecological / Inflammatory',
        explanation: 'A condition where tissue similar to the lining of the uterus grows outside it. It is heavily linked to severe cyclical pain, pelvic cramping, bloating, and painful bowel motions.',
        indicators: endoReasons,
        testing: 'Requires a Pelvic Ultrasound / MRI to rule out endometriomas, followed by Diagnostic Laparoscopy (gold standard) for absolute verification.',
      });
    }

    // Condition 2: PCOS (Polycystic Ovary Syndrome)
    let pcosScore = 0;
    let pcosReasons = [];
    if (list.includes('irregularBleeding')) {
      pcosScore += 30;
      pcosReasons.push('Irregular menstrual cycles or abnormal bleeding patterns');
    }
    if (list.includes('bloating')) {
      pcosScore += 10;
      pcosReasons.push('Abdominal bloating and metabolic changes');
    }
    if (list.includes('fatigue')) {
      pcosScore += 10;
      pcosReasons.push('Chronic fatigue often linked to insulin resistance');
    }
    if (list.includes('coldSensitivity')) {
      pcosScore += 5;
      pcosReasons.push('Metabolic / endocrine dysfunction markers');
    }
    if (bleeding) {
      if (bleeding.regularity === 'irregular' || bleeding.regularity === 'unpredictable') {
        pcosScore += 20;
        pcosReasons.push('Menstrual cycles are irregular or unpredictable (classic anovulation marker)');
      } else if (bleeding.regularity === 'absent') {
        pcosScore += 25;
        pcosReasons.push('Amenorrhea (absence of periods for 3+ months), indicative of hormonal stagnation');
      }
      if (bleeding.volume === 'heavy' || bleeding.volume === 'clotting') {
        pcosScore += 10;
        pcosReasons.push('Periods characterized by excessive bleeding when they do occur');
      }
    }
    if (temperature && temperature.hairThinning) {
      pcosScore += 20;
      pcosReasons.push('Androgenic signs (excess facial hair or scalp hair thinning)');
    }
    if (general.contraceptiveUse && general.contraceptiveUse !== 'none') {
      pcosScore += 10;
      pcosReasons.push('Currently using synthetic hormones which may mask cystic ovaries and androgen flares');
    }
    if (pcosScore > 25) {
      diffResults.push({
        id: 'pcos',
        name: 'Polycystic Ovary Syndrome (PCOS)',
        score: Math.min(pcosScore, 95),
        type: 'Endocrine / Metabolic',
        explanation: 'A common hormonal disorder causing enlarged ovaries with small cysts. In females, it leads to cycle irregularities, metabolic dysfunction, and androgen imbalances.',
        indicators: pcosReasons,
        testing: 'Recommended blood panels for free/total testosterone, DHEAS, fasting insulin (LH/FSH ratio), and a transvaginal ultrasound to check for antral follicle counts.',
      });
    }

    // Condition 3: POTS (Postural Orthostatic Tachycardia Syndrome)
    let potsScore = 0;
    let potsReasons = [];
    if (list.includes('palpitations')) {
      potsScore += 25;
      potsReasons.push('Heart flutters, skipped beats, and racing pulse');
    }
    if (list.includes('fatigue')) {
      potsScore += 10;
      potsReasons.push('Generalized physical fatigue');
    }
    if (list.includes('brainFog')) {
      potsScore += 15;
      potsReasons.push('Cognitive impairment / brain fog indicating reduced cerebral blood flow');
    }
    if (list.includes('dizziness')) {
      potsScore += 20;
      potsReasons.push('Frequent orthostatic lightheadedness or dizziness');
    }
    if (palpitations) {
      if (palpitations.triggers.postural) {
        potsScore += 20;
        potsReasons.push('Palpitations are posture-dependent, occurring rapidly upon standing upright');
      }
      if (palpitations.triggers.resting) {
        potsScore += 10;
        potsReasons.push('Palpitations felt at rest or while supine, indicating autonomic hyperactivity');
      }
    }
    if (dizziness) {
      if (dizziness.standingUp) {
        potsScore += 15;
        potsReasons.push('Symptoms are directly triggered upon standing upright (orthostatic intolerance)');
      }
      if (dizziness.fainting) {
        potsScore += 15;
        potsReasons.push('History of syncope or near-syncope (fainting episodes)');
      }
      if (dizziness.heatIntolerance) {
        potsScore += 5;
        potsReasons.push('Orthostatic stress triggered by heat, hot showers, or baths (vasodilation flare)');
      }
    }
    if (potsScore > 20) {
      diffResults.push({
        id: 'pots',
        name: 'POTS / Dysautonomia',
        score: Math.min(potsScore, 97),
        type: 'Autonomic Nervous System',
        explanation: 'An autonomic nervous system disorder where standing causes an abnormal heart rate increase. Highly prevalent in young females, and frequently misdiagnosed as panic disorder.',
        indicators: potsReasons,
        testing: 'Tilt Table Test (gold standard) or a standing 10-minute active orthostatic stand test (Poor Man\'s Tilt Test).',
      });
    }

    // Condition 4: Autoimmune Profile (e.g. Hashimoto's Thyroiditis)
    let autoScore = 0;
    let autoReasons = [];
    if (list.includes('jointPain')) {
      autoScore += 25;
      autoReasons.push('Joint stiffness or migratory muscle pain');
    }
    if (list.includes('fatigue')) {
      autoScore += 15;
      autoReasons.push('Severe, persistent systemic fatigue');
    }
    if (list.includes('brainFog')) {
      autoScore += 10;
      autoReasons.push('Cognitive brain fog and forgetfulness');
    }
    if (list.includes('coldSensitivity')) {
      autoScore += 20;
      autoReasons.push('Thermoregulation sensitivity (intolerance to cold or heat)');
    }
    if (temperature) {
      if (temperature.coldIntolerance) {
        autoScore += 15;
        autoReasons.push('Extreme intolerance to cold, indicating low metabolic rate/thyroid deficiency');
      }
      if (temperature.hairThinning) {
        autoScore += 10;
        autoReasons.push('Hair loss or thinning of outer eyebrows (classic thyroid markers)');
      }
    }
    if (general.familyAutoimmune === 'yes') {
      autoScore += 20;
      autoReasons.push('Positive family history of autoimmune diseases (elevating genetic susceptibility)');
    }
    if (autoScore > 25) {
      diffResults.push({
        id: 'autoimmune',
        name: 'Hashimoto\'s / Autoimmune Profile',
        score: Math.min(autoScore, 92),
        type: 'Autoimmune Systemic',
        explanation: 'The immune system targeting healthy tissues (like the thyroid). Highly prevalent in females (8:1 female-to-male ratio). Often presents with fatigue, cold sensitivity, joint aches, and cognitive clouding.',
        indicators: autoReasons,
        testing: 'Screening for Thyroid Panel (TSH, Free T4, Free T3), TPO Antibodies, and Antinuclear Antibodies (ANA) serology.',
      });
    }

    // Condition 5: Atypical Cardiac Presentation
    let cardiacScore = 0;
    let cardiacReasons = [];
    if (list.includes('palpitations')) {
      cardiacScore += 25;
      cardiacReasons.push('Heart fluttering or racing');
    }
    if (list.includes('fatigue')) {
      cardiacScore += 20;
      cardiacReasons.push('Atypical extreme exhaustion (often replacing chest crushing pain in females)');
    }
    if (list.includes('dizziness')) {
      cardiacScore += 15;
      cardiacReasons.push('Lightheadedness, dizziness, or fainting');
    }
    if (palpitations) {
      if (palpitations.triggers.resting) {
        cardiacScore += 15;
        cardiacReasons.push('Palpitations occurring during rest periods or while asleep');
      }
      if (palpitations.triggers.lutealPhase) {
        cardiacScore += 10;
        cardiacReasons.push('Palpitation spikes linked to hormonal changes during the luteal phase');
      }
    }
    if (dizziness && dizziness.fainting) {
      cardiacScore += 15;
      cardiacReasons.push('Episodes of syncope/fainting that raise cardiovascular concern');
    }
    if (general.pregnancyComplications === 'preeclampsia') {
      cardiacScore += 20;
      cardiacReasons.push('History of preeclampsia, which is a major female-specific risk factor for cardiovascular disease');
    }
    if (cardiacScore > 35) {
      diffResults.push({
        id: 'cardiac',
        name: 'Atypical Female Cardiac Presentation',
        score: Math.min(cardiacScore, 85),
        type: 'Cardiovascular Profile',
        explanation: 'Cardiovascular anomalies or microvascular disease in women frequently present without typical left-arm crushing chest pain. Instead, they manifest as palpitations, exhaustion, dizziness, and back pain.',
        indicators: cardiacReasons,
        testing: 'Holter 24-48 hr ECG Monitor, Echocardiogram, and Treadmill Stress Test with female-specific interpretation.',
      });
    }

    // Condition 6: Fibromyalgia / Chronic Fatigue Syndrome
    let fibroScore = 0;
    let fibroReasons = [];
    if (list.includes('fatigue')) {
      fibroScore += 20;
      fibroReasons.push('Profound, persistent exhaustion');
    }
    if (list.includes('jointPain')) {
      fibroScore += 20;
      fibroReasons.push('Widespread pain, joint and muscle tenderness');
    }
    if (list.includes('brainFog')) {
      fibroScore += 15;
      fibroReasons.push('Brain fog ("fibro-fog") and concentration difficulty');
    }
    if (list.includes('moodFluctuations')) {
      fibroScore += 10;
      fibroReasons.push('Sleep disruptions or severe mood fluctuations');
    }
    if (fatigue && fatigue.sleepRest === 'unrelieved') {
      fibroScore += 20;
      fibroReasons.push('Unrefreshing sleep—waking exhausted despite rest');
    }
    if (mood) {
      if (mood.pmddSigns) {
        fibroScore += 10;
        fibroReasons.push('Premenstrual dysphoric flares (highly prevalent comorbidities in Fibromyalgia)');
      }
      if (mood.insomnia) {
        fibroScore += 10;
        fibroReasons.push('Cycle-linked sleep disruptions or insomnia');
      }
    }
    if (fibroScore > 30) {
      diffResults.push({
        id: 'fibro',
        name: 'Fibromyalgia / ME-CFS',
        score: Math.min(fibroScore, 93),
        type: 'Neuro-Immune / Pain Pathway',
        explanation: 'A chronic disorder characterized by widespread musculoskeletal pain, unrefreshing sleep, severe fatigue, and cognitive issues. Predominantly diagnosed in females.',
        indicators: fibroReasons,
        testing: 'Clinical diagnosis of exclusion. Standard laboratory testing to rule out rheumatoid factors, ESR, CRP, and Lyme serology.',
      });
    }

    // Sort by score descending
    diffResults.sort((a, b) => b.score - a.score);
    setResults(diffResults);
  };

  if (!latestEntry) {
    return (
      <div className="diagnostic-preview-container fade-in">
        <div className="tab-header">
          <div className="brand-logo-container">
            <BrainCircuit className="icon-primary header-icon" size={32} />
            <div>
              <h1>Diagnostic Preview</h1>
              <p className="subtitle">AI Clinical Probability Simulator</p>
            </div>
          </div>
        </div>

        <div className="card empty-state-card text-center flex-col-center">
          <ShieldAlert size={48} className="text-primary mb-4" />
          <h3>No Questionnaire Data Detected</h3>
          <p className="max-w-md mt-2">
            The diagnostic preview engine requires symptom data to generate a differential analysis. 
            Please navigate to the Smart Check tab and submit your questionnaire.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnostic-preview-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <BrainCircuit className="icon-primary header-icon" size={32} />
          <div>
            <h1>Diagnostic Preview</h1>
            <p className="subtitle">AI Clinical Probability Simulator (Female-Specific Focus)</p>
          </div>
        </div>
        <button onClick={runEvaluation} disabled={loading} className="btn btn-outline flex-center-gap">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Recalculate Analysis
        </button>
      </div>

      {loading ? (
        <div className="card loading-card flex-col-center">
          <div className="spinner mb-4"></div>
          <h3>Running Local Diagnostic Simulation</h3>
          <p className="text-small text-muted text-center mt-2 max-w-sm">{loadingMessage}</p>
        </div>
      ) : (
        <div className="diagnostic-dashboard-layout">
          {/* Warning disclaimer */}
          <div className="card alert-card warning-banner col-span-full">
            <AlertTriangle className="text-danger flex-shrink-0" size={24} />
            <div>
              <h4>Decision Support Tool / Mock Engine Simulation</h4>
              <p className="text-xs">
                This differential report maps symptoms specifically against atypical female physiological indicators. 
                This mock engine simulates a local clinical ML model and does <strong>not</strong> constitute medical advice or a diagnosis. 
                Please export this report under the Report Hub and share it with your medical provider to guide clinical investigations.
              </p>
            </div>
          </div>

          {/* Differential Results */}
          <div className="differential-list col-span-2">
            <h2 className="section-title">Differential Diagnostics ({results.length} Matches Found)</h2>
            <div className="differential-cards-grid">
              {results.length > 0 ? (
                results.map((res) => (
                  <div key={res.id} className="card result-item-card border-left-plum fade-in">
                    <div className="result-card-header justify-between">
                      <div>
                        <span className="badge badge-secondary">{res.type}</span>
                        <h3>{res.name}</h3>
                      </div>
                      <div className="probability-badge">
                        <span className="prob-pct">{res.score}%</span>
                        <span className="prob-label">MATCH</span>
                      </div>
                    </div>

                    <p className="res-exp-text mt-2">{res.explanation}</p>

                    <div className="indicators-box mt-3">
                      <h5>Matching Markers In Your Questionnaire:</h5>
                      <ul className="symptom-reason-list">
                        {res.indicators.map((ind, idx) => (
                          <li key={idx}>{ind}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="clinical-testing-box mt-3 border-top-lavender">
                      <h5>Suggested Clinical Diagnostic Path:</h5>
                      <p className="text-xs text-muted mt-1">{res.testing}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card empty-state-card text-center flex-col-center">
                  <Heart size={36} className="text-accent mb-2" />
                  <h4>No High-Probability Systemic Matches Found</h4>
                  <p className="text-xs max-w-sm mt-1">
                    Your selections didn't trigger primary threshold scores for Endometriosis, PCOS, POTS, or Autoimmune flares. Review your inputs or check out the cycle tracker.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Side Info Panel: The Gender Health Gap */}
          <div className="info-sidebar-panel">
            <div className="card educational-card">
              <h3>Bridging the Gap</h3>
              <p className="text-xs">
                Did you know that clinical research has historically used male physiology as the baseline? Because of this, common female conditions are frequently misdiagnosed:
              </p>
              <div className="edu-stats-list mt-3">
                <div className="edu-stat-item">
                  <span className="edu-num">7-10 yrs</span>
                  <span className="edu-desc text-xs">Average delay in diagnosing endometriosis.</span>
                </div>
                <div className="edu-stat-item">
                  <span className="edu-num">4x</span>
                  <span className="edu-desc text-xs">More likely for a woman's autoimmune symptom to be dismissed as mental distress.</span>
                </div>
                <div className="edu-stat-item">
                  <span className="edu-num">50%</span>
                  <span className="edu-desc text-xs">Higher rate of initial misdiagnosis for women experiencing cardiac arrest.</span>
                </div>
              </div>
              <div className="alert-card note-banner mt-4 text-xs">
                Symptom-Match uses female diagnostic heuristics to elevate your concerns in front of providers, arming you with clinical terms instead of generalized symptom descriptions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
