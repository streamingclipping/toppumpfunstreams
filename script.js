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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        return [
            {
                id: 1,
                title: "PEPE Token Analysis",
                description: "Deep dive into PEPE token performance and market trends",
                viewers: 1250,
                likes: 89,
                status: "live",
                tags: ["PEPE", "Analysis", "Trending"],
                thumbnail: "https://via.placeholder.com/300x200/667eea/ffffff?text=PEPE+Analysis"
            },
            {
                id: 2,
                title: "New Token Launch",
                description: "Live coverage of the latest token launch on PumpFun",
                viewers: 2100,
                likes: 156,
                status: "live",
                tags: ["Launch", "New", "Hot"],
                thumbnail: "https://via.placeholder.com/300x200/28a745/ffffff?text=New+Launch"
            },
            {
                id: 3,
                title: "Market Overview",
                description: "Weekly market analysis and upcoming opportunities",
                viewers: 890,
                likes: 67,
                status: "offline",
                tags: ["Market", "Analysis", "Weekly"],
                thumbnail: "https://via.placeholder.com/300x200/ffc107/ffffff?text=Market+Overview"
            },
            {
                id: 4,
                title: "Technical Analysis",
                description: "Advanced technical analysis for crypto traders",
                viewers: 1750,
                likes: 134,
                status: "live",
                tags: ["Technical", "Trading", "Advanced"],
                thumbnail: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Technical+Analysis"
            },
            {
                id: 5,
                title: "Community Discussion",
                description: "Open discussion about the latest crypto trends",
                viewers: 650,
                likes: 45,
                status: "live",
                tags: ["Community", "Discussion", "Trends"],
                thumbnail: "https://via.placeholder.com/300x200/6f42c1/ffffff?text=Community+Talk"
            },
            {
                id: 6,
                title: "DeFi Strategies",
                description: "Exploring DeFi opportunities and strategies",
                viewers: 1100,
                likes: 78,
                status: "offline",
                tags: ["DeFi", "Strategies", "Opportunities"],
                thumbnail: "https://via.placeholder.com/300x200/20c997/ffffff?text=DeFi+Strategies"
            }
        ];
    }

    filterStreams(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredStreams = this.streams.filter(stream => {
            const matchesSearch = stream.title.toLowerCase().includes(term) ||
                                stream.description.toLowerCase().includes(term) ||
                                stream.tags.some(tag => tag.toLowerCase().includes(term));
            
            const matchesFilter = this.currentFilter === 'all' ||
                                (this.currentFilter === 'trending' && stream.viewers > 1000) ||
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
        return `
            <div class="stream-card" onclick="this.handleStreamClick(${stream.id})">
                <div class="stream-header">
                    <div>
                        <div class="stream-title">${stream.title}</div>
                        <div class="stream-status ${stream.status === 'live' ? 'status-live' : 'status-offline'}">
                            ${stream.status === 'live' ? '🔴 LIVE' : '⚫ OFFLINE'}
                        </div>
                    </div>
                </div>
                
                <div class="stream-stats">
                    <div class="stat">
                        <div class="stat-value">${this.formatNumber(stream.viewers)}</div>
                        <div class="stat-label">Viewers</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${stream.likes}</div>
                        <div class="stat-label">Likes</div>
                    </div>
                </div>
                
                <div class="stream-description">
                    ${stream.description}
                </div>
                
                <div class="stream-tags">
                    ${stream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
