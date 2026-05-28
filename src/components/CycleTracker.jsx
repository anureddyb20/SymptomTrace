import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Droplet, Pill, ShieldAlert, Sparkles } from 'lucide-react';
import { getCycleData, saveCycleData, getSymptoms } from '../utils/storage';

export default function CycleTracker({ onDataChanged }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycleLogs, setCycleLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  // Day log edit inputs
  const [isPeriod, setIsPeriod] = useState(false);
  const [flow, setFlow] = useState('Medium'); // Light, Medium, Heavy, Spotting
  const [tookContraceptive, setTookContraceptive] = useState(false);
  const [contraceptiveType, setContraceptiveType] = useState('Oral Pill');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setCycleLogs(getCycleData());
    setSymptomLogs(getSymptoms());
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateString = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (dayStr) => {
    setSelectedDateStr(dayStr);
    const existingLog = cycleLogs.find(log => log.date === dayStr);
    if (existingLog) {
      setIsPeriod(existingLog.isPeriod || false);
      setFlow(existingLog.flow || 'Medium');
      setTookContraceptive(existingLog.tookContraceptive || false);
      setContraceptiveType(existingLog.contraceptiveType || 'Oral Pill');
    } else {
      setIsPeriod(false);
      setFlow('Medium');
      setTookContraceptive(false);
      setContraceptiveType('Oral Pill');
    }
  };

  const handleSaveDayLog = () => {
    if (!selectedDateStr) return;

    let updatedLogs = [...cycleLogs];
    const logIndex = updatedLogs.findIndex(log => log.date === selectedDateStr);

    const newLog = {
      date: selectedDateStr,
      isPeriod,
      flow: isPeriod ? flow : null,
      tookContraceptive,
      contraceptiveType: tookContraceptive ? contraceptiveType : null,
    };

    if (logIndex >= 0) {
      updatedLogs[logIndex] = newLog;
    } else {
      updatedLogs.push(newLog);
    }

    // Clean up empty logs
    updatedLogs = updatedLogs.filter(log => log.isPeriod || log.tookContraceptive);

    saveCycleData(updatedLogs);
    setCycleLogs(updatedLogs);
    if (onDataChanged) onDataChanged();
  };

  // Ovulation Windows Calculation (simple simulation based on cycle logs)
  // Assume a standard 28-day cycle. Ovulation occurs roughly 14 days before the next period.
  // We can look at period start dates to estimate ovulation.
  const getPeriodStartDates = () => {
    const sorted = [...cycleLogs]
      .filter(l => l.isPeriod)
      .map(l => l.date)
      .sort();
    
    // Group adjacent dates into periods, select the first date of each group
    const startDates = [];
    let lastDate = null;
    for (const dStr of sorted) {
      const current = new Date(dStr);
      if (!lastDate) {
        startDates.push(dStr);
      } else {
        const diffTime = Math.abs(current - new Date(lastDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 3) { // new period if gap is more than 3 days
          startDates.push(dStr);
        }
      }
      lastDate = dStr;
    }
    return startDates;
  };

  const isEstimatedOvulation = (year, month, day) => {
    const dayStr = formatDateString(year, month, day);
    const startDates = getPeriodStartDates();
    if (startDates.length === 0) return false;

    // For each start date, estimate next period in 28 days, and ovulation 14 days before that.
    // Meaning ovulation is roughly 14 days after the period start date.
    return startDates.some(startDate => {
      const start = new Date(startDate);
      const ovulationDate = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      // Let's create a 3-day window centered on the 14th day
      const target = new Date(year, month, day);
      const diffTime = Math.abs(target - ovulationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1; // 3 days total (ovulation day +/- 1 day)
    });
  };

  const getSymptomSeverityForDate = (year, month, day) => {
    const dayStr = formatDateString(year, month, day);
    // Find symptom logs matching this date (ignore time)
    const logs = symptomLogs.filter(log => log.timestamp.split('T')[0] === dayStr);
    if (logs.length === 0) return null;

    // Compute max intensity logged on this date
    let maxIntensity = 0;
    logs.forEach(log => {
      const intensity = log.details?.pain?.intensity || 5;
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
      }
    });
    return maxIntensity;
  };

  // Rendering calendar cells
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarCells = [];
  // Empty slots for days of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="calendar-cell cell-empty"></div>);
  }

  // Days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = formatDateString(year, month, day);
    const dayLog = cycleLogs.find(log => log.date === dayStr);
    const symptomSeverity = getSymptomSeverityForDate(year, month, day);
    const isOvulating = isEstimatedOvulation(year, month, day);
    const isSelected = selectedDateStr === dayStr;

    let cellClass = 'calendar-cell ';
    if (dayLog?.isPeriod) cellClass += 'cell-period ';
    if (isOvulating) cellClass += 'cell-ovulation ';
    if (isSelected) cellClass += 'cell-selected ';

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className={cellClass}
        onClick={() => handleDayClick(dayStr)}
      >
        <span className="day-number">{day}</span>
        
        {/* Indicators overlay */}
        <div className="indicators-overlay">
          {dayLog?.isPeriod && <Droplet size={10} className="indicator-icon text-primary fill-plum" />}
          {dayLog?.tookContraceptive && <Pill size={10} className="indicator-icon text-accent" />}
          {isOvulating && <Sparkles size={10} className="indicator-icon text-warning" />}
        </div>

        {/* Symptom Severity Indicator (Dot) */}
        {symptomSeverity !== null && (
          <span 
            className={`severity-dot ${symptomSeverity >= 8 ? 'sev-severe' : symptomSeverity >= 4 ? 'sev-moderate' : 'sev-mild'}`}
            title={`Symptom severity logged: ${symptomSeverity}/10`}
          ></span>
        )}
      </div>
    );
  }

  return (
    <div className="cycle-tracker-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <CalendarIcon className="icon-primary header-icon" size={32} />
          <div>
            <h1>Cycle Tracker</h1>
            <p className="subtitle">Hormonal & Menstrual cycle Timeline</p>
          </div>
        </div>
      </div>

      <div className="cycle-tracker-layout">
        {/* Calendar Card */}
        <div className="card calendar-card">
          <div className="calendar-header justify-between">
            <button onClick={handlePrevMonth} className="btn btn-icon">
              <ChevronLeft size={20} />
            </button>
            <h3 className="month-year-label">{monthsList[month]} {year}</h3>
            <button onClick={handleNextMonth} className="btn btn-icon">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-weekdays-grid">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="calendar-days-grid">
            {calendarCells}
          </div>

          <div className="calendar-legend-box border-top-lavender mt-4">
            <h4>Legend Indicators</h4>
            <div className="legend-items">
              <div className="legend-item"><span className="legend-color-box bg-plum-light"></span> Period Day</div>
              <div className="legend-item"><span className="legend-color-box bg-gold-light"></span> Est. Ovulation Window</div>
              <div className="legend-item"><Pill size={12} className="text-accent" /> Contraceptive Logged</div>
              <div className="legend-item"><span className="dot-indicator bg-green-dot"></span> Mild (1-3)</div>
              <div className="legend-item"><span className="dot-indicator bg-lavender-dot"></span> Moderate (4-7)</div>
              <div className="legend-item"><span className="dot-indicator bg-plum-dot"></span> Severe (8-10)</div>
            </div>
          </div>
        </div>

        {/* Logging Panel */}
        <div className="card logging-card">
          <h2>Log Day Details</h2>
          <p className="card-desc text-small">
            Select a date on the calendar to update your menstrual flow or hormonal contraceptive details.
          </p>

          {selectedDateStr ? (
            <div className="day-edit-form fade-in">
              <div className="selected-date-badge">
                Selected Date: <strong>{selectedDateStr}</strong>
              </div>

              <div className="form-group border-top-lavender pt-3">
                <label className="check-option align-items-center">
                  <input 
                    type="checkbox"
                    checked={isPeriod}
                    onChange={(e) => setIsPeriod(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span className="ml-2 font-semibold flex-center-gap"><Droplet size={16} className="text-primary" /> Mark as Period / Bleeding Day</span>
                </label>
              </div>

              {isPeriod && (
                <div className="form-group pl-6 fade-in">
                  <label className="input-label">Menstrual Flow Intensity:</label>
                  <div className="radio-group-horizontal-compact">
                    {['Spotting', 'Light', 'Medium', 'Heavy'].map(f => (
                      <label key={f} className={`flow-btn ${flow === f ? 'active' : ''}`}>
                        <input 
                          type="radio" 
                          name="flowIntensity" 
                          value={f}
                          checked={flow === f}
                          onChange={(e) => setFlow(e.target.value)}
                          style={{ display: 'none' }}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group border-top-lavender pt-3 mt-3">
                <label className="check-option align-items-center">
                  <input 
                    type="checkbox"
                    checked={tookContraceptive}
                    onChange={(e) => setTookContraceptive(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span className="ml-2 font-semibold flex-center-gap"><Pill size={16} className="text-accent" /> Log Contraceptive / Hormone Pill Taken</span>
                </label>
              </div>

              {tookContraceptive && (
                <div className="form-group pl-6 fade-in">
                  <label className="input-label">Type / Brand Name:</label>
                  <input 
                    type="text" 
                    value={contraceptiveType} 
                    onChange={(e) => setContraceptiveType(e.target.value)}
                    placeholder="e.g. Yaz, Mirena IUD, Estrogen Patch"
                    className="custom-input"
                  />
                </div>
              )}

              <button 
                type="button" 
                onClick={handleSaveDayLog}
                className="btn btn-primary w-full mt-4 flex-center-gap"
              >
                Save Day Records
              </button>
            </div>
          ) : (
            <div className="empty-state-card text-center flex-col-center border-dashed py-8">
              <ShieldAlert size={24} className="text-muted mb-2" />
              <p className="text-xs text-muted">Click any date on the calendar to start logging hormonal levels, periods, or contraceptive events.</p>
            </div>
          )}

          <div className="educational-banner mt-4 text-xs alert-card note-banner">
            <strong>Cycle Correlation tip:</strong> Ovulation estimations assume a typical luteal phase length of 14 days. If you are experiencing symptoms like severe cramps, logging these during ovulation or period windows helps identify structural conditions like endometriosis.
          </div>
        </div>
      </div>
    </div>
  );
}
