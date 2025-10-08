import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { TickeraClient } from './tickeraClient.js';
import { mapTicketRow } from './mapTickeraToDTO.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

const client = new TickeraClient({
  wpUrl: process.env.WP_URL,
  apiKey: process.env.TICKERA_API_KEY,
  pageSize: Number(process.env.TICKERA_PAGE_SIZE || 100),
});

client.checkCredentials()
  .then(pass => logger.info({ pass }, 'Tickera credentials ok'))
  .catch(err => logger.warn({ err: String(err) }, 'Tickera credential check failed'));

const OrderIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);

app.get('/api/health', async (req, res) => {
  try {
    const pass = await client.checkCredentials();
    res.json({ ok: pass });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/tickets/:orderId', async (req, res) => {
  const parsed = OrderIdSchema.safeParse(req.params.orderId);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid orderId format' });
  }
  const orderId = parsed.data;

  try {
    const matches = [];
    for await (const row of client.iterateTickets()) {
      const tId = String(row.transaction_id || '');
      if (tId === orderId || tId.startsWith(`${orderId}-`)) {
        matches.push(mapTicketRow(row));
      }
    }

    if (matches.length === 0) {
      return res.status(404).json({ error: 'Order not found or no tickets' });
    }

    res.json({ orderId, tickets: matches, count: matches.length });
  } catch (err) {
    req.log.error({ err: String(err) }, 'Tickera API error');
    res.status(502).json({ error: 'Upstream Tickera API failure' });
  }
});

const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`);
});
