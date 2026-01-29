import { motion } from "framer-motion";
import { Home, Calendar, Upload, Heart, Menu, X, Image } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isRoute?: boolean;
}

const NavLink = ({ href, icon, label, onClick, isRoute }: NavLinkProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    if (isRoute) {
      navigate(href);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm shadow-baby hover:shadow-baby-card transition-all duration-300 text-foreground font-medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </motion.a>
  );
};

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#home", icon: <Home size={18} />, label: "Home" },
    { href: "#milestones", icon: <Calendar size={18} />, label: "Milestones" },
    { href: "#firsts", icon: <Heart size={18} />, label: "Firsts" },
    { href: "#game", icon: <Heart size={18} />, label: "Game" },
    { href: "#upload", icon: <Upload size={18} />, label: "Upload" },
    { href: "/gallery", icon: <Image size={18} />, label: "Gallery", isRoute: true },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 p-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm shadow-baby-card ml-auto"
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 right-4 flex flex-col gap-2 bg-card/95 backdrop-blur-md rounded-3xl p-4 shadow-baby-float"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
