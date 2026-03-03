import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Layout as LayoutIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Product Schema
const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatório'),
  images: z.string().min(1, 'Pelo menos uma URL de imagem é obrigatória'), // Textarea for URLs
  tags: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
});

// Banner Schema
const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  link: z.string().optional(),
  image: z.string().min(1, 'URL da imagem é obrigatória'),
});

type ProductForm = z.infer<typeof productSchema>;
type BannerForm = z.infer<typeof bannerSchema>;

import { Product, Banner } from '../types';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'banners'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Product Form
  const { register: registerProduct, handleSubmit: handleSubmitProduct, reset: resetProduct, setValue: setValueProduct, watch: watchProduct, formState: { errors: productErrors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tags: [],
      sizes: []
    }
  });

  // Watch for checkbox changes
  const selectedTags = watchProduct('tags') || [];
  const selectedSizes = watchProduct('sizes') || [];

  // Banner Form
  const { register: registerBanner, handleSubmit: handleSubmitBanner, reset: resetBanner, formState: { errors: bannerErrors } } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, bannersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/banners')
      ]);
      setProducts(productsRes.data);
      setBanners(bannersRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setFetchError('Erro ao carregar dados. Verifique se a tabela "products" e "banners" existem no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Product Handlers
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setValueProduct('name', product.name);
      setValueProduct('description', product.description);
      setValueProduct('price', product.price.toString());
      setValueProduct('images', product.images.join('\n')); // Join URLs with newline
      setValueProduct('tags', product.tags || []);
      setValueProduct('sizes', product.sizes || []);
    } else {
      setEditingProduct(null);
      resetProduct();
      setValueProduct('tags', []);
      setValueProduct('sizes', []);
    }
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    resetProduct();
  };

  const onProductSubmit = async (data: ProductForm) => {
    // Parse images from textarea (split by newline and filter empty)
    const images = data.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);

    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      images: images,
      tags: data.tags || [],
      sizes: data.sizes || []
    };

    console.log('Submitting payload:', payload);

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      fetchData();
      closeProductModal();
      alert('Produto salvo com sucesso!');
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao salvar produto: ${errorMessage}`);
    }
  };

  const onProductErrors = (errors: any) => {
    console.error('Validation errors:', errors);
    alert('Erro de validação. Verifique os campos preenchidos.');
  };

  // Banner Handlers
  const openBannerModal = () => {
    resetBanner();
    setIsBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    resetBanner();
  };

  const onBannerSubmit = async (data: BannerForm) => {
    try {
      await axios.post('/api/banners', data);
      fetchData();
      closeBannerModal();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Erro ao salvar banner. Verifique o console.');
    }
  };

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'product' | 'banner', id: number } | null>(null);

  // ... (existing code)

  const handleDeleteProduct = (id: number) => {
    setDeleteConfirmation({ type: 'product', id });
  };

  const handleDeleteBanner = (id: number) => {
    setDeleteConfirmation({ type: 'banner', id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === 'product') {
        await axios.delete(`/api/products/${deleteConfirmation.id}`);
      } else {
        await axios.delete(`/api/banners/${deleteConfirmation.id}`);
      }
      fetchData();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erro ao excluir item. Verifique o console.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('SQL copiado para a área de transferência!');
  };

  const sqlCommands = `
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[], -- Array of image URLs
  tags TEXT[], -- Array of tags (e.g., 'best_seller')
  sizes TEXT[], -- Array of sizes (e.g., 'P', 'M', 'G', 'GG')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security model)
-- Allow public read access
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public banners are viewable by everyone" ON banners FOR SELECT USING (true);

