document.addEventListener('DOMContentLoaded', () => {
    fetchRSSNews();
});

async function fetchRSSNews() {

    let container = document.getElementById('rss-container');
    if (container) {
        try {
            const response = await fetch('/api/easypassword/news');// 1. Using Fetch to send the request to my server endpoint that is in server.js
            const newsItems = await response.json(); // Getting the response and converting it to JSON

            
            let   newsHTML = `
            <div class="flex items-center">
                <span class="inline-block px-6 mx-5 bg-red-600/10 border border-red-600/30 rounded-full text-red-600 text-xl font-bold uppercase tracking-widest">RSS</span>
                <h3 class="inline-block  text-red-600 font-bold uppercase text-xs">Latest Tech News</h3>
            </div>
            `;

            newsItems.forEach(item => {
                newsHTML += `
               <div class="border-b border-zinc-800 py-4">
                    <h4 class="text-white font-bold text-sm">
                        <a href="${item.link}" target="_blank" class="hover:text-red-500 transition-colors">
                            ${item.title}
                        </a>
                    </h4>
                    <p class="text-zinc-500 text-[10px] mt-1">${new Date(item.date).toLocaleDateString()}</p>
                </div>
            `;
            });

            container.innerHTML = newsHTML;

        }
        catch (error) {
            console.error("Fetch error:", error);
            container.innerHTML = "<p class='text-zinc-500 text-xs'>Unable to load news.</p>";
        }
    }
}