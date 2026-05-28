import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { getSymptoms, getCycleData } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';

export default function Analytics({ activeTab }) {
  const [timeWindow, setTimeWindow] = useState(30); // 30, 60, 90 days
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState({
    avgPainPeriod: 0,
    avgPainNormal: 0,
    topSymptom: 'None',
    phaseCorrelation: 'Insufficient data'
  });

  useEffect(() => {
    generateChartData();
  }, [timeWindow, activeTab]);

  const generateChartData = () => {
    const symptoms = getSymptoms();
    const cycle = getCycleData();

    // 1. Generate date range
    const data = [];
    const now = new Date();
    
    // Simple helper to format dates as YYYY-MM-DD
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Calculate period start dates for estimated ovulation
    const getPeriodStartDates = () => {
      const sorted = [...cycle]
        .filter(l => l.isPeriod)
        .map(l => l.date)
        .sort();
      
      const startDates = [];
      let lastDate = null;
      for (const dStr of sorted) {
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

    const periodStarts = getPeriodStartDates();

    const isOvulationDate = (dateStr) => {
      if (periodStarts.length === 0) return false;
      return periodStarts.some(startDate => {
        const start = new Date(startDate);
        const ovulationDate = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
        const current = new Date(dateStr);
        const diffDays = Math.ceil(Math.abs(current - ovulationDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 1; // 3-day window
      });
    };

    // Fill days
    for (let i = timeWindow - 1; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(targetDate);

      // Find matching symptom entry
      const daySymptoms = symptoms.filter(s => s.timestamp.split('T')[0] === dateStr);
      let severity = 0;
      let count = 0;

      if (daySymptoms.length > 0) {
        // Average the intensities of the day, or check symptoms length
        let maxSeverity = 0;
        daySymptoms.forEach(entry => {
          const int = entry.details?.pain?.intensity || (entry.selectedSymptoms.length * 1.5);
          maxSeverity = Math.max(maxSeverity, Math.min(int, 10));
        });
        severity = maxSeverity;
        count = daySymptoms[0].selectedSymptoms.length;
      }

      // Find cycle info
      const dayCycle = cycle.find(c => c.date === dateStr);
      const isPeriod = dayCycle?.isPeriod ? 1 : 0;
      const isOvulating = isOvulationDate(dateStr) ? 1 : 0;

      // Labeling for X-axis (e.g. "May 15")
      const label = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        label,
        severity: severity > 0 ? severity : null, // null prevents line dropping to 0
        periodVal: isPeriod ? 10 : 0, // for shaded bar overlay
        ovulationVal: isOvulating ? 10 : 0, // for ovulation shaded area
        period: isPeriod,
        ovulation: isOvulating,
        symptomCount: count
      });
    }

    setChartData(data);
    calculateInsights(symptoms, cycle, periodStarts);
  };

  const calculateInsights = (symptoms, cycle, periodStarts) => {
    if (symptoms.length === 0) return;

    // 1. Top Symptom
    const counts = {};
    symptoms.forEach(entry => {
      entry.selectedSymptoms.forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
      });
    });

    let topSym = 'None';
    let maxCount = 0;
    Object.keys(counts).forEach(sym => {
      if (counts[sym] > maxCount) {
        maxCount = counts[sym];
        topSym = sym;
      }
    });

    const displaySymptomsNames = {
      pelvicPain: 'Pelvic Pain',
      abdominalPain: 'Abdominal Pain',
      fatigue: 'Fatigue',
      palpitations: 'Heart Palpitations',
      irregularBleeding: 'Irregular Bleeding',
      jointPain: 'Joint/Muscle Pain',
      bloating: 'Severe Bloating',
      brainFog: 'Brain Fog'
    };

    // 2. Average Pain Period vs Normal
    let totalPainPeriod = 0;
    let countPeriod = 0;
    let totalPainNormal = 0;
    let countNormal = 0;

    symptoms.forEach(entry => {
      const dateStr = entry.timestamp.split('T')[0];
      const isPeriod = cycle.some(c => c.date === dateStr && c.isPeriod);
      const intensity = entry.details?.pain?.intensity || 5;

      if (isPeriod) {
        totalPainPeriod += intensity;
        countPeriod++;
      } else {
        totalPainNormal += intensity;
        countNormal++;
      }
    });

    const avgP = countPeriod > 0 ? (totalPainPeriod / countPeriod).toFixed(1) : 0;
    const avgN = countNormal > 0 ? (totalPainNormal / countNormal).toFixed(1) : 0;

    // 3. Phase Flare-ups (Luteal vs Follicular vs Menstrual)
    let phaseStr = 'Analyzing historical cycle maps...';
    if (periodStarts.length > 0 && symptoms.length > 2) {
      let lutealFlares = 0;
      let follicularFlares = 0;
      let menstrualFlares = 0;

      symptoms.forEach(entry => {
        const entryDate = new Date(entry.timestamp.split('T')[0]);
        // Find closest previous period start date
        const precedingStarts = periodStarts
          .map(d => new Date(d))
          .filter(d => d <= entryDate);
        
        if (precedingStarts.length > 0) {
          const closestStart = new Date(Math.max(...precedingStarts));
          const diffDays = Math.ceil(Math.abs(entryDate - closestStart) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 5) {
            menstrualFlares++;
          } else if (diffDays > 5 && diffDays <= 14) {
            follicularFlares++;
          } else if (diffDays > 14 && diffDays <= 28) {
            lutealFlares++;
          }
        }
      });

      const maxFlares = Math.max(menstrualFlares, follicularFlares, lutealFlares);
      if (maxFlares === 0) {
        phaseStr = 'Symptom flares occur symmetrically across all cycle phases.';
      } else if (maxFlares === lutealFlares) {
        phaseStr = 'Symptom flares peak in the Luteal phase (days 15-28). Highly characteristic of PMDD, progesterone sensitivity, or hormonal inflammatory shifts.';
      } else if (maxFlares === menstrualFlares) {
        phaseStr = 'Symptom flares peak during menstruation (days 1-5). Heavily maps to structural endometriosis/adenomyosis pain triggers.';
      } else {
        phaseStr = 'Symptom flares peak during the follicular phase (days 6-14), coinciding with estrogen surges.';
      }
    } else {
      phaseStr = 'Log more periods in the Cycle Tracker and symptoms in the Smart Check to unlock hormonal correlation insights.';
    }

    setInsights({
      avgPainPeriod: avgP,
      avgPainNormal: avgN,
      topSymptom: displaySymptomsNames[topSym] || topSym,
      phaseCorrelation: phaseStr
    });
  };

  const isDataEmpty = chartData.filter(d => d.severity !== null).length === 0;

  return (
    <div className="analytics-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <BarChart3 className="icon-primary header-icon" size={32} />
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="subtitle">Interactive Trend Graphs & Hormonal Phase Mapping</p>
          </div>
        </div>

        <div className="time-selector-buttons">
          {[30, 60, 90].map(window => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`btn btn-sm ${timeWindow === window ? 'btn-primary' : 'btn-outline'}`}
            >
              {window} Days
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-dashboard-grid">
        {/* Core Trend Graph */}
        <div className="card chart-card col-span-2">
          <div className="card-header-with-icon justify-between">
            <div className="flex-center-gap">
              <TrendingUp className="text-primary" size={24} />
              <h2>Symptom Severity & Cycle Timeline Correlation</h2>
            </div>
            <span className="text-xs text-muted">Timeframe: {timeWindow} Days</span>
          </div>

          <p className="card-desc text-small mb-4">
            This graph overlays your symptom severity scores (1-10, purple line) on top of period intervals (shaded pink bars) and ovulation windows (shaded orange background) to visualize cyclical triggers.
          </p>

          {isDataEmpty ? (
            <div className="empty-state-card text-center flex-col-center py-16">
              <AlertCircle size={36} className="text-muted mb-2" />
              <h3>No Trend Data Found</h3>
              <p className="text-xs max-w-sm mt-1">
                Once you log symptoms via the Smart Check questionnaire and cycle days in the Cycle Tracker, your temporal trends will appear here.
              </p>
            </div>
          ) : (
            <div className="recharts-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEAF4" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10, fill: '#6B6275' }} 
                    stroke="#E2DCE8"
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tickCount={6} 
                    tick={{ fontSize: 10, fill: '#6B6275' }} 
                    stroke="#E2DCE8"
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E8E1EF', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#4A2E56' }}
                  />
                  
                  {/* Shaded Area for Ovulation Window (estimated) */}
                  <Area 
                    type="monotone" 
                    dataKey="ovulationVal" 
                    fill="#FAF0DD" 
                    stroke="none" 
                    name="Ovulation Window"
                    opacity={0.6}
                  />

                  {/* Shaded Area for Period Days */}
                  <Area 
                    type="step" 
                    dataKey="periodVal" 
                    fill="#F2E6EB" 
                    stroke="none" 
                    name="Menstruation"
                    opacity={0.8}
                  />

                  {/* Main Line for Symptom Severity */}
                  <Line 
                    type="monotone" 
                    dataKey="severity" 
                    stroke="#4A2E56" 
                    strokeWidth={3} 
                    dot={{ fill: '#4A2E56', r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Symptom Severity"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Insight Analytics */}
        <div className="card insights-card">
          <div className="card-header-with-icon">
            <Zap className="text-accent" size={24} />
            <h2>Cycle & Symptom Correlations</h2>
          </div>
          <p className="card-desc text-small">Engine parsed analysis of overlapping tracking layers.</p>

          <div className="analytics-metrics-list mt-3">
            <div className="analytic-metric-item">
              <span className="label">Average Pain (Period Days):</span>
              <span className="value text-primary font-semibold">
                {insights.avgPainPeriod > 0 ? `${insights.avgPainPeriod} / 10` : 'No logs'}
              </span>
            </div>

            <div className="analytic-metric-item">
              <span className="label">Average Pain (Normal Days):</span>
              <span className="value text-muted">
                {insights.avgPainNormal > 0 ? `${insights.avgPainNormal} / 10` : 'No logs'}
              </span>
            </div>

            <div className="analytic-metric-item">
              <span className="label">Most Frequent Flare-up:</span>
              <span className="value text-accent font-semibold">{insights.topSymptom}</span>
            </div>
          </div>

          <div className="alert-card note-banner mt-4 text-xs">
            <h5>Hormonal Timeline Analysis:</h5>
            <p className="mt-1 leading-relaxed">{insights.phaseCorrelation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
