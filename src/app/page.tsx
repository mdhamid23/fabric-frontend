"use client";

import { motion, Variants } from "framer-motion";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  };

  return (
    <section className="relative w-full flex items-center justify-center">
      {/* Remove the gradient blur for light mode, keep for dark */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-700/20 blur-[140px] pointer-events-none dark:block hidden" />

      <motion.div
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left */}
        <div className="max-w-2xl space-y-8">
          <motion.div variants={itemVariants} className="theme-label">
            ● VALIDATING NOW
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-black dark:text-white">
              OBE platform
              <br />
              you can actually
              <br />
              <span className="theme-heading-accent">trust.</span>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-lg leading-8 text-gray-600 dark:text-white/55"
          >
            A modern academic platform for outcome-based education, centralized
            data visibility, structured validation, and a cleaner digital
            workflow across departments.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 pt-2"
          >
            <button className="theme-button-primary px-6 py-3 font-medium transition-all">
              Get started
            </button>
            <button className="theme-button-secondary px-6 py-3 font-medium transition-all">
              See how it works
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 pt-10 max-w-lg"
          >
            <div>
              <div className="text-4xl font-semibold text-black dark:text-white">
                2,841
              </div>
              <div className="mt-2 text-xs tracking-[0.22em] text-gray-500 dark:text-white/45 uppercase">
                Records Validated
              </div>
            </div>

            <div>
              <div className="text-4xl font-semibold text-black dark:text-white">
                47
              </div>
              <div className="mt-2 text-xs tracking-[0.22em] text-gray-500 dark:text-white/45 uppercase">
                Entities
              </div>
            </div>

            <div>
              <div className="text-4xl font-semibold text-black dark:text-white">
                99
              </div>
              <div className="mt-2 text-xs tracking-[0.22em] text-gray-500 dark:text-white/45 uppercase">
                Accuracy %
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="theme-terminal w-full max-w-3xl ml-auto">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/8">
              <span className="w-3 h-3 bg-gray-300 dark:bg-white/12" />
              <span className="w-3 h-3 bg-gray-300 dark:bg-white/12" />
              <span className="w-3 h-3 bg-gray-300 dark:bg-white/12" />
              <span className="ml-4 text-sm text-gray-400 dark:text-white/25">
                fst-platform-cli
              </span>
            </div>

            <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-8 text-gray-700 dark:text-white/75">
              <div>$ fst validate --batch</div>
              <div className="text-gray-500 dark:text-white/35">
                → Ingesting course and assessment data...
              </div>
              <div className="text-gray-500 dark:text-white/35">
                → Cross-checking mapped outcomes...
              </div>
              <div className="text-green-600 dark:text-violet-400">
                ✓ 2,841 validated ▲ 4 flagged × 2 rejected
              </div>
              <div className="text-gray-500 dark:text-white/35">
                → Generating department report...
              </div>
              <div className="text-green-600 dark:text-violet-400">
                ✓ Report saved: fst-q4-audit.pdf
              </div>
              <div className="mt-2 w-3 h-6 bg-gray-400 dark:bg-white/35 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
