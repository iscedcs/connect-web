"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function SubmissionModal({ submission, onClose }: any) {
  const values = submission?.values || {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.45 }}
          className="
            bg-neutral-900 border border-white/10 rounded-2xl p-6 
            w-[90%] max-w-md max-h-[90vh] overflow-y-auto space-y-4
          ">
          <h2 className="text-lg font-semibold mb-4">Submission Detail</h2>

          {/* Fields */}
          <div className="space-y-3">
            {Object.entries(values).map(([key, val]: any) => (
              <div
                key={key}
                className="border border-white/10 rounded-lg p-3 bg-neutral-800/30">
                <p className="text-xs text-white/40">{key}</p>
                <p className="text-sm text-white/90 whitespace-pre-wrap">
                  {String(val)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
