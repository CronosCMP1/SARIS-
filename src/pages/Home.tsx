import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Product, Banner } from '../types';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // Fetch Banners
        const { data: bannersData, error: bannersError } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });

        if (bannersError) throw bannersError;

        setProducts(productsData || []);
        
        // Map banners to match interface if needed (Supabase returns snake_case, types might be camelCase)
        // Check types.ts to be sure, but assuming direct mapping for now or manual mapping
        const mappedBanners = bannersData?.map((b: any) => ({
          id: b.id,
          image: b.image,
          title: b.title,
          subtitle: b.subtitle,
          buttonText: b.button_text, // Map snake_case to camelCase
          link: b.link
        })) || [];

        setBanners(mappedBanners);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default banner if no banners are returned from API
  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 0,
      image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&q=80&w=2000",
      title: "COLEÇÃO PRIMAVERA",
      subtitle: "A elegância das flores naturais",
      buttonText: "VER COLEÇÃO",
      link: "#"
    }
  ];

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayBanners]);

  const nextSlide = () => {
    if (displayBanners.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = () => {
    if (displayBanners.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Slider */}
      <section className="relative h-[80vh] bg-[#F3E5D8] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img 
              src={displayBanners[currentSlide].image} 
              alt={displayBanners[currentSlide].title || "Banner"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div className="max-w-4xl px-4">
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-medium"
                >
                  {displayBanners[currentSlide].subtitle}
                </motion.p>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 tracking-wide"
                >
                  {displayBanners[currentSlide].title}
                </motion.h1>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link 
                    to={displayBanners[currentSlide].link || "#"} 
                    className="inline-block bg-white text-[#1A1A1A] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#657965] hover:text-white transition-colors"
                  >
                    {displayBanners[currentSlide].buttonText || "EXPLORAR"}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        {displayBanners.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronLeft size={32} strokeWidth={1} />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronRight size={32} strokeWidth={1} />
            </button>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium uppercase tracking-[0.2em] mb-4 relative inline-block">
            Produtos
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-black"></span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Nenhum produto encontrado.</p>
          </div>
        )}
      </section>
    </div>
  );
}
