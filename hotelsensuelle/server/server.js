import express from 'express';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.error('Missing STRIPE_SECRET_KEY environment variable.');
  process.exit(1);
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16'
});

const app = express();
app.use(express.json({ limit: '1mb' }));

// Serve the static site
app.use(express.static(projectRoot));

const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
const successUrl =
  process.env.CHECKOUT_SUCCESS_URL ||
  (publicBaseUrl ? `${publicBaseUrl}/valentine/` : 'https://example.com/valentine/');
const cancelUrl =
  process.env.CHECKOUT_CANCEL_URL ||
  (publicBaseUrl ? `${publicBaseUrl}/valentine/cart.html` : 'https://example.com/valentine/cart.html');

app.post('/create-checkout-session', async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const lineItems = items.map((item) => {
      const name = String(item.name || 'Item');
      const unitAmount = Math.round(Number(item.price) * 100);
      const quantity = Math.max(1, Number(item.quantity || 1));

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Invalid price for item: ${name}`);
      }

      const productData = { name };
      if (item.image && publicBaseUrl) {
        productData.images = [`${publicBaseUrl}${item.image.startsWith('/') ? '' : '/'}${item.image}`];
      }

      return {
        quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: unitAmount,
          product_data: productData
        }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to create checkout session.' });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => {
  console.log(`Checkout server running on http://localhost:${port}`);
});
