import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// Supabase Setup
const supabaseUrl = 'https://djbloiengqedfosppwga.supabase.co';
// Prioritize Service Role Key (Secret) for backend operations. 
// Fallback to Anon Key (Public) only for development/demo, but this requires insecure RLS policies.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_LzQ6dnrTbWQDxGtKYObbuw_6ogo46Sl';
const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not found. Using Anon Key.');
  console.warn('   For security, add SUPABASE_SERVICE_ROLE_KEY to your environment variables');
  console.warn('   and disable "anon" write access in Supabase RLS policies.');
}

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded credentials as requested
  if (username === 'saris2412' && password === '245178s') {
    res.json({ success: true, token: 'admin-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get Products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Get Product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

// Get Banners
app.get('/api/banners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const mappedBanners = data?.map(b => ({
      id: b.id,
      image: b.image,
      title: b.title,
      subtitle: b.subtitle,
      buttonText: b.button_text,
      link: b.link
    }));

    res.json(mappedBanners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, message: 'Error fetching banners' });
  }
});

// Create Banner
app.post('/api/banners', async (req, res) => {
  try {
    const { title, subtitle, buttonText, link, image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const { data, error } = await supabase
      .from('banners')
      .insert([
        { 
          image, 
          title, 
          subtitle, 
          button_text: buttonText, 
          link 
        }
      ])
      .select();

    if (error) throw error;
    
    res.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating banner' });
  }
});

// Delete Banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting banner' });
  }
});

// Create Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, tags, sizes, images } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price: parseFloat(price.toString().replace(',', '.')),
          images: images || [],
          tags: tags || [],
          sizes: sizes || []
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }

    res.json({ success: true, id: data[0].id });
  } catch (error: any) {
    console.error('Server Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating product', details: error });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags, sizes, images } = req.body;
    
    const { error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price.toString().replace(',', '.')),
        images: images || [],
        tags: tags || [],
        sizes: sizes || []
      })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

// Vite middleware setup
import { createServer as createViteServer } from 'vite';

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
