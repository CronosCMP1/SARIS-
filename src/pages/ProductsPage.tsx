import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const tagFilter = searchParams.get('tag');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/products');
        let filteredProducts = response.data;

        if (tagFilter) {
          filteredProducts = filteredProducts.filter((p: Product) => 
            p.tags?.includes(tagFilter)
          );
        }

        // If on "Por Tamanho" page
        if (window.location.pathname.includes('por-tamanho')) {
             // If a specific size is selected via state (or query param if we wanted to sync url)
             if (selectedSize) {
               filteredProducts = filteredProducts.filter((p: Product) => p.sizes?.includes(selectedSize));
             } else {
               // Show all products that have at least one size defined
               filteredProducts = filteredProducts.filter((p: Product) => p.sizes && p.sizes.length > 0);
             }
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tagFilter, selectedSize]);

  const getTitle = () => {
    if (tagFilter === 'best_seller') return 'Mais Vendidos';
    if (window.location.pathname.includes('por-tamanho')) return 'Por Tamanho';
    return 'Produtos';
  };

  const isSizePage = window.location.pathname.includes('por-tamanho');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-normal tracking-widest uppercase text-[#657965] mb-4">
          {getTitle()}
        </h1>
        <div className="w-16 h-[1px] bg-[#657965] mx-auto mb-8"></div>

        {/* Size Filter */}
        {isSizePage && (
          <div className="flex justify-center gap-4 mb-8">
            {['P', 'M', 'G', 'GG'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  selectedSize === size
                    ? 'bg-[#657965] text-white border-[#657965]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#657965]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
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
          <p className="text-lg">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}
