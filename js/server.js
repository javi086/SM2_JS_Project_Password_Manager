/******************************************************/
//              MY RENDER DB CONFIGURATION
/******************************************************/

const { Pool } = require('pg');
const endpointSecret = "process.env.STRIPE_WEBHOOK_SECRET";

// Stripe requires the raw body for signature verification
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the specific event: checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Trigger the savePayment function!
    console.log("💰 Payment received! Saving to DB...");
    await savePayment(
        session.customer_details.email,
        session.amount_total / 100,
        session.id, // Using session ID as the transaction reference
        session.metadata.plan_name || "EasyPass Plan"
    );
  }

  response.json({received: true});
});


// Initialize the Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render's secure connection
  }
});

// Verify connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL on Render');
  release();
});

/******************************************************/
//              MY STRIPE CONFIGURATION
/******************************************************/


// 1. I need to import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());

// 2. Initialize Stripe with a test secret key
const stripe = require('stripe')('sk_test_51T98ZILrO7VaOxlChjqWluZvKvb47attVvplYBHL4G5F8XTATAfhpTVAouyHJEC6JYE1aZ5PCCs5PvDw6Ay699bl00hIQrvrzA'); // This is a placeholder key

// This section is needed for Render to display the index.html, this tells Express to make your files available to the public
app.use(express.static(path.join(__dirname, '../'))); 

// This tells Express: "When someone visits the main URL (/), send them index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});
//


// 3. Create a route to get your products
app.get('/api/products', async (req, res) => {
    try {
        // 4. Use the Stripe API to "list" products
        // Documentation: https://docs.stripe.com/api/products/list
        const products = await stripe.products.list({
            limit: 3, // We only want the top 3 (Free, Premium, Family)
            active: true,
            expand: ['data.default_price']
        });

        // 5. Send the products back to your frontend as JSON
        res.json(products.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// IMPORTANT: Render uses a dynamic PORT. Update your listen line:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));