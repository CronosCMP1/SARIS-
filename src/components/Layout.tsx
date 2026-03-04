import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Search, User, Menu, X, Crown, Instagram, Phone } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ children, isAdmin }: LayoutProps) {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const { scrollY } = useScroll();
  
  // Header animation: Zoom out and fade out on scroll
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const headerY = useTransform(scrollY, [0, 100], [0, -100]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
      {/* Top Bar */}
      <AnimatePresence>
        {showTopBar && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#657965] text-white relative overflow-hidden z-[60]"
          >
            <div className="container mx-auto px-4 py-2 flex justify-between items-center text-[10px] sm:text-xs font-medium tracking-widest uppercase">
              <Crown size={16} className="text-white/80" />
              <span className="flex-1 text-center">CUPOM 5% OFF PARA PRIMEIRAS COMPRAS</span>
              <button onClick={() => setShowTopBar(false)} className="hover:opacity-50 transition-opacity">
                <X size={16} className="text-white/80" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header 
        style={{ scale: headerScale, opacity: headerOpacity, y: headerY }}
        className="bg-white sticky top-0 z-50 border-b border-gray-50 origin-top"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            
            {/* Mobile Menu Button (Left) */}
            <div className="md:hidden">
              <button 
                className="p-2 -ml-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Logo - Left on Desktop */}
            <div className="flex-1 text-center md:text-left md:flex-none">
              <Link to="/" className="inline-block group">
                <span className="text-4xl md:text-5xl font-serif font-normal tracking-[0.05em] text-[#657965]">SARIS</span>
              </Link>
            </div>

            {/* Desktop Navigation - Right */}
            <nav className="hidden md:flex flex-1 justify-end items-center gap-8">
              <ul className="flex gap-8">
                <li>
                  <Link 
                    to="/mais-vendidos?tag=best_seller" 
                    className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#1A1A1A] hover:opacity-60 transition-opacity relative group"
                  >
                    Mais Vendidos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/por-tamanho" 
                    className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#1A1A1A] hover:opacity-60 transition-opacity relative group"
                  >
                    Por Tamanho
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/assinaturas" 
                    className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#1A1A1A] hover:opacity-60 transition-opacity relative group"
                  >
                    Assinaturas
                  </Link>
                </li>
              </ul>

              {/* Right Icons */}
              <div className="flex items-center gap-4 border-l border-gray-200 pl-8 ml-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-1 hover:opacity-60 transition-opacity"
                  >
                    <Search size={18} strokeWidth={1.5} />
                  </button>
                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 200 }}
                        exit={{ opacity: 0, width: 0 }}
                        className="absolute right-0 top-full mt-2 h-8 flex items-center bg-white border border-gray-200 px-2 shadow-sm"
                      >
                        <input 
                          type="text" 
                          placeholder="BUSCAR..." 
                          className="w-full py-1 text-xs outline-none uppercase tracking-wide bg-transparent"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isAdmin ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:opacity-60 transition-opacity text-xs font-medium uppercase tracking-wider"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                  </button>
                ) : (
                  <Link 
                    to="/admin" 
                    className="p-1 hover:opacity-60 transition-opacity"
                  >
                    <User size={18} strokeWidth={1.5} />
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile Right Icons */}
            <div className="flex md:hidden items-center gap-4">
               <Link 
                  to="/admin" 
                  className="p-1 hover:opacity-60 transition-opacity"
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Edge Swipe Trigger for Opening Menu */}
      <motion.div 
        className="fixed top-0 bottom-0 left-0 w-8 z-40 md:hidden"
        onPanEnd={(e, info) => {
            if (info.offset.x > 50) {
                setIsMobileMenuOpen(true);
            }
        }}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (info.offset.x < -100 || info.velocity.x < -500) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className="bg-white w-[85%] max-w-[300px] h-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-serif tracking-widest uppercase text-[#657965]">SARIS</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-gray-500 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
              </div>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/mais-vendidos?tag=best_seller" 
                    className="block text-sm font-medium uppercase tracking-widest py-4 border-b border-gray-50 hover:text-[#657965] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mais Vendidos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/por-tamanho" 
                    className="block text-sm font-medium uppercase tracking-widest py-4 border-b border-gray-50 hover:text-[#657965] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Por Tamanho
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/assinaturas" 
                    className="block text-sm font-medium uppercase tracking-widest py-4 border-b border-gray-50 hover:text-[#657965] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Assinaturas
                  </Link>
                </li>
                {/* Admin Link in Mobile Menu */}
                <li>
                  <Link 
                    to="/admin" 
                    className="block text-sm font-medium uppercase tracking-widest py-4 border-b border-gray-50 hover:text-[#657965] transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    Área do Cliente / Admin
                  </Link>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#f9f9f9] text-[#1A1A1A] pt-16 pb-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="font-bold uppercase tracking-widest mb-6 text-xs">Navegação</h4>
              <ul className="space-y-3 text-xs text-gray-600">
                <li><Link to="#" className="hover:text-[#657965]">Buquês</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Vasos</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Complementos</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Sobre nós</Link></li>
              </ul>
            </div>
            
            <div className="text-center">
               <h4 className="font-bold uppercase tracking-widest mb-6 text-xs">Redes Sociais</h4>
               <div className="flex justify-center gap-6">
                 <a 
                   href="https://instagram.com/saris.bsb" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex flex-col items-center gap-2 group"
                 >
                   <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#657965] group-hover:text-[#657965] transition-colors">
                     <Instagram size={18} />
                   </div>
                   <span className="text-[10px] uppercase tracking-wider">Instagram</span>
                 </a>
                 <a 
                   href="https://api.whatsapp.com/send?phone=5561992143032&text=Ol%C3%A1%2C+gostaria+de+um+buque+%21" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex flex-col items-center gap-2 group"
                 >
                   <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#657965] group-hover:text-[#657965] transition-colors">
                     <Phone size={18} />
                   </div>
                   <span className="text-[10px] uppercase tracking-wider">WhatsApp</span>
                 </a>
               </div>
            </div>

            <div className="md:text-right">
              <h4 className="font-bold uppercase tracking-widest mb-6 text-xs">Institucional</h4>
              <ul className="space-y-3 text-xs text-gray-600">
                <li><Link to="#" className="hover:text-[#657965]">Termos de Uso</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Política de Privacidade</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Contato</Link></li>
                <li><Link to="#" className="hover:text-[#657965]">Trabalhe Conosco</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              &copy; {new Date().getFullYear()} Saris Cestas e Buquês. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
