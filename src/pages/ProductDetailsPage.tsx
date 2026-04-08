import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setProduct(data);
        // Select first size by default if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B5320]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-600">Produto não encontrado.</p>
        <Link to="/" className="text-[#4B5320] hover:underline mt-4 inline-block">
          Voltar para Home
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const whatsappMessage = `Olá! Tenho interesse no produto ${product.name} ${selectedSize ? `(Tamanho: ${selectedSize})` : ''} no valor de ${formatPrice(product.price)}.`;
  const whatsappLink = `https://wa.me/5561992143032?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppClick = () => {
    // Meta Pixel Tracking
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BRL'
      });
    }
    // Google Tag Manager Tracking
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'whatsapp_click',
        ecommerce: {
          items: [{
            item_name: product.name,
            item_id: product.id,
            price: product.price,
            currency: 'BRL',
            item_variant: selectedSize || undefined
          }]
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#4B5320] mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden">
            {product.images.length > 0 ? (
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                Sem imagem
              </div>
            )}

            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === idx ? 'border-[#4B5320]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1A1A1A] mb-4">
            {product.name}
          </h1>
          
          <p className="text-2xl text-[#D4AF37] font-bold mb-6">
            {formatPrice(product.price)}
          </p>

          <div className="prose prose-stone mb-8 text-gray-600">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Tamanho</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${
                      selectedSize === size
                        ? 'bg-[#4B5320] text-white border-[#4B5320]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#4B5320]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <MessageCircle size={24} />
            Comprar por WhatsApp
          </a>

          <p className="mt-6 text-xs text-gray-400 text-center md:text-left">
            Ao clicar em comprar, você será redirecionado para o WhatsApp para finalizar seu pedido com um de nossos atendentes.
          </p>
        </div>
      </div>
    </div>
  );
}
