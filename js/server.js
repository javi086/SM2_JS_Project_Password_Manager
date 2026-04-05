/******************************************************/
// 1. IMPORTS & INITIALIZATION 
/******************************************************/
const express = require('express');
const cors = require('cors'); // I require it to avoid my error: "Access
const path = require('path');
const { Pool } = require('pg');
const app = express();
const Parser = require('rss-parser'); // This will be used to parse the RSS information into a JSON format that I can use in the frontend.
const parser = new Parser({
  headers: { 'User-Agent': 'EasyPass-Student-Project' },
});


// Initialize Stripe
const stripe = require('stripe')('sk_test_51T98ZILrO7VaOxlChjqWluZvKvb47attVvplYBHL4G5F8XTATAfhpTVAouyHJEC6JYE1aZ5PCCs5PvDw6Ay699bl00hIQrvrzA');

// Use environment variable for the secret (don't put the string in quotes!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/******************************************************/
// 2. MIDDLEWARE & DB CONNECTION
/******************************************************/
app.use(cors());

// Initialize the Database Pool
// This is the recommended way to connect to PostgreSQL on Render. It uses the DATABASE_URL environment variable and sets SSL with rejectUnauthorized: false.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verify connection to Render
pool.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  console.log('Successfully connected to PostgreSQL on Render');
  release();
});

/******************************************************/
// 3. WEBHOOK ROUTE (Must come BEFORE express.json()). The webhook allows me to handle events from Stripe
/******************************************************/
app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
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

    // SavePayment is triggered when a payment is successfully executed.
    await savePayment(
      session.customer_details.email,
      session.amount_total / 100,
      session.id,
      session.metadata.plan_name || "EasyPass Plan"
    );
  }
  response.json({ received: true });
});

/******************************************************/
// 4. ENDPOINTs & STATIC FILES
/******************************************************/

app.use(express.static(path.join(__dirname, '../')));  // This must be first because, it tells Express to look for the static files from the parent directory (where index.html is).
app.get('/', (req, res) => { // This gets the index.html file once the parent directory is set as the static folder (previous step)
  res.sendFile(path.join(__dirname, '../index.html'));
});
const apiRouter = express.Router(); // This router will help me to organize the API endpoints.

// ENDPOINT  - Fetch products from Stripe (for the frontend to display)
apiRouter.get('/products', async (req, res) => {
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


// ENDPOINT - Fetch payments from the database (for the admin dashboard to display)
apiRouter.get('/payments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows); // Send the array of payments back to the frontend
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ENDPOINT - RSS Feed 
apiRouter.get('/news', async (req, res) => {
  try {
    const newsFeed = await parser.parseURL('https://www.cbc.ca/webfeed/rss/rss-technology');

    // Safety check: Ensure we have items
    if (!newsFeed.items) {
      return res.json([]);
    }

    const topStories = newsFeed.items.slice(0, 5).map(item => ({ // I only want the top 5 items 
      title: item.title,
      link: item.link,
      date: item.pubDate
    }));
    res.json(topStories);
  } catch (error) {
    console.error('RSS Error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }

});


app.use('/api/easypassword', apiRouter); // Prefix all API routes with /api/easypassword

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
//  START SERVER (This must be at the END of the file, after all routes and functions once everything else has been defined)
/******************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));