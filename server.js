import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Medical dictionary definitions for the backend decoder API
const dictionary = {
  dysmenorrhea: {
    term: 'Dysmenorrhea',
    pronunciation: 'dis-men-uh-ree-uh',
    translation: 'Painful menstrual periods and cramps.',
    details: 'Primary dysmenorrhea refers to common cramps that happen before or during your period, caused by normal chemical contractions. Secondary dysmenorrhea is pain caused by a medical condition (like endometriosis or fibroids).'
  },
  menorrhagia: {
    term: 'Menorrhagia',
    pronunciation: 'men-uh-rey-jee-uh',
    translation: 'Abnormally heavy or prolonged menstrual bleeding.',
    details: 'Commonly defined as needing to change a pad or tampon every hour for several consecutive hours, bleeding for longer than 7 days, or passing blood clots larger than a quarter. Can lead to anemia and exhaustion.'
  },
  amenorrhea: {
    term: 'Amenorrhea',
    pronunciation: 'ey-men-uh-ree-uh',
    translation: 'Absence of menstrual periods.',
    details: 'Primary amenorrhea is when a girl hasn\'t started her period by age 15. Secondary amenorrhea is when someone who usually gets periods misses them for 3 or more months. Causes can range from stress and weight changes to PCOS or thyroid issues.'
  },
  hirsutism: {
    term: 'Hirsutism',
    pronunciation: 'hur-soot-iz-um',
    translation: 'Excessive growth of dark, thick body or facial hair in a male-like pattern.',
    details: 'Often appears on the face, chest, or back. It is typically caused by elevated levels of androgens (male hormones like testosterone) and is a very common marker in PCOS.'
  },
  dyspareunia: {
    term: 'Dyspareunia',
    pronunciation: 'dis-puh-roo-nee-uh',
    translation: 'Painful intercourse or pain during sexual activity.',
    details: 'The pain can be superficial (near the entrance) or deep. It can be caused by physical conditions like endometriosis, pelvic inflammatory disease (PID), vaginal dryness, or pelvic floor muscle tightness. It is a key symptom to mention to a doctor.'
  },
  adenomyosis: {
    term: 'Adenomyosis',
    pronunciation: 'ad-uh-noh-my-oh-sis',
    translation: 'Uterine lining tissue growing into the muscular wall of the uterus.',
    details: 'This makes the uterus act like a bruised muscle, leading to an enlarged uterus, very heavy bleeding, severe cramping, and pain during intercourse. It is distinct from endometriosis, though they can co-exist.'
  },
  endometriosis: {
    term: 'Endometriosis',
    pronunciation: 'en-doh-mee-tree-oh-sis',
    translation: 'Uterine-like tissue growing outside the uterus, causing inflammation, scarring, and severe pain.',
    details: 'This tissue behaves like menstrual tissue—thickening, breaking down, and bleeding with each cycle—but with no way to exit, leading to cysts, scar tissue, and chronic pelvic pain. It takes an average of 7-10 years to be diagnosed.'
  },
  laparoscopy: {
    term: 'Laparoscopy',
    pronunciation: 'lap-uh-ros-kuh-pee',
    translation: 'A minimally invasive keyhole surgery to look inside the abdomen.',
    details: 'It uses a small camera inserted through a tiny incision. It is currently the gold standard and only definitive method for diagnosing endometriosis, allowing doctors to both see and remove lesions.'
  },
  adnexal: {
    term: 'Adnexal / Adnexal Mass',
    pronunciation: 'ad-nek-suhl',
    translation: 'A lump or growth located near the uterus, typically in the ovaries or fallopian tubes.',
    details: 'Adnexa refers to the appendages of the uterus. An adnexal mass can be a benign fluid-filled cyst, a fibroid, an ectopic pregnancy, or, rarely, malignant. Further imaging like an ultrasound is usually ordered.'
  },
  tachycardia: {
    term: 'Tachycardia',
    pronunciation: 'tak-i-kahr-dee-uh',
    translation: 'A heart rate that is unusually fast, typically over 100 beats per minute.',
    details: 'Can feel like a racing heart, flutter, or palpitations. In females, postural tachycardia (racing when standing) can indicate POTS, which is frequently misdiagnosed as panic or anxiety.'
  },
  orthostatic: {
    term: 'Orthostatic',
    pronunciation: 'awr-thuh-stat-ik',
    translation: 'Relating to or caused by standing upright.',
    details: 'Commonly used in "orthostatic intolerance" or "orthostatic hypotension," referring to symptoms like dizziness, heart racing, or fainting that happen when standing up and improve when lying down.'
  },
  luteal: {
    term: 'Luteal Phase',
    pronunciation: 'loo-tee-uhl',
    translation: 'The second half of your menstrual cycle, occurring after ovulation and before your period.',
    details: 'During this phase (usually days 15 to 28), progesterone rises to prepare the uterine lining for potential pregnancy. If no pregnancy occurs, hormone levels drop, triggering menstruation. Many chronic symptoms flare up during this phase.'
  },
  follicular: {
    term: 'Follicular Phase',
    pronunciation: 'fuh-lik-yuh-ler',
    translation: 'The first half of your menstrual cycle, from the start of your period until ovulation.',
    details: 'During this phase, estrogen increases to rebuild the uterine lining and mature follicles in the ovaries. Symptom tracking often shows a relief of inflammatory pain during the mid-follicular phase due to estrogen.'
  },
  etiology: {
    term: 'Etiology / Etiology Unknown',
    pronunciation: 'ee-tee-ol-uh-jee',
    translation: 'The cause, origin, or reason for a disease or condition.',
    details: '"Etiology unknown" or "idiopathic" means doctors do not yet know what caused your symptoms, which is common in chronic and autoimmune conditions.'
  },
  idiopathic: {
    term: 'Idiopathic',
    pronunciation: 'id-ee-uh-path-ik',
    translation: 'A disease or condition that arises spontaneously or for which the cause is unknown.',
    details: 'It essentially means "occurring on its own" without a clear trigger. For many patients, getting an idiopathic label means clinical focus shifts from finding a cure to managing symptoms.'
  },
  serology: {
    term: 'Serology',
    pronunciation: 'si-rol-uh-jee',
    translation: 'Blood tests that look for antibodies in the blood.',
    details: 'Often used to diagnose autoimmune conditions (like lupus or thyroiditis) or infections. The presence of specific autoantibodies means your immune system is targeting your own tissues.'
  },
  ana: {
    term: 'ANA (Antinuclear Antibody)',
    pronunciation: 'A-N-A',
    translation: 'An antibody that attacks the nuclei of your own cells, suggesting an active autoimmune response.',
    details: 'A positive ANA test is a primary screening marker for autoimmune conditions like Lupus, Sjögren\'s, or Rheumatoid Arthritis. However, a positive result alone is not a diagnosis, and requires further clinical workup.'
  },
  tpo: {
    term: 'TPO (Thyroid Peroxidase) Antibodies',
    pronunciation: 'T-P-O',
    translation: 'Antibodies indicating your immune system is attacking your thyroid gland.',
    details: 'High TPO antibodies are the hallmark of Hashimoto\'s Thyroiditis, the most common cause of hypothyroidism in women. It is a simple blood test that is often omitted in standard health panels.'
  },
  fibroadenoma: {
    term: 'Fibroadenoma',
    pronunciation: 'fy-broh-ad-uh-noh-muh',
    translation: 'A common, non-cancerous (benign) breast lump.',
    details: 'They are solid, firm, rubbery lumps that move easily under the skin when touched. They are most common in women aged 15 to 35 and can fluctuate in size depending on cycle hormones.'
  },
  hyperplasia: {
    term: 'Endometrial Hyperplasia',
    pronunciation: 'hahy-per-pley-zhuh',
    translation: 'Abnormal thickening of the inner lining of the uterus.',
    details: 'Usually caused by an imbalance where there is too much estrogen and not enough progesterone. It can cause abnormal uterine bleeding and, in some cases, can progress to uterine cancer if untreated.'
  }
};