-- Allow authenticated (or anon for now if you want to allow admin via API) insert/update/delete
-- Note: For a real app, you'd restrict this to authenticated admin users.
-- For this demo with a custom admin panel, we might need to allow anon write if we use the anon key on the server,
-- OR use the service_role key on the server (which is safer but I don't have it).
-- Given I only have the ANON key, I must allow anon writes for the admin panel to work via the client,
-- OR I rely on the server to handle it. But the server also only has the anon key unless I was given the service key.
-- Wait, the user provided SUPABASE_ANON_KEY.
-- So I must allow anon inserts/updates for the admin panel to work.
CREATE POLICY "Enable insert for anon" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for anon" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for anon" ON products FOR DELETE USING (true);

CREATE POLICY "Enable insert for anon" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for anon" ON banners FOR DELETE USING (true);
`;

  const secureSqlCommands = `
-- 🔒 SECURITY FIX: Disable public write access
-- Run this AFTER adding SUPABASE_SERVICE_ROLE_KEY to your server environment variables.

-- Drop insecure policies for Products
DROP POLICY IF EXISTS "Enable insert for anon" ON products;
DROP POLICY IF EXISTS "Enable update for anon" ON products;
DROP POLICY IF EXISTS "Enable delete for anon" ON products;

-- Drop insecure policies for Banners
DROP POLICY IF EXISTS "Enable insert for anon" ON banners;
DROP POLICY IF EXISTS "Enable delete for anon" ON banners;

-- Ensure Public Read Access still works
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public banners are viewable by everyone" ON banners FOR SELECT USING (true);

-- (Optional) If you want to be explicit, you can add a policy that allows nothing else,
-- but removing the "Enable..." policies above effectively denies access to anon users
-- because RLS is "Deny by Default".
-- The Service Role Key (used on server) bypasses RLS completely, so it will still work.
`;

  return (
    <div className="space-y-8">
      {/* ... Header and Tabs ... */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-[#4B5320]">
          Painel Administrativo
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <LayoutIcon size={18} />
            Configurar / Segurança
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-[#4B5320] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === 'banners' ? 'bg-[#4B5320] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Banners
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {activeTab === 'products' ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => openProductModal()}
              className="bg-[#4B5320] hover:bg-[#3A4018] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Imagem</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Nome</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Preço</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                          {product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1A1A1A]">{product.name}</td>
                      <td className="px-6 py-4 text-[#D4AF37] font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openProductModal(product)}
                            className="p-2 text-gray-400 hover:text-[#4B5320] hover:bg-[#4B5320]/10 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Nenhum produto cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => openBannerModal()}
              className="bg-[#4B5320] hover:bg-[#3A4018] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>Novo Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group relative">
                <div className="aspect-video relative">
                  <img 
                    src={banner.image} 
                    alt={banner.title || 'Banner'} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                    {banner.title && <h3 className="text-xl font-serif font-bold">{banner.title}</h3>}
                    {banner.subtitle && <p className="text-sm opacity-80">{banner.subtitle}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                Nenhum banner cadastrado.
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-[#1A1A1A]">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button 
                  onClick={closeProductModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitProduct(onProductSubmit, onProductErrors)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    {...registerProduct('name')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                  {productErrors.name && <span className="text-red-500 text-xs">{productErrors.name.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    {...registerProduct('description')}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none"
                  />
                  {productErrors.description && <span className="text-red-500 text-xs">{productErrors.description.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerProduct('price')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                  {productErrors.price && <span className="text-red-500 text-xs">{productErrors.price.message}</span>}
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        value="best_seller"
                        {...registerProduct('tags')}
                        className="w-4 h-4 text-[#4B5320] rounded border-gray-300 focus:ring-[#4B5320]"
                      />
                      <span className="text-sm text-gray-600">Mais Vendido</span>
                    </label>
                  </div>
                </div>

                {/* Sizes Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanhos Disponíveis</label>
                  <div className="flex flex-wrap gap-4">
                    {['P', 'M', 'G', 'GG'].map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          value={size}
                          {...registerProduct('sizes')}
                          className="w-4 h-4 text-[#4B5320] rounded border-gray-300 focus:ring-[#4B5320]"
                        />
                        <span className="text-sm text-gray-600">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URLs das Imagens (uma por linha)</label>
                  <textarea
                    {...registerProduct('images')}
                    rows={4}
                    placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none font-mono text-xs"
                  />
                  {productErrors.images && <span className="text-red-500 text-xs">{productErrors.images.message}</span>}
                  <p className="text-xs text-gray-400 mt-1">
                    Cole os links das imagens, um por linha.
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4B5320] hover:bg-[#3A4018] text-white rounded-xl transition-colors shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner Modal */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Novo Banner</h3>
                <button 
                  onClick={closeBannerModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitBanner(onBannerSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título (Opcional)</label>
                  <input
                    {...registerBanner('title')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Opcional)</label>
                  <input
                    {...registerBanner('subtitle')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão (Opcional)</label>
                  <input
                    {...registerBanner('buttonText')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (Opcional)</label>
                  <input
                    {...registerBanner('link')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Obrigatória)</label>
                  <input
                    {...registerBanner('image')}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                  {bannerErrors.image && <span className="text-red-500 text-xs">{bannerErrors.image.message}</span>}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeBannerModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4B5320] hover:bg-[#3A4018] text-white rounded-xl transition-colors shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Setup Modal */}
      <AnimatePresence>
        {isSetupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Configuração e Segurança</h3>
                <button 
                  onClick={() => setIsSetupModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* Initial Setup Section */}
                <div>
                  <h4 className="font-bold text-[#4B5320] mb-2 flex items-center gap-2">
                    1. Configuração Inicial (Tabelas)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use este script para criar as tabelas necessárias se ainda não existirem.
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono h-32">
                      {sqlCommands}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(sqlCommands)}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                    >
                      Copiar SQL Inicial
                    </button>
                  </div>
                </div>

                {/* Security Fix Section */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                    2. Correção de Segurança (RLS)
                  </h4>
                  <p className="text-sm text-red-600 mb-4">
                    <strong>Atenção:</strong> Atualmente, o banco permite escritas públicas (necessário para a Chave Anônima).
                    Para corrigir isso:
                    <ol className="list-decimal list-inside mt-2 ml-2 space-y-1">
                      <li>Obtenha a <strong>Service Role Key</strong> (secret) no painel do Supabase.</li>
                      <li>Adicione ela nas variáveis de ambiente do servidor como <code>SUPABASE_SERVICE_ROLE_KEY</code>.</li>
                      <li>Execute o script abaixo para <strong>bloquear</strong> escritas públicas.</li>
                    </ol>
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono h-32">
                      {secureSqlCommands}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(secureSqlCommands)}
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                    >
                      Copiar SQL de Segurança
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setIsSetupModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  Excluir {deleteConfirmation.type === 'product' ? 'Produto' : 'Banner'}?
                </h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir este {deleteConfirmation.type === 'product' ? 'produto' : 'banner'}? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteConfirmation(null)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium shadow-sm"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
