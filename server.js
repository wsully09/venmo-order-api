const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to parse JSON bodies
app.use(express.json());

// Disable HTTPS redirect
app.use((req, res, next) => {
    res.set('X-Forwarded-Proto', 'http');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Endpoint to get keypad code by order ID
app.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Query the requests table for the order
        const { data, error } = await supabase
            .from('requests')
            .select('keypad_code')
            .eq('order_id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({ error: 'Failed to fetch order' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ keypad_code: data.keypad_code });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
}); 