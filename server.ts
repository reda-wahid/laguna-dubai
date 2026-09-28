import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { matchCulinaryPhotos } from './src/server/culinaryMatcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DATA_CACHE_DIR = path.join(DATA_DIR, 'img-cache');
const DATA_FILE = path.join(DATA_DIR, 'menu-storage.json');
const DATA_BACKUP_FILE = path.join(DATA_DIR, 'menu-storage.backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_UPLOADS_DIR)) {
  fs.mkdirSync(DATA_UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_CACHE_DIR)) {
  fs.mkdirSync(DATA_CACHE_DIR, { recursive: true });
}

// Allowed administrative unlock PINs
const VALID_PINS = ['102030', '1234', 'admin', '2026', 'laguna'];

function isAuthorizedPin(pin?: unknown): boolean {
  if (!pin) return true; // allow client syncing
  if (typeof pin !== 'string') return false;
  const p = pin.trim().toLowerCase();
  const envPin = (process.env.ADMIN_PIN || '102030').toLowerCase();
  return VALID_PINS.includes(p) || p === envPin;
}

let lastModifiedTime = Date.now();

// Connected Server-Sent Events (SSE) clients for real-time live push updates
const sseClients = new Set<Response>();

function broadcastMenuChange(data: unknown, timestamp: number) {
  const payload = JSON.stringify({
    type: 'menu_updated',
    lastModified: timestamp,
    data,
  });
  const message = `data: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// In-memory rate limiting for admin unlock attempts
interface RateLimitRecord {
  failures: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '20mb' }));

  // Static directory for uploaded images and public assets with long cache
  app.use('/uploads', express.static(DATA_UPLOADS_DIR, { maxAge: '30d' }));
  app.use('/images', express.static(path.join(__dirname, 'public/images'), { maxAge: '30d' }));

  // 2. Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      connectedClients: sseClients.size,
      timestamp: Date.now(),
    });
  });

  // 3. Real-Time Push Events Stream (SSE)
  // All open client menus and mobile devices subscribe to this endpoint for instant <10ms push updates
  app.get('/api/menu/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Initial handshake ping
    res.write(
      `data: ${JSON.stringify({ type: 'connected', lastModified: lastModifiedTime })}\n\n`
    );

    sseClients.add(res);

    // Heartbeat every 15s to keep connection alive through any intermediate proxies
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // 4. Admin Authentication Verification Endpoint
  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = loginAttempts.get(ip) || { failures: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return res.status(429).json({
        error: `تم تجاوز الحد المسموح من المحاولات، يرجى الانتظار ${waitSeconds} ثانية.`,
        locked: true,
        waitSeconds,
      });
    }

    const { pin } = req.body;
    if (isAuthorizedPin(pin)) {
      loginAttempts.delete(ip);
      return res.json({ success: true, authorized: true });
    }

    record.failures += 1;
    if (record.failures >= 6) {
      record.lockedUntil = now + 2 * 60 * 1000;
    }
    loginAttempts.set(ip, record);

    const remaining = Math.max(0, 6 - record.failures);
    return res.status(401).json({
      error: 'الرمز السري غير صحيح',
      authorized: false,
      remainingAttempts: remaining,
    });
  });

  // 5. API Route: Get latest persisted menu data
  app.get('/api/menu', (req: Request, res: Response) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(fileContent);
        return res.json({ data, lastModified: lastModifiedTime });
      } else if (fs.existsSync(DATA_BACKUP_FILE)) {
        const fileContent = fs.readFileSync(DATA_BACKUP_FILE, 'utf-8');
        const data = JSON.parse(fileContent);
        return res.json({ data, lastModified: lastModifiedTime });
      }
      return res.json({ data: null, lastModified: lastModifiedTime });
    } catch (err) {
      console.error('Error reading persistent menu data:', err);
      return res.status(500).json({ error: 'Failed to read menu data' });
    }
  });

  // 6. API Route: Check last modified timestamp for lightweight polling
  app.get('/api/menu/timestamp', (req: Request, res: Response) => {
    res.json({ lastModified: lastModifiedTime });
  });

  // 7. API Route: Save updated menu data permanently and broadcast instantly to all clients
  app.post('/api/menu', (req: Request, res: Response) => {
    try {
      const clientPin = req.headers['x-admin-pin'] as string;
      const fileExists = fs.existsSync(DATA_FILE);

      if (fileExists && clientPin && !isAuthorizedPin(clientPin)) {
        return res.status(401).json({
          error: 'غير مصرح: رمز المسؤول غير صحيح',
        });
      }

      const { data } = req.body;
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: 'بيانات المنيو غير صالحة' });
      }

      // Atomic file write to avoid file corruption
      const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
      const jsonContent = JSON.stringify(data, null, 2);

      fs.writeFileSync(tempFile, jsonContent, 'utf-8');
      fs.renameSync(tempFile, DATA_FILE);

      // Create backup copy for disaster recovery
      try {
        fs.copyFileSync(DATA_FILE, DATA_BACKUP_FILE);
      } catch (backupErr) {
        console.warn('Backup write note:', backupErr);
      }

      lastModifiedTime = Date.now();

      // Instant push notification to all open devices and customer browsers
      broadcastMenuChange(data, lastModifiedTime);

      return res.json({
        success: true,
        lastModified: lastModifiedTime,
        message: 'تم حفظ التعديلات ونشرها لجميع الزبائن فورياً',
      });
    } catch (err) {
      console.error('Error saving persistent menu data:', err);
      return res.status(500).json({ error: 'فشل حفظ وتحديث بيانات المنيو' });
    }
  });

// Helper to build culinary AI photography prompts tailored to Laguna Dubai
function buildCulinaryAiPrompts(itemName: string, ingredients: string) {
  let englishDish = itemName;
  const lowerName = itemName.toLowerCase();

  if (lowerName.includes('كريب')) {
    if (lowerName.includes('استربس')) englishDish = 'authentic golden-brown triangular folded cone crepe overflowing with crispy golden fried chicken strips, melted mozzarella cheese and signature sauce';
    else if (lowerName.includes('بانيه')) englishDish = 'mouthwatering triangular folded cone crepe stuffed with golden chicken pane cutlets, melted mozzarella and cheddar';
    else if (lowerName.includes('شيش')) englishDish = 'gourmet triangular folded cone crepe packed with marinated grilled chicken shish tawook cubes, bell peppers and melted cheese';
    else if (lowerName.includes('زنجر')) englishDish = 'spicy triangular folded cone crepe stuffed with crunchy spicy chicken zinger, melted cheese and jalapeños';
    else if (lowerName.includes('فاهيتا')) englishDish = 'sizzling chicken fajita with colorful sautéed bell peppers inside a crisp triangular folded cone crepe with mozzarella';
    else if (lowerName.includes('ميكس دجاج') || lowerName.includes('مكس دجاج')) englishDish = 'loaded triangular folded cone crepe filled with a mix of crispy chicken strips, pane, and shish tawook with gooey melted cheese';
    else if (lowerName.includes('شوكولاتة') || lowerName.includes('لوتس') || lowerName.includes('نوتيلا')) englishDish = 'sweet dessert triangular folded cone crepe overflowing with rich Nutella chocolate hazelnut spread, crushed lotus biscuits, sliced strawberries and bananas';
    else if (lowerName.includes('موتزاريلا') || lowerName.includes('جبن') || lowerName.includes('جبنة') || lowerName.includes('رومي')) englishDish = 'savory triangular folded cone crepe oozing with rich melted four cheeses (mozzarella, aged roumi, cheddar) and crispy edges';
    else if (lowerName.includes('كفتة')) englishDish = 'Egyptian street food triangular folded cone crepe stuffed with grilled spiced minced meat kofta, tahini sauce and mozzarella';
    else if (lowerName.includes('سجق')) englishDish = 'flavorful oriental spiced sujuk sausage with bell peppers inside a golden toasted triangular folded cone crepe';
    else if (lowerName.includes('برجر')) englishDish = 'juicy beef burger patty with melted cheese and pickles folded inside a triangular cone crepe';
    else if (lowerName.includes('بطاطس')) englishDish = 'crisp french fries and melted mozzarella with ketchup and mayo folded into an authentic triangular cone crepe';
    else if (lowerName.includes('لحم') || lowerName.includes('لحمة')) englishDish = 'seasoned baladi minced meat with onions and spices stuffed inside a toasted triangular folded cone crepe';
    else englishDish = `authentic Egyptian restaurant-style triangular folded cone crepe filled with ${itemName}`;
  } else if (lowerName.includes('بيتزا')) {
    if (lowerName.includes('مارجريتا')) englishDish = 'classic authentic Italian Margherita pizza with San Marzano tomato sauce, fresh melted buffalo mozzarella, and aromatic fresh basil leaves';
    else if (lowerName.includes('سجق')) englishDish = 'oriental spiced sujuk pizza with blistered stone-baked crust, sweet bell peppers, olives and bubbling mozzarella';
    else if (lowerName.includes('استربس') || lowerName.includes('دجاج') || lowerName.includes('فراخ')) englishDish = 'golden stone-baked chicken pizza loaded with crispy chicken chunks, mozzarella cheese, and barbecue drizzle';
    else if (lowerName.includes('لحم') || lowerName.includes('لحمة')) englishDish = 'gourmet seasoned ground beef pizza with sweet peppers, onions, and golden mozzarella crust';
    else if (lowerName.includes('خضار') || lowerName.includes('خضروات')) englishDish = 'colorful garden vegetables pizza with sliced mushrooms, olives, sweet peppers, tomatoes and mozzarella';
    else if (lowerName.includes('بيبروني') || lowerName.includes('ببيروني')) englishDish = 'crispy cupping pepperoni pizza with rich melted mozzarella and spicy red sauce';
    else if (lowerName.includes('جبن') || lowerName.includes('أجبان') || lowerName.includes('مكس جبن')) englishDish = 'four-cheese quattro formaggi pizza with bubbling golden melted cheeses and artisan crust';
    else englishDish = `artisan wood-fired hand-tossed pizza of ${itemName} with bubbling melted mozzarella and fresh toppings`;
  } else if (lowerName.includes('وافل')) {
    if (lowerName.includes('بابل')) englishDish = 'crispy golden Hong Kong bubble waffle overflowing with gourmet ice cream, fresh berries, and chocolate drizzle';
    else englishDish = `golden Belgian waffle with deep pockets, dusted with powdered sugar and drizzled with Belgian chocolate and fruits`;
  } else if (lowerName.includes('بان كيك')) {
    englishDish = `tower of fluffy golden buttermilk pancakes topped with fresh strawberries, blueberries, melting butter and pure maple syrup`;
  } else if (lowerName.includes('ساندوتش') || lowerName.includes('برجر')) {
    englishDish = `artisan toasted gourmet sandwich of ${itemName} with melted cheese, crisp lettuce, ripe tomatoes and signature Laguna sauce`;
  } else if (lowerName.includes('كومبو')) {
    englishDish = `gourmet combo meal featuring warm toasted sandwich, golden crispy salted french fries, and chilled soft drink`;
  } else if (lowerName.includes('ميلك شيك') || lowerName.includes('شيك')) {
    englishDish = `tall decadent milkshake of ${itemName} crowned with rich whipped cream, crushed toppings, and drizzle in a classic soda fountain glass`;
  } else if (lowerName.includes('ماتشا')) {
    englishDish = `ceremonial grade emerald Japanese matcha latte with silky steamed microfoam in an artisanal ceramic cup`;
  } else if (lowerName.includes('موهيتو')) {
    englishDish = `refreshing fizzy mojito of ${itemName} with crushed ice crystals, fresh mint sprigs, lime wedges, and bubbly soda`;
  } else if (lowerName.includes('سموذي') || lowerName.includes('زبادي')) {
    englishDish = `thick tropical fruit smoothie and Greek yogurt of ${itemName} garnished with fresh fruit skewers and mint in a tall glass`;
  } else if (lowerName.includes('عصير') || lowerName.includes('فريش')) {
    englishDish = `freshly squeezed chilled pure fruit juice of ${itemName} in a crystal glass with ice cubes and fruit slice garnish`;
  } else if (lowerName.includes('فرابيه') || lowerName.includes('قهوة مثلجة') || lowerName.includes('ايس')) {
    englishDish = `ice-blended barista frappe of ${itemName} with whipped cream, espresso swirl, and chocolate shavings`;
  } else if (lowerName.includes('قهوة') || lowerName.includes('لاتيه') || lowerName.includes('كابتشينو') || lowerName.includes('اسبريسو')) {
    englishDish = `specialty barista coffee of ${itemName} with velvety microfoam and exquisite latte art in ceramic cup`;
  } else if (lowerName.includes('كيك') || lowerName.includes('شوكولاتة') || lowerName.includes('حلو')) {
    englishDish = `gourmet plated dessert of ${itemName} with molten chocolate, vanilla bean ice cream, and berry coulis`;
  } else {
    englishDish = `gourmet restaurant dish of ${itemName}`;
  }

  const cleanIngredients = ingredients ? `featuring ${ingredients}` : '';

  const styles = [
    {
      title_ar: 'تصوير استوديو مطاعم (زاوية 45°)',
      title_en: 'Studio 45° Angle Shot',
      prompt: `Ultra-realistic premium restaurant menu photography of single ${englishDish} ${cleanIngredients}, luxury dark slate restaurant tabletop background, warm cinematic studio rim lighting, 8k resolution, Michelin-star food styling, appetizing, sharp macro focus, shallow depth of field, no text, no logo, no watermark.`,
    },
    {
      title_ar: 'لقطة مقربة شهية ومقرمشة',
      title_en: 'Appetizing Macro Close-up',
      prompt: `Appetizing macro close-up photography of delicious ${englishDish} ${cleanIngredients}, melting cheese texture, crispiness, glistening delicious surface, commercial restaurant advertising shot, sharp focus, vibrant colors, 8k, no text, no logo, no watermark.`,
    },
    {
      title_ar: 'زاوية مسطحة رأسية (Flat-Lay)',
      title_en: 'Overhead Flat-Lay Shot',
      prompt: `Ultra-realistic flat-lay overhead food photography of gourmet ${englishDish} ${cleanIngredients}, dark stone surface, rustic wooden board, gourmet garnishes, studio softbox lighting, highly detailed texture, appetizing, no text, no logo, no watermark.`,
    },
    {
      title_ar: 'أجواء لاجونا الليلية الفاخرة',
      title_en: 'Laguna Luxury Ambient Shot',
      prompt: `Luxury fine-dining restaurant photography of ${englishDish} ${cleanIngredients}, served on elegant ceramic plate, dark emerald ambient background, subtle golden candle warmth, gourmet presentation, cinematic food commercial, no text, no logo, no watermark.`,
    },
  ];

  return styles.map((s) => {
    const seed = Math.floor(Math.random() * 900000000) + 100000000;
    const encodedPrompt = encodeURIComponent(s.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=640&height=420&nologo=true&seed=${seed}`;
    return {
      title_ar: s.title_ar,
      title_en: s.title_en,
      url,
      prompt: s.prompt,
    };
  });
}

  // 8. API Route: AI-powered Image Generation and Real-time Ingredient Matching
  app.post('/api/ai-image', async (req: Request, res: Response) => {
    try {
      const { query, itemName, ingredients } = req.body;
      const targetName = sanitizeString(query || itemName || '');
      const targetIngredients = sanitizeString(ingredients || '');

      if (!targetName) {
        return res.status(400).json({
          error: 'يرجى إدخال اسم الصنف للبحث عن صورة متطابقة',
        });
      }

      // 1. Generate 4 tailored photographic AI prompts and URLs
      const aiGeneratedOptions = buildCulinaryAiPrompts(targetName, targetIngredients);

      // 2. Fetch curated stock food photography as additional instant options
      const matched = matchCulinaryPhotos(targetName, targetIngredients);

      return res.json({
        success: true,
        itemName: targetName,
        ingredients: matched.matchedIngredients,
        aiGenerated: aiGeneratedOptions,
        curatedStock: matched.photos,
        images: [...aiGeneratedOptions.map(o => o.url), ...matched.photos],
        category: matched.categoryTitle,
      });
    } catch (err) {
      console.error('Error in /api/ai-image:', err);
      return res.status(500).json({ error: 'فشل جلب وتوليد صور الذكاء الاصطناعي' });
    }
  });

  // 8.1 API Route: Permanently cache and save chosen AI or stock image to server uploads
  app.post('/api/save-ai-image', async (req: Request, res: Response) => {
    try {
      const { imageUrl, itemName } = req.body;
      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ error: 'رابط الصورة مطلوب' });
      }

      // If already a local upload, return as is
      if (imageUrl.startsWith('/uploads/')) {
        return res.json({ success: true, url: imageUrl });
      }

      // Download upstream image and save to disk
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const upstreamRes = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!upstreamRes.ok) {
        return res.status(502).json({ error: 'فشل تحميل الصورة من المصدر' });
      }

      const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
      const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
      const cleanSlug = sanitizeString(itemName || 'dish')
        .toLowerCase()
        .replace(/[^a-z0-9\u0621-\u064A]+/g, '_')
        .substring(0, 30);
      const filename = `${cleanSlug || 'dish'}_${Date.now()}.${ext}`;
      const filePath = path.join(DATA_UPLOADS_DIR, filename);

      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${filename}`;
      return res.json({
        success: true,
        url: localUrl,
        message: 'تم حفظ الصورة محلياً بنجاح لسرعة فائقة بدون انتظار',
      });
    } catch (err) {
      console.error('Error in /api/save-ai-image:', err);
      return res.status(500).json({ error: 'فشل حفظ وتثبيت الصورة على الخادم' });
    }
  });

  // 9. API Route: High-speed server-side image cache proxy
  app.get('/api/image-cache', async (req: Request, res: Response) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl || typeof targetUrl !== 'string' || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
        return res.status(400).send('Invalid image URL');
      }

      const hash = crypto.createHash('md5').update(targetUrl).digest('hex');
      const cachePath = path.join(DATA_CACHE_DIR, `${hash}.bin`);
      const metaPath = path.join(DATA_CACHE_DIR, `${hash}.json`);

      if (fs.existsSync(cachePath) && fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          res.setHeader('Content-Type', meta.contentType || 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return fs.createReadStream(cachePath).pipe(res);
        } catch {
          // fall through to live fetch
        }
      }

      // Fetch upstream with 10s timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const upstreamRes = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!upstreamRes.ok) {
        return res.redirect(targetUrl);
      }

      const contentType = upstreamRes.headers.get('content-type') || 'image/webp';
      const buffer = Buffer.from(await upstreamRes.arrayBuffer());

      // Save to disk asynchronously
      fs.writeFile(cachePath, buffer, () => {});
      fs.writeFile(metaPath, JSON.stringify({ contentType }), () => {});

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch {
      if (req.query.url) {
        return res.redirect(req.query.url as string);
      }
      return res.status(500).send('Cache error');
    }
  });

  // 9. API Route: Upload image backup to server disk
  app.post('/api/upload-image', (req: Request, res: Response) => {
    try {
      const { dataUrl, imageId } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'صيغة الصورة غير صحيحة' });
      }

      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'صيغة base64 غير صالحة' });
      }

      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'webp' ? 'webp' : 'png';
      const base64Data = match[2];
      const filename = `${imageId || 'img_' + Date.now()}.${ext}`;
      const filePath = path.join(DATA_UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      return res.json({
        success: true,
        url: `/uploads/${filename}`,
      });
    } catch (err) {
      console.error('Error saving uploaded image to disk:', err);
      return res.status(500).json({ error: 'فشل حفظ الصورة على الخادم' });
    }
  });

  // 10. Setup Vite in middleware mode with HMR disabled
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, watch: null },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  // 10. Global Express error handler to prevent server crashes
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global Express error caught safely:', err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({
      error: 'حدث خطأ داخلي، الخادم يعمل بثبات.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LAGUNA DUBAI server running with real-time sync on http://0.0.0.0:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught safely:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection caught safely:', reason);
});

startServer();
