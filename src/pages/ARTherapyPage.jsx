import React from 'react';
import ARTherapySession from '../components/ARTherapySession';
import { motion } from 'framer-motion';

const ARTherapyPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"
    >
      <ARTherapySession />
    </motion.div>
  );
};

export default ARTherapyPage;