// PumpFun Livestream App
class PumpFunApp {
    constructor() {
        this.streams = [];
        this.filteredStreams = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStreams();
        this.setupAutoRefresh();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filterStreams(e.target.value);
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => {
            this.loadStreams();
        });
    }

    async loadStreams() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const streamsGrid = document.getElementById('streamsGrid');
        
        loading.style.display = 'block';
        error.style.display = 'none';
        streamsGrid.innerHTML = '';

        try {
            // For demo purposes, we'll use mock data
            // In a real app, you would replace this with actual PumpFun API calls
            const mockStreams = await this.fetchMockData();
            this.streams = mockStreams;
            this.filteredStreams = [...this.streams];
            this.renderStreams();
        } catch (err) {
            console.error('Error loading streams:', err);
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    }

    async fetchMockData() {
        try {
            // Fetch real data from PumpFun API
            const response = await fetch('https://api.pulstream.so/streamstats?limit=20&offset=0&sort_by=num_participants&sort_order=DESC');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiData = await response.json();
            
            // Transform API data to our app format
            return apiData.data.data.map((stream, index) => ({
                id: stream.id,
                title: stream.name || `Stream ${index + 1}`,
                symbol: stream.symbol || 'N/A',
                description: stream.description || 'No description available',
                viewers: stream.num_participants || 0,
                likes: stream.reply_count || 0,
                status: stream.is_currently_live ? "live" : "offline",
                tags: this.generateTags(stream),
                thumbnail: stream.thumbnail || stream.image_uri || 'https://via.placeholder.com/300x200/667eea/ffffff?text=No+Image',
                marketCap: stream.usd_market_cap || 0,
                holders: stream.holders || 0,
                chatMembers: stream.chat_members || 0,
                twitter: stream.twitter,
                website: stream.website,
                created: stream.created_timestamp,
                lastTrade: stream.last_trade_timestamp,
                chart: stream.chart || []
            }));
        } catch (error) {
            console.error('Error fetching live data:', error);
            // Fallback to mock data if API fails
            return this.getFallbackData();
        }
    }

    generateTags(stream) {
        const tags = [];
        
        // Add status-based tags
        if (stream.is_currently_live) tags.push('Live');
        if (stream.num_participants > 100) tags.push('Popular');
        if (stream.usd_market_cap > 50000) tags.push('High Cap');
        if (stream.reply_count > 50) tags.push('Active');
        
        // Add symbol as tag
        if (stream.symbol) tags.push(stream.symbol);
        
        // Add time-based tags
        const now = Date.now();
        const created = parseInt(stream.created_timestamp);
        const hoursSinceCreated = (now - created) / (1000 * 60 * 60);
        
        if (hoursSinceCreated < 1) tags.push('New');
        if (hoursSinceCreated < 24) tags.push('Fresh');
        
        return tags.slice(0, 4); // Limit to 4 tags
    }

    getFallbackData() {
        // Fallback data if API fails
        return [
            {
                id: 'fallback-1',
                title: "API Unavailable",
                symbol: "API",
                description: "Unable to fetch live data. Please try again later.",
                viewers: 0,
                likes: 0,
                status: "offline",
                tags: ["API", "Error"],
                thumbnail: "https://via.placeholder.com/300x200/dc3545/ffffff?text=API+Error",
                marketCap: 0,
                holders: 0,
                chatMembers: 0
            }
        ];
    }

    filterStreams(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredStreams = this.streams.filter(stream => {
            const matchesSearch = stream.title.toLowerCase().includes(term) ||
                                stream.symbol.toLowerCase().includes(term) ||
                                stream.description.toLowerCase().includes(term) ||
                                stream.tags.some(tag => tag.toLowerCase().includes(term));
            
            const matchesFilter = this.currentFilter === 'all' ||
                                (this.currentFilter === 'trending' && stream.viewers > 100) ||
                                (this.currentFilter === 'new' && stream.tags.includes('New'));
            
            return matchesSearch && matchesFilter;
        });
        
        this.currentPage = 1;
        this.renderStreams();
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Re-filter streams
        const searchInput = document.getElementById('searchInput');
        this.filterStreams(searchInput.value);
    }

    renderStreams() {
        const streamsGrid = document.getElementById('streamsGrid');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const streamsToShow = this.filteredStreams.slice(startIndex, endIndex);

        if (streamsToShow.length === 0) {
            streamsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No streams found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        streamsGrid.innerHTML = streamsToShow.map(stream => this.createStreamCard(stream)).join('');
        this.renderPagination();
    }

    createStreamCard(stream) {
        const marketCapFormatted = stream.marketCap ? `$${this.formatNumber(stream.marketCap)}` : 'N/A';
        const timeAgo = this.getTimeAgo(stream.created);
        
        return `
            <div class="stream-card" onclick="app.handleStreamClick('${stream.id}')">
                <div class="stream-header">
                    <div>
                        <div class="stream-title">${stream.title}</div>
                        <div class="stream-symbol">${stream.symbol}</div>
                        <div class="stream-status ${stream.status === 'live' ? 'status-live' : 'status-offline'}">
                            ${stream.status === 'live' ? '🔴 LIVE' : '⚫ OFFLINE'}
                        </div>
                    </div>
                    <div class="stream-thumbnail">
                        <img src="${stream.thumbnail}" alt="${stream.title}" onerror="this.src='https://via.placeholder.com/60x60/667eea/ffffff?text=No+Image'">
                    </div>
                </div>
                
                <div class="stream-stats">
                    <div class="stat">
                        <div class="stat-value">${this.formatNumber(stream.viewers)}</div>
                        <div class="stat-label">Participants</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.formatNumber(stream.holders)}</div>
                        <div class="stat-label">Holders</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.formatNumber(stream.chatMembers)}</div>
                        <div class="stat-label">Chat</div>
                    </div>
                </div>
                
                <div class="market-info">
                    <div class="market-cap">
                        <strong>Market Cap:</strong> ${marketCapFormatted}
                    </div>
                    <div class="time-ago">
                        <strong>Created:</strong> ${timeAgo}
                    </div>
                </div>
                
                <div class="stream-description">
                    ${stream.description}
                </div>
                
                <div class="stream-tags">
                    ${stream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="stream-links">
                    ${stream.twitter ? `<a href="${stream.twitter}" target="_blank" class="link-btn twitter">🐦 Twitter</a>` : ''}
                    ${stream.website ? `<a href="${stream.website}" target="_blank" class="link-btn website">🌐 Website</a>` : ''}
                </div>
            </div>
        `;
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredStreams.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="app.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="${i === this.currentPage ? 'active' : ''}" 
                            onclick="app.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span>...</span>';
            }
        }
        
        // Next button
        paginationHTML += `
            <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="app.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredStreams.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderStreams();
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = Date.now();
        const created = parseInt(timestamp);
        const diffMs = now - created;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return `${diffDays}d ago`;
        }
    }

    setupAutoRefresh() {
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadStreams();
        }, 30000);
    }

    handleStreamClick(streamId) {
        // Handle stream click - could open stream details or redirect
        console.log('Stream clicked:', streamId);
        alert(`Opening stream ${streamId}. In a real app, this would navigate to the stream.`);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PumpFunApp();
});

// Add click handler to stream cards
document.addEventListener('click', (e) => {
    if (e.target.closest('.stream-card')) {
        const card = e.target.closest('.stream-card');
        const streamId = card.onclick.toString().match(/\d+/)[0];
        app.handleStreamClick(parseInt(streamId));
    }
});
