import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stepsConfig = [
  { id: 'role', title: 'Role Switch', desc: 'Switch between Patient, Doctor, and Pharma to see each perspective.' },
  { id: 'consent', title: 'Consent Toggle', desc: 'Enable Research participation to generate a consent receipt and log the event.' },
  { id: 'doctor-search', title: 'Doctor Search', desc: 'Doctors search similar cases. No raw patient files are shared here.' },
  { id: 'pharma-custom', title: 'Custom Request', desc: 'Pharma can request specific cohorts by condition, size, and location.' },
  { id: 'wallet-balance', title: 'Wallet', desc: 'See micro‑royalties and dataset earnings appear instantly.' },
  { id: 'audit-log', title: 'Audit Log', desc: 'Every access is recorded for transparency and compliance.' }
];

const GuidedTour = ({ open, onClose, stepIndex = 0, setStepIndex }) => {
  const [anchorRect, setAnchorRect] = useState(null);
  const step = stepsConfig[stepIndex] || null;

  useEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(`[data-tour="${step.id}"]`);
    if (!el) { setAnchorRect(null); return; }
    const rect = el.getBoundingClientRect();
    setAnchorRect(rect);
  }, [open, stepIndex]);

  if (!open || !step) return null;

  const next = () => setStepIndex(Math.min(stepsConfig.length - 1, stepIndex + 1));
  const prev = () => setStepIndex(Math.max(0, stepIndex - 1));

  const style = anchorRect ? {
    position: 'fixed',
    top: Math.min(window.innerHeight - 140, anchorRect.bottom + 8),
    left: Math.max(8, Math.min(window.innerWidth - 360, anchorRect.left)),
    width: 320,
    zIndex: 40
  } : {
    position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: 320, zIndex: 40
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />
        {/* Coachmark */}
        <div style={style}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">{stepIndex + 1} / {stepsConfig.length}</p>
            <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{step.desc}</p>
            <div className="flex items-center justify-between mt-3">
              <button onClick={onClose} className="text-xs text-gray-500">Skip</button>
              <div className="space-x-2">
                <button onClick={prev} disabled={stepIndex===0} className="px-3 py-1 rounded-lg text-xs bg-gray-100 disabled:opacity-50">Back</button>
                <button onClick={next} disabled={stepIndex===stepsConfig.length-1} className="px-3 py-1 rounded-lg text-xs bg-blue-600 text-white disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuidedTour;


