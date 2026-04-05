document.addEventListener('DOMContentLoaded', () => {
    getProductInformation();
});


/******************************************************/
//          GET PRODUCTS INFORMATION
/******************************************************/

async function getProductInformation() {
    try {
        //const response = await fetch('http://localhost:3000/api/products'); -- This was needed only when I was in local mode 
        const response = await fetch('/api/easypassword/products'); // This calls the endpoint we created in server.js to fetch products from Stripe, which then sends the data back to the frontend to be used here
        const products = await response.json();

        if (!response.ok) {
            console.error("Server Error:", products.error);
            return;
        }

        products.forEach(product => {
            if (product !== null && product !== undefined) {


                //Matching the div with the product
                const planId = product.name.toLowerCase();
                const container = document.getElementById(planId);
                const buyButtonId = product.metadata.buy_button_id;
                //console.log(product.name)

                if (container) {
                    // 2. Handle the Price (Stripe sends unit_amount in cents)
                    const price = (product.default_price.unit_amount / 100).toFixed(2);
                    const currency = product.default_price.currency.toUpperCase();
                    const interval = product.default_price.recurring.interval;

                    // 3. Handle Features (Looping through marketing_features)
                    let featuresHTML = '';
                    if (product.marketing_features && product.marketing_features.length > 0) {
                        //console.log(product.marketing_features)
                        product.marketing_features.forEach(feature => {
                            featuresHTML += `
                            <li class="flex items-start">
                                <span class="mr-2 ${planId === 'premium' ? 'text-white' : 'text-red-600'}">✓</span>
                                <span>${feature.name}</span>
                            </li>`;
                        });
                    }

                    // 4. Create the Content (Keeping your specific button styles)
                    const isPremium = planId === 'premium';
                    const textColor = isPremium ? 'text-white' : 'text-black';
                    const subTextColor = isPremium ? 'text-red-100' : 'text-gray-600';

                    const content = `
                    <h2 class="text-xl md:text-2xl font-bold ${textColor} mb-2">${product.name}</h2>
    
    <p class="${subTextColor} text-sm md:text-base mb-6">${product.description}</p>
    
    <div class="mb-6">
         <span class="${subTextColor} text-xs uppercase">${currency}</span>
         <span class="text-3xl md:text-4xl font-bold ${textColor}">$${price}</span>
        <span class="${subTextColor} text-sm">/${interval}</span>
    </div>

    <ul class="space-y-3 mb-8 ${textColor} text-sm md:text-base">
        ${featuresHTML}
    </ul>

    <div class="mt-auto pt-4">
        <stripe-buy-button 
            buy-button-id="${buyButtonId}"
            publishable-key="pk_test_51T98ZILrO7VaOxlC62zntR5yYhHBTy5IXRwmMxZoORx9nqrMhGWFEgC2QBxva7mwO5pJF13kDeOn5NJp4MKZ3LU200kpmtT9EC">
        </stripe-buy-button>
     </div>
                `;
                    container.innerHTML = content;
                }
            }
            else {
                console.log("Object with nulls or undefined");
                console.log(product)
            }
        });

    } catch (error) {
        console.error("Connection Error:", error);
    }
}

/******************************************************/
//          GET PAYMENTS
/******************************************************/


//document.getElementById('refresh_btn').addEventListener('click', loadPayments);
const refreshBtn = document.getElementById('refresh_btn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', loadPayments);
}

async function loadPayments() {
    const tableBody = document.getElementById('payment_table_body');
    tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center">Loading...</td></tr>';

    try {
        const response = await fetch('/api/easypassword/payments');
        const payments = await response.json();

        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center">No payments found yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = ''; // Clear the loading message

        payments.forEach(pay => {
            const date = new Date(pay.created_at).toLocaleDateString();
            
            const row = `
                <tr class="border-t border-zinc-800 hover:bg-zinc-800/30 transition">
                    <td class="p-4 font-medium text-white">${pay.email}</td>
                    <td class="p-4"><span class="bg-red-600/10 text-red-500 px-2 py-1 rounded text-xs">${pay.plan_name}</span></td>
                    <td class="p-4">$${pay.amount}</td>
                    <td class="p-4 text-right text-zinc-500">${date}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading table:", error);
        tableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-red-500">Error loading data.</td></tr>';
    }
}
