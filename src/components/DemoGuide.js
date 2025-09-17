import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Step = ({ idx, title, desc, cta, onDo }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500">Step {idx}</p>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{desc}</p>
      </div>
      {onDo && (
        <button onClick={onDo} className="ml-3 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs">{cta || 'Do it'}</button>
      )}
    </div>
  </div>
);

const DemoGuide = ({ open, onClose, actions }) => {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="w-full max-w-[375px] bg-white rounded-t-2xl p-5"
          onClick={(e)=>e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Step-by-step Demo</h3>
            <button onClick={onClose} className="text-gray-500 text-sm">Close</button>
          </div>

          <div className="space-y-3">
            <Step idx={1} title="Patient • Toggle consent" desc="Enable Research participation to generate a consent receipt and log the event." cta="Do it" onDo={actions?.consent} />
            <Step idx={2} title="Doctor • View a case ($10)" desc="Simulate a doctor viewing a similar case; patient earns $1 micro‑royalty." cta="Do it" onDo={actions?.doctor} />
            <Step idx={3} title="Pharma • Request/Buy dataset" desc="Run packaging and simulate a micro‑payout to the patient wallet." cta="Do it" onDo={actions?.pharma} />
            <Step idx={4} title="Wallet • See new earnings" desc="Open wallet to showcase updated balance and activity." cta="Open" onDo={actions?.wallet} />
            <Step idx={5} title="Audit log • Verify access" desc="Show immutable events recorded during the demo." cta="Open" onDo={actions?.audit} />
          </div>

          <div className="mt-4 text-[11px] text-gray-500">
            Tip: Use the role switch at the top to explore each perspective.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoGuide;


