const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Webhook endpoint for WooCommerce
app.post('/woocommerce-webhook', async (req, res) => {
    try {
        // Extract data from WooCommerce webhook payload
        const { order_id, billing, line_items } = req.body;
        const customerEmail = billing.email;
        const customerName = billing.first_name + ' ' + billing.last_name;
        const productName = line_items[0].name; // Assuming only one product per order

        // Construct payload for Zoho CRM API
        const payload = {
            data: [{
                Last_Name: customerName,
                Email: customerEmail,
                Product: productName, // Assuming Zoho CRM field for product
                // Add other fields as needed
            }],
            trigger: ['workflow'] // Assuming Zoho CRM workflow will handle adding to campaign
        };

        // Make API request to Zoho CRM
        const response = await axios.post('https://www.zohoapis.com/crm/v2/Contacts', payload, {
            headers: {
                Authorization: 'Zoho-oauthtoken YOUR_AUTH_TOKEN',
                'Content-Type': 'application/json'
            }
        });

        console.log('Zoho CRM contact created:', response.data);
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Error processing webhook:', error.message);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Webhook server listening at http://localhost:${port}`);
});
