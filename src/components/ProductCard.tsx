import React, { useState } from 'react';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const whatsappMessage = `Olá! Tenho interesse no produto ${product.name} no valor de ${formatPrice(product.price)}.`;
  const whatsappLink = `https://wa.me/5561992143032?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4">
        {product.images.length > 0 ? (
          <Link to={`/produto/${product.id}`} className="block w-full h-full">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
            Sem imagem
          </div>
        )}
        
        {/* Navigation Arrows - Visible on Hover */}
        {product.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-200 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <ChevronLeft size={32} strokeWidth={1} />
            </button>
            <button 
              onClick={nextImage}
              className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-200 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <ChevronRight size={32} strokeWidth={1} />
            </button>
          </>
        )}
      </div>

      <div className="text-center flex flex-col flex-grow">
        <h3 className="text-base font-light text-[#1A1A1A] mb-1 tracking-wide">
          <Link to={`/produto/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <span className="text-sm font-medium text-gray-400 mb-3">
          {formatPrice(product.price)}
        </span>
        
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm hover:shadow-md mx-auto w-full max-w-[200px]"
        >
          <MessageCircle size={14} />
          Comprar por WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export default ProductCard;
