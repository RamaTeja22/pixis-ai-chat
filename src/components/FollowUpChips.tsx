import React from 'react';
import { motion } from 'framer-motion';

interface FollowUpChipsProps {
  suggestions: string[];
  onFollowUp: (prompt: string) => void;
}

const FollowUpChips: React.FC<FollowUpChipsProps> = ({ suggestions, onFollowUp }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Follow-up questions</h4>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFollowUp(suggestion)}
            className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border hover:border-border/60 transition-all duration-200 cursor-pointer"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpChips;
