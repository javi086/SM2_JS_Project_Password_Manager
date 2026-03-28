/******************************************************/
// 1. IMPORTS & INITIALIZATION (Must be at the top)
/******************************************************/
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express(); // We create "app" first so we can use it below!

// Initialize Stripe
const stripe = require('stripe')('sk_test_51T98ZILrO7VaOxlChjqWluZvKvb47attVvplYBHL4G5F8XTATAfhpTVAouyHJEC6JYE1aZ5PCCs5PvDw6Ay699bl00hIQrvrzA');

// Use environment variable for the secret (don't put the string in quotes!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/******************************************************/
// 2. MIDDLEWARE & DB CONNECTION
/******************************************************/
app.use(cors());

// Initialize the Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verify connection
pool.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  console.log('Successfully connected to PostgreSQL on Render');
  release();
});

/******************************************************/
// 3. WEBHOOK ROUTE (Must come BEFORE express.json() if you use it)
/******************************************************/
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("💰 Payment received! Saving to DB...");
    
    // Make sure you have the savePayment function defined in this file!
    await savePayment(
        session.customer_details.email,
        session.amount_total / 100,
        session.id,
        session.metadata.plan_name || "EasyPass Plan"
    );
  }
  response.json({received: true});
});

/******************************************************/
// 4. GENERAL ROUTES & STATIC FILES
/******************************************************/
app.use(express.static(path.join(__dirname, '../'))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await stripe.products.list({
            limit: 3,
            active: true,
            expand: ['data.default_price']
        });
        res.json(products.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/******************************************************/
// 5. DATABASE FUNCTIONS
/******************************************************/
async function savePayment(email, amount, transactionId, planName) {
    const query = `
      INSERT INTO payments (email, amount, transaction_id, plan_name, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [email, amount, transactionId, planName];
    try {
      const res = await pool.query(query, values);
      console.log('Payment saved to DB:', res.rows[0]);
    } catch (err) {
      console.error('Error saving payment:', err);
    }
}

/******************************************************/
// 6. START SERVER
/******************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));