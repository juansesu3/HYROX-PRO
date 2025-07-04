'use client';

import { motion } from 'framer-motion';

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.h1
        className="text-3xl md:text-5xl font-bold mb-4 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🚧 <br />Estamos trabajando
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Estamos trabajando en nuevas funciones PRO para ti.
        <br />
        ¡Estarán disponibles muy pronto! 💙
      </motion.p>

      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.span
          className="block w-3 h-3 bg-blue-600 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0,
          }}
        />
        <motion.span
          className="block w-3 h-3 bg-blue-600 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.span
          className="block w-3 h-3 bg-blue-600 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
      </motion.div>
    </div>
  );
}
