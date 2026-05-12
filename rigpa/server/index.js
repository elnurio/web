require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const UPLOADS_DIR = path.join(__dirname, '../uploads');

app.use(cors());
app.use(express.json());

// ── Multer: PDF upload ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\-а-яёА-ЯЁ ]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB per file
});

// ── Anthropic client (lazy — only if key present) ───────────────────────────
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── List uploaded books ─────────────────────────────────────────────────────
app.get('/api/books', (req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR)
    .filter(f => f.endsWith('.pdf'))
    .map(f => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, f));
      return { filename: f, size: stat.size, uploaded: stat.mtime };
    });
  res.json({ books: files });
});

// ── Upload PDF ──────────────────────────────────────────────────────────────
app.post('/api/upload', upload.array('pdfs', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No PDF files received' });
  res.json({
    uploaded: req.files.map(f => ({ filename: f.filename, size: f.size }))
  });
});

// ── Delete book ─────────────────────────────────────────────────────────────
app.delete('/api/books/:filename', (req, res) => {
  const filepath = path.join(UPLOADS_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(filepath);
  res.json({ ok: true });
});

// ── Ask ─────────────────────────────────────────────────────────────────────
app.post('/api/ask', async (req, res) => {
  const { question, existingNodes = [] } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });

  const client = getClient();
  if (!client) {
    return res.status(503).json({ error: 'NO_API_KEY', message: 'ANTHROPIC_API_KEY not set in .env' });
  }

  // Load all PDFs
  const pdfFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.pdf'));
  if (!pdfFiles.length) {
    return res.status(400).json({ error: 'NO_BOOKS', message: 'No PDF books uploaded yet' });
  }

  // Build document content blocks
  const docBlocks = pdfFiles.map(filename => {
    const data = fs.readFileSync(path.join(UPLOADS_DIR, filename));
    return {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: data.toString('base64'),
      },
      cache_control: { type: 'ephemeral' }, // prompt caching — books cached across requests
      title: filename,
    };
  });

  const systemPrompt = `Ты — мудрый проводник по учениям Дзогчен. Пользователь загрузил книги как твою базу знаний. Отвечай только на основе этих книг.

Список уже существующих узлов в паутине знаний:
${existingNodes.map(n => `- id: "${n.id}", label: "${n.label}"`).join('\n')}

Ответь строго в формате JSON (без markdown-обёртки, только чистый JSON):
{
  "title": "Название темы (3-5 слов)",
  "content": "Объяснение из книг (3-5 предложений, цитируй источник если нужно)",
  "thinking": ["короткая мысль 1...", "мысль 2...", "мысль 3...", "мысль 4..."],
  "targetNode": "id существующего узла ИЛИ null если нет подходящего",
  "trail": ["nodeId1", "nodeId2", "конечный_nodeId"],
  "newNodes": [
    {"id": "уникальный_id", "label": "Название", "category": "core|practice|philosophy|ground|lineage|condition", "color": "#hex"}
  ],
  "newLinks": [
    {"source": "существующий_id", "target": "новый_id"}
  ],
  "relatedNodes": ["id1", "id2", "id3"]
}

Правила:
- thinking: 3-4 коротких слова-ощущения как ИИ ищет ответ
- trail: путь из 2-4 существующих узлов к targetNode (цепочка для анимации)
- newNodes: только если вопрос затрагивает концепцию, которой нет в паутине
- Если добавляешь новый узел — он становится targetNode
- color для новых узлов: тёплые цвета для core, холодные для practice, нейтральные для philosophy`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            ...docBlocks,
            { type: 'text', text: question }
          ]
        }
      ]
    });

    const rawText = response.content[0]?.text || '{}';

    // Strip possible markdown code fences
    const jsonText = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return res.status(500).json({ error: 'PARSE_ERROR', raw: rawText });
    }

    res.json({
      ...parsed,
      usage: response.usage, // includes cache_read_input_tokens for monitoring
    });

  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const books  = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.pdf')).length;
  res.json({ ok: true, hasKey, books });
});

const PORT = process.env.PORT || 3131;
app.listen(PORT, () => console.log(`Rigpa server → http://localhost:${PORT}`));
