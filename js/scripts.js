document.addEventListener('DOMContentLoaded', function () {
    getProductInformation();
});


async function getProductInformation() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
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
                    <h2 class="text-2xl font-bold ${textColor} mb-2">${product.name}</h2>
                    <p class="${subTextColor} mb-6">${product.description}</p>
                    <div class="mb-6">
                         <span class="${subTextColor}">${currency}</span>
                        <span class="text-4xl font-bold ${textColor}">$${price}</span>
                        <span class="${subTextColor}">/${interval}</span>
                    </div>
                    <ul class="space-y-3 mb-8 ${textColor}">
                        ${featuresHTML}
                    </ul>
                    <div class="mt-auto">
                        <stripe-buy-button 
                            buy-button-id="${buyButtonId}"
                            publishable-key="pk_test_51T98ZILrO7VaOxlC62zntR5yYhHBTy5IXRwmMxZoORx9nqrMhGWFEgC2QBxva7mwO5pJF13kDeOn5NJp4MKZ3LU200kpmtT9EC">
                        </stripe-buy-button>
                     </div>
                `;
                    container.innerHTML = content;
                }
            }
            else{
                console.log("Object with nulls or undefined");
                console.log(product)
            }
        });

    } catch (error) {
        console.error("Connection Error:", error);
    }
}

