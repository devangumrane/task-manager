import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <motion.div
            className={`glass-panel rounded-xl p-6 ${className} ${hoverEffect ? 'hover:bg-card/80 hover:shadow-2xl transition-all duration-300' : ''
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