// API Route: AI Probability Engine Simulation (Tab 3)
app.post('/api/diagnose', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.selectedSymptoms) {
    return res.status(400).json({ error: 'Invalid symptom payload' });
  }

  const list = entry.selectedSymptoms;
  const pain = entry.details?.pain || null;
  const fatigue = entry.details?.fatigue || null;
  const palpitations = entry.details?.palpitations || null;
  const general = entry.general || {};

  const diffResults = [];

  // 1. Endometriosis
  let endoScore = 0;
  let endoReasons = [];
  if (list.includes('pelvicPain')) {
    endoScore += 35;
    endoReasons.push('Presence of persistent pelvic pain');
  }
  if (list.includes('abdominalPain')) {
    endoScore += 15;
    endoReasons.push('Abdominal pain and pelvic discomfort');
  }
  if (list.includes('bloating')) {
    endoScore += 15;
    endoReasons.push('Severe bloating ("endo belly") which overlaps pelvic inflammation');
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
  if (endoScore > 20) {
    diffResults.push({
      id: 'endo',
      name: 'Endometriosis',
      score: Math.min(endoScore, 96),
      type: 'Gynecological / Inflammatory',
      explanation: 'A condition where tissue similar to the lining of the uterus grows outside it. It is heavily linked to severe cyclical pain, pelvic cramping, and bloating.',
      indicators: endoReasons,
      testing: 'Requires a Pelvic Ultrasound / MRI to rule out endometriomas, followed by Diagnostic Laparoscopy (gold standard) for absolute verification.',
    });
  }

  // 2. PCOS
  let pcosScore = 0;
  let pcosReasons = [];
  if (list.includes('irregularBleeding')) {
    pcosScore += 45;
    pcosReasons.push('Irregular menstrual cycles, missed periods, or spotting');
  }
  if (list.includes('bloating')) {
    pcosScore += 15;
    pcosReasons.push('Abdominal bloating and metabolic changes');
  }
  if (list.includes('fatigue')) {
    pcosScore += 15;
    pcosReasons.push('Chronic fatigue often linked to insulin resistance');
  }
  if (general.contraceptiveUse && general.contraceptiveUse !== 'none') {
    pcosScore += 10;
    pcosReasons.push('Currently using synthetic hormones which may mask cystic ovaries and androgen flares');
  }
  if (pcosScore > 25) {
    diffResults.push({
      id: 'pcos',
      name: 'Polycystic Ovary Syndrome (PCOS)',
      score: Math.min(pcosScore, 92),
      type: 'Endocrine / Metabolic',
      explanation: 'A common hormonal disorder causing enlarged ovaries with small cysts. In females, it leads to cycle irregularities, metabolic dysfunction, and androgen imbalances.',
      indicators: pcosReasons,
      testing: 'Recommended blood panels for free/total testosterone, DHEAS, fasting insulin (LH/FSH ratio), and an transvaginal ultrasound to check for antral follicle counts.',
    });
  }

  // 3. POTS
  let potsScore = 0;
  let potsReasons = [];
  if (list.includes('palpitations')) {
    potsScore += 30;
    potsReasons.push('Heart flutters and racing pulse');
  }
  if (list.includes('fatigue')) {
    potsScore += 15;
    potsReasons.push('Generalized physical fatigue');
  }
  if (list.includes('brainFog')) {
    potsScore += 20;
    potsReasons.push('Cognitive impairment / brain fog indicating reduced cerebral blood flow');
  }
  if (palpitations && palpitations.triggers.postural) {
    potsScore += 25;
    potsReasons.push('Palpitations are posture-dependent, occurring rapidly upon standing upright');
  }
  if (palpitations && palpitations.triggers.resting) {
    potsScore += 10;
    potsReasons.push('Atypical female presentation: palpitations frequently felt at rest or while supine');
  }
  if (potsScore > 20) {
    diffResults.push({
      id: 'pots',
      name: 'POTS / Dysautonomia',
      score: Math.min(potsScore, 94),
      type: 'Autonomic Nervous System',
      explanation: 'An autonomic nervous system disorder where standing causes an abnormal heart rate increase. Highly prevalent in young females, and frequently misdiagnosed as panic disorder.',
      indicators: potsReasons,
      testing: 'Tilt Table Test (gold standard) or a standing 10-minute active orthostatic stand test (Poor Man\'s Tilt Test).',
    });
  }

  // 4. Hashimoto's / Autoimmune
  let autoScore = 0;
  let autoReasons = [];
  if (list.includes('jointPain')) {
    autoScore += 30;
    autoReasons.push('Joint stiffness or migratory muscle pain');
  }
  if (list.includes('fatigue')) {
    autoScore += 20;
    autoReasons.push('Severe, persistent fatigue');
  }
  if (list.includes('brainFog')) {
    autoScore += 15;
    autoReasons.push('Cognitive brain fog and forgetfulness');
  }
  if (general.familyAutoimmune === 'yes') {
    autoScore += 25;
    autoReasons.push('Positive maternal/family history of autoimmune diseases (elevating genetic susceptibility)');
  }
  if (autoScore > 25) {
    diffResults.push({
      id: 'autoimmune',
      name: 'Hashimoto\'s / Autoimmune Profile',
      score: Math.min(autoScore, 89),
      type: 'Autoimmune Systemic',
      explanation: 'The immune system targeting healthy tissues (like the thyroid). Highly prevalent in females (8:1 female-to-male ratio). Often presents with fatigue, joint aches, and cognitive clouding.',
      indicators: autoReasons,
      testing: 'Screening for Thyroid Panel (TSH, Free T4, Free T3), TPO Antibodies, and Antinuclear Antibodies (ANA) serology.',
    });
  }

  // 5. Atypical Cardiac
  let cardiacScore = 0;
  let cardiacReasons = [];
  if (list.includes('palpitations')) {
    cardiacScore += 30;
    cardiacReasons.push('Heart fluttering or racing');
  }
  if (list.includes('fatigue')) {
    cardiacScore += 20;
    cardiacReasons.push('Atypical extreme exhaustion (often replacing chest crushing pain in females)');
  }
  if (palpitations) {
    if (palpitations.triggers.resting) {
      cardiacScore += 15;
      cardiacReasons.push('Palpitations occurring during rest periods (e.g. sleep/lying down)');
    }
    if (palpitations.triggers.lutealPhase) {
      cardiacScore += 15;
      cardiacReasons.push('Palpitation spikes linked to hormonal changes during the luteal phase');
    }
  }
  if (cardiacScore > 35) {
    diffResults.push({
      id: 'cardiac',
      name: 'Atypical Female Cardiac Presentation',
      score: Math.min(cardiacScore, 82),
      type: 'Cardiovascular Profile',
      explanation: 'Cardiovascular anomalies or microvascular disease in women frequently present without typical left-arm crushing chest pain. Instead, they manifest as palpitations, exhaustion, back pain, and sleep disruptions.',
      indicators: cardiacReasons,
      testing: 'Holter 24-48 hr ECG Monitor, Echocardiogram, and Treadmill Stress Test with female-specific interpretation.',
    });
  }

  // 6. Fibromyalgia
  let fibroScore = 0;
  let fibroReasons = [];
  if (list.includes('fatigue')) {
    fibroScore += 20;
    fibroReasons.push('Profound, persistent exhaustion');
  }
  if (list.includes('jointPain')) {
    fibroScore += 25;
    fibroReasons.push('Generalized joint and muscle tenderness');
  }
  if (list.includes('brainFog')) {
    fibroScore += 20;
    fibroReasons.push('Brain fog ("fibro-fog") and concentration difficulty');
  }
  if (fatigue && fatigue.sleepRest === 'unrelieved') {
    fibroScore += 20;
    fibroReasons.push('Unrefreshing sleep—waking exhausted despite rest');
  }
  if (fibroScore > 30) {
    diffResults.push({
      id: 'fibro',
      name: 'Fibromyalgia / ME-CFS',
      score: Math.min(fibroScore, 90),
      type: 'Neuro-Immune / Pain Pathway',
      explanation: 'A chronic disorder characterized by widespread musculoskeletal pain, unrefreshing sleep, severe fatigue, and cognitive issues. Predominantly diagnosed in females.',
      indicators: fibroReasons,
      testing: 'Clinical diagnosis of exclusion. Standard laboratory testing to rule out rheumatoid factors, ESR, CRP, and Lyme serology.',
    });
  }

  diffResults.sort((a, b) => b.score - a.score);
  res.json({ results: diffResults });
});

// API Route: Jargon Translator (Tab 8)
app.post('/api/decode', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.json({ matches: [] });
  }

  const normalized = text.toLowerCase();
  const matches = [];

  Object.keys(dictionary).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\w*\\b`, 'gi');
    if (regex.test(normalized)) {
      matches.push(dictionary[key]);
    }
  });

  res.json({ matches });
});

// Serve static assets from standard Vite output folder (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for single page app routers
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen
app.listen(PORT, () => {
  console.log(`[Node.js Server] Symptom-Match backend active on port ${PORT}`);
});
