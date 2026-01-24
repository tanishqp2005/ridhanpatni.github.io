import { motion } from "framer-motion";
import { Heart, Cake, Star } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-card/50">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            <Star size={24} className="text-baby-yellow fill-baby-yellow" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            <Cake size={32} className="text-primary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            <Star size={24} className="text-baby-yellow fill-baby-yellow" />
          </motion.div>
        </div>

        <h3 className="text-2xl font-fredoka font-semibold text-foreground mb-2">
          Happy 1st Birthday! 🎂
        </h3>
        <p className="text-muted-foreground mb-4">
          Born February 17, 2025
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart size={16} className="text-primary fill-primary" />
          <span>for our little one</span>
        </div>
      </motion.div>
    </footer>
  );
};
