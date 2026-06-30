import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ value, label }) {
  const ref = useRef();
  const isInView = useInView(ref);
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-7xl font-bold gradient-text mb-4">
        ${count.toLocaleString()}
      </div>
      <div className="text-xl text-gray-400">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-32 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Growing Threat
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Online scams are becoming more sophisticated every day.
            Don't become a statistic.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          <AnimatedCounter value="10000000000000" label="Lost to Scams Annually" />
          <AnimatedCounter value="500000000" label="Phishing Attacks Yearly" />
          <AnimatedCounter value="1" label="New Scam Every 20 Seconds" />
        </div>

        <div className="mt-20 glass p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-400 mb-2">76%</div>
              <div className="text-sm text-gray-400">Phishing Emails</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">65%</div>
              <div className="text-sm text-gray-400">Fake Websites</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">45%</div>
              <div className="text-sm text-gray-400">Social Media Scams</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">32%</div>
              <div className="text-sm text-gray-400">Crypto Scams</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}