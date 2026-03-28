// 1. I need to import dependencies
const express = require('express');
const cors = require('cors');
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