import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog Container - Centered */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-auto"
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export function DialogContent({ children, className = "" }) {
    return (
        <div className={`w-full max-w-lg rounded-xl overflow-hidden glass-panel border border-white/10 shadow-2xl ${className} bg-[#1a1a1a]`}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className = "" }) {
    return (
        <div className={`px-6 py-4 border-b border-white/5 flex items-center justify-between ${className}`}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className = "" }) {
    return (
        <h2 className={`text-lg font-semibold text-white ${className}`}>
            {children}
        </h2>
    );
}

export function DialogFooter({ children, className = "" }) {
    return (
        <div className={`px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-end gap-3 ${className}`}>
            {children}
        </div>
    );
}
