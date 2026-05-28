import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, FileText, CheckCircle, Search, HelpCircle } from 'lucide-react';
import { decodeText, dictionary } from '../utils/medicalTerms';

export default function MedicalDecoder() {
  const [inputText, setInputText] = useState('');
  const [decodedMatches, setDecodedMatches] = useState([]);
  
  useEffect(() => {
    const fetchDecodedMatches = async () => {
      if (inputText.trim().length > 2) {
        try {
          const host = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
          const response = await fetch(`${host}/api/decode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText }),
          });
          if (!response.ok) throw new Error('API server returned error');
          const data = await response.json();
          setDecodedMatches(data.matches || []);
        } catch (error) {
          console.warn('[MedicalDecoder] Node.js API offline. Falling back to local client decoder.', error);
          const matches = decodeText(inputText);
          setDecodedMatches(matches);
        }
      } else {
        setDecodedMatches([]);
      }
    };

    fetchDecodedMatches();
  }, [inputText]);

  const handleSampleText = () => {
    setInputText(
      "Patient presents with severe secondary dysmenorrhea and chronic menorrhagia. " +
      "Pelvic ultrasound shows a small left adnexal mass, possibly endometrioma. " +
      "Suspected etiology: adenomyosis or endometriosis. Recommend diagnostic laparoscopy."
    );
  };

  const handleClear = () => {
    setInputText('');
    setDecodedMatches([]);
  };

  return (
    <div className="medical-decoder-container fade-in">
      <div className="tab-header">
        <div className="brand-logo-container">
          <BookOpen className="icon-primary header-icon" size={32} />
          <div>
            <h1>Medical Decoder</h1>
            <p className="subtitle">Clinical Jargon Translator & Patient Dictionary</p>
          </div>
        </div>
      </div>

      <div className="decoder-dashboard-layout">
        {/* Left Panel: Input Area */}
        <div className="card input-card">
          <div className="card-header-with-icon justify-between">
            <div className="flex-center-gap">
              <FileText className="text-primary" size={24} />
              <h2>Clinical Document Workspace</h2>
            </div>
            <div className="flex-gap-2">
              <button onClick={handleSampleText} className="btn btn-outline btn-xs">Load Sample Note</button>
              <button onClick={handleClear} className="btn btn-outline btn-xs">Clear</button>
            </div>
          </div>
          <p className="card-desc text-small">
            Paste medical notes, discharge instructions, lab results, or pathology letters below. The decoder will automatically scan and translate complex terms in real-time.
          </p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your medical note here... e.g. Patient displays menorrhagia and dysmenorrhea. Referral for diagnostic laparoscopy to rule out pelvic endometriosis..."
            className="custom-textarea mt-3"
            rows="10"
          ></textarea>

          <div className="decoder-help-banner text-xs mt-3 flex-center-gap text-muted">
            <HelpCircle size={14} className="text-primary" />
            <span>Try typing words like <strong>dysmenorrhea</strong>, <strong>menorrhagia</strong>, <strong>adenomyosis</strong>, or <strong>TPO antibodies</strong> to see instant results.</span>
          </div>
        </div>

        {/* Right Panel: Output translations */}
        <div className="card translation-card">
          <div className="card-header-with-icon">
            <Search className="text-accent" size={24} />
            <h2>Plain-Language Decoding</h2>
          </div>
          <p className="card-desc text-small">Empathetic translation and pronunciation guides.</p>

          {decodedMatches.length > 0 ? (
            <div className="decoded-matches-list mt-3">
              <div className="matched-counter-badge mb-2">
                Parsed {decodedMatches.length} Clinical Terms:
              </div>
              {decodedMatches.map((item, idx) => (
                <div key={idx} className="card match-item-card fade-in border-left-green">
                  <div className="match-card-header justify-between">
                    <div>
                      <h4 className="match-term-title">{item.term}</h4>
                      <span className="pronunciation">Pronounced: <em>{item.pronunciation}</em></span>
                    </div>
                    <span className="badge badge-success">Translated</span>
                  </div>

                  <p className="translation-summary mt-2 font-semibold">
                    {item.translation}
                  </p>
                  
                  <p className="translation-details mt-2 text-xs text-muted">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          ) : inputText.trim().length > 0 ? (
            <div className="empty-state-card text-center flex-col-center py-12">
              <HelpCircle size={36} className="text-muted mb-2" />
              <h4>No matching clinical terms detected</h4>
              <p className="text-xs max-w-sm mt-1">
                We couldn't find matches in our localized medical dictionary. Double-check your spelling or browse the complete glossary below.
              </p>
            </div>
          ) : (
            <div className="glossary-explorer-section mt-3">
              <h4 className="mb-2">Frequently Decoded Glossary</h4>
              <div className="glossary-grid-scroll">
                {Object.values(dictionary).slice(0, 6).map((item, idx) => (
                  <div key={idx} className="glossary-item-card">
                    <h5>{item.term}</h5>
                    <p className="text-xs text-muted font-semibold">{item.translation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
