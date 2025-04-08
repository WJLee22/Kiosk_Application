import React from 'react';
import { motion } from 'framer-motion';

function Front() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="front-screen"
        >
            <h1>어서오세요, Barion 키오스크입니다!</h1>
        </motion.div>
    );
}

export default Front;
