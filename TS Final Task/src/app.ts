// Hero Image Slider with Dynamic Text
document.addEventListener('DOMContentLoaded', function() {
    let currentSlide: number = 0;
    const slides: NodeListOf<Element> = document.querySelectorAll('#slider .slide');
    const slideTexts: NodeListOf<Element> = document.querySelectorAll('.slide-text');
    const dots: NodeListOf<Element> = document.querySelectorAll('#slider .dot');
    const totalSlides: number = slides.length;
    let slideInterval: number;
    let destinations: any[] = [];

    // Initialize the slider
    function initSlider(): void {
        if (slides.length === 0) return;
        showSlide(0);
        startSlideTimer();
        
        // Add event listeners to navigation elements
        const prevButton: HTMLElement | null = document.getElementById('prev-slide');
        const nextButton: HTMLElement | null = document.getElementById('next-slide');
        if (prevButton) prevButton.addEventListener('click', prevSlide);
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        
        dots.forEach((dot: Element) => {
            dot.addEventListener('click', function(this: HTMLElement) {
                const slideIndex: number = parseInt(this.getAttribute('data-index') || '0');
                showSlide(slideIndex);
                resetSlideTimer();
            });
        });
        
        // Pause timer on hover
        const slider: HTMLElement | null = document.getElementById('slider');
        if (slider) {
            slider.addEventListener('mouseenter', stopSlideTimer);
            slider.addEventListener('mouseleave', startSlideTimer);
        }
    }

    function showSlide(index: number): void {
        // Hide all slides
        slides.forEach(slide => slide.classList.add('hidden'));
        slideTexts.forEach(text => text.classList.add('hidden'));
        
        // Show the current slide and text
        slides[index].classList.remove('hidden');
        slideTexts[index].classList.remove('hidden');
        
        // Add fade-in animation to the text
        slideTexts[index].classList.add('animate-fade-in');
        setTimeout(() => {
            slideTexts[index].classList.remove('animate-fade-in');
        }, 1000);
        
        // Update the current slide index
        currentSlide = index;
        
        // Update dots
        updateDots();
    }

    function nextSlide(): void {
        showSlide((currentSlide + 1) % totalSlides);
        resetSlideTimer();
    }

    function prevSlide(): void {
        showSlide((currentSlide - 1 + totalSlides) % totalSlides);
        resetSlideTimer();
    }

    function updateDots(): void {
        dots.forEach((dot: Element, index: number) => {
            if (index === currentSlide) {
                dot.classList.add('bg-opacity-100');
                dot.classList.add('w-3');
                dot.classList.add('h-3');
            } else {
                dot.classList.remove('bg-opacity-100');
                dot.classList.remove('w-3');
                dot.classList.remove('h-3');
            }
        });
    }

    function startSlideTimer(): void {
        slideInterval = window.setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopSlideTimer(): void {
        clearInterval(slideInterval);
    }

    function resetSlideTimer(): void {
        stopSlideTimer();
        startSlideTimer();
    }

    
    
    
    
    // Helper function for placeholder images
    function getPlaceholderImage(destinationName: string): string {
        // Encode the destination name for use in a URL
        const encoded: string = encodeURIComponent(destinationName);
        // Use a placeholder image service
        return `https://source.unsplash.com/300x200/?${encoded.split(',')[0]}`;
    }

    // Format date for display
    function formatDate(dateString: string): string {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    
    
    
    
    // ===== TAB NAVIGATION =====
    const tabNav: HTMLElement | null = document.getElementById('tab-navigation');
    if (tabNav) {
        const tabs: NodeListOf<Element> = tabNav.querySelectorAll('button');
        
        // Set initial state - only Tours tab is active
        tabs.forEach(tab => {
            if (tab.id === 'tours') {
                tab.classList.remove('bg-white', 'text-gray-700');
                tab.classList.add('bg-black', 'text-white');
            } else {
                tab.classList.remove('bg-black', 'text-white');
                tab.classList.add('bg-white', 'text-gray-700');
            }
        });
        
        // Initialize form fields for Tours tab
        updateFormFields('tours');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => {
                    t.classList.remove('bg-black', 'text-white');
                    t.classList.add('bg-white', 'text-gray-700');
                });
                
                // Add active class to clicked tab
                tab.classList.remove('bg-white', 'text-gray-700');
                tab.classList.add('bg-black', 'text-white');
                
                // Update form fields based on the tab
                updateFormFields(tab.id);
            });
        });
    }

    function updateFormFields(tabId: string): void {
        const formContainer: HTMLElement | null = document.querySelector('form.bg-gray-200');
        if (!formContainer) return;
        
        // Sample field updates based on tab
        switch(tabId) {
            case 'tours':
                formContainer.innerHTML = `
                    <fieldset class="grid grid-cols-2 gap-2 sm:gap-4">
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                            Location
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                <input 
                                    id="location-search" 
                                    type="text" 
                                    placeholder="Search destinations..." 
                                    class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                >
                            </div>
                            <div id="search-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Check In
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="checkin" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-02" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Check Out
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="time" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-09" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Guest
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/user.png" alt="user" class="h-3 sm:h-3.5 opacity-50">
                                <select class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1">
                                    <option>2 adults, 2 children</option>
                                    <option>2 adults, 1 children</option>
                                    <option>1 adult, 0 children</option>
                                    <option>1 adult, 1 child</option>
                                </select>
                            </div>
                        </label>
                    </fieldset>
                `;
                break;
            case 'hotels':
                formContainer.innerHTML = `
                    <fieldset class="grid grid-cols-2 gap-2 sm:gap-4">
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                            Hotel Location
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                <input 
                                    id="location-search" 
                                    type="text" 
                                    placeholder="Search hotels..." 
                                    class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                >
                            </div>
                            <div id="search-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Check In
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="checkin" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-02" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Check Out
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="time" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-05" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Rooms & Guests
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/user.png" alt="user" class="h-3 sm:h-3.5 opacity-50">
                                <select class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1">
                                    <option>1 Room, 2 Guests</option>
                                    <option>2 Rooms, 4 Guests</option>
                                    <option>1 Room, 1 Guest</option>
                                </select>
                            </div>
                        </label>
                    </fieldset>
                `;
                break;
                case 'tickets':
                    formContainer.innerHTML = `
                        <fieldset class="grid grid-cols-2 gap-2 sm:gap-4">
                            <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                                From
                                <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                    <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                    <input 
                                        id="departure-city" 
                                        type="text" 
                                        value="Kolkata, India" 
                                        readonly
                                        class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                    >
                                </div>
                            </label>
                            <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                                To
                                <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                    <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                    <input 
                                        id="location-search" 
                                        type="text" 
                                        placeholder="Destination city..." 
                                        class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                    >
                                </div>
                                <div id="search-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                            </label>
                            <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                                Departure
                                <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                    <img src="assets/time.png" alt="checkin" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                    <input type="date" value="2024-01-02" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                                </div>
                            </label>
                            <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                                Passengers
                                <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                    <img src="assets/user.png" alt="user" class="h-3 sm:h-3.5 opacity-50">
                                    <select class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1">
                                        <option>1 Adult</option>
                                        <option>2 Adults</option>
                                        <option>1 Adult, 1 Child</option>
                                        <option>2 Adults, 2 Children</option>
                                    </select>
                                </div>
                            </label>
                        </fieldset>
                    `;
                    break;
            case 'rental':
                formContainer.innerHTML = `
                    <fieldset class="grid grid-cols-2 gap-2 sm:gap-4">
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                            Pick-up Location
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                <input 
                                    id="location-search" 
                                    type="text" 
                                    placeholder="Pick-up location..." 
                                    class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                >
                            </div>
                            <div id="search-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                            Drop-off Location
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                <input 
                                    id="dropoff-search" 
                                    type="text" 
                                    placeholder="Same as pick-up" 
                                    class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                >
                            </div>
                            <div id="dropoff-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Pick-up Date
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="checkin" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-02" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Drop-off Date
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="time" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-05" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                    </fieldset>
                `;
                break;
            case 'activities':
                formContainer.innerHTML = `
                    <fieldset class="grid grid-cols-2 gap-2 sm:gap-4">
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold relative">
                            Location
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="location" class="h-3 sm:h-4 opacity-50">
                                <input 
                                    id="location-search" 
                                    type="text" 
                                    placeholder="Search activities..." 
                                    class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1"
                                >
                            </div>
                            <div id="search-results" class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hidden"></div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Date
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 md:px-0 rounded border border-gray-300">
                                <img src="assets/time.png" alt="checkin" class="pl-1.5 h-3 sm:h-4 opacity-50">
                                <input type="date" value="2024-01-02" class="w-full text-black text-xs sm:text-sm font-semibold border-none bg-transparent focus:outline-none ml-1">
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Activity Type
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/location.png" alt="activity" class="h-3 sm:h-4 opacity-50">
                                <select class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1">
                                    <option>All Activities</option>
                                    <option>Adventure</option>
                                    <option>Cultural</option>
                                    <option>Relaxation</option>
                                    <option>Family-friendly</option>
                                </select>
                            </div>
                        </label>
                        <label class="text-xs sm:text-sm text-gray-600 font-semibold">
                            Participants
                            <div class="flex items-center bg-white px-1 py-1.5 sm:py-2 rounded border border-gray-300">
                                <img src="assets/user.png" alt="user" class="h-3 sm:h-3.5 opacity-50">
                                <select class="w-full border-none bg-transparent text-black text-xs sm:text-sm font-semibold focus:outline-none ml-1">
                                    <option>1 Person</option>
                                    <option>2 People</option>
                                    <option>3-5 People</option>
                                    <option>6+ People</option>
                                </select>
                            </div>
                        </label>
                    </fieldset>
                `;
                break;
            default:
                // Default case
                break;
        }

        // Re-initialize search functionality after DOM changes
        initializeSearch();
    }

    
    
    
    
    // Search Functionality
    function initializeSearch(): void {
        const searchInput: HTMLInputElement | null = document.getElementById('location-search') as HTMLInputElement;
        const searchResults: HTMLElement | null = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;

        // Search input event listener
        searchInput.addEventListener('input', function() {
            const query: string = this.value.toLowerCase().trim();
            
            // Clear results if query is too short
            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
                return;
            }

            // Filter destinations based on query
            const filteredResults = destinations.filter(destination => 
                destination.name.toLowerCase().includes(query) || 
                destination.description.toLowerCase().includes(query) ||
                destination.category.toLowerCase().includes(query) ||
                (destination.activities && destination.activities.some((activity: string) => activity.toLowerCase().includes(query)))
            );

            // Display results
            displayResults(filteredResults);
        });

        // Display search results
        function displayResults(results: any[]): void {
            if (!searchResults || !searchInput) return;
            // Clear previous results
            searchResults.innerHTML = '';
            
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="p-2 text-center text-gray-500 text-xs">No destinations found</div>';
                searchResults.classList.remove('hidden');
                return;
            }

            // Create results list
            const resultsList: HTMLUListElement = document.createElement('ul');
            resultsList.className = 'py-1';
            
            // Add results to list (limit to 5)
            results.slice(0, 5).forEach(destination => {
                const listItem: HTMLLIElement = document.createElement('li');
                listItem.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs';
                
                // Simplified display - only show location name
                listItem.textContent = destination.name;
                
                // Click event to select destination
                listItem.addEventListener('click', function() {
                    searchInput.value = destination.name;
                    searchResults.classList.add('hidden');
                    
                    // Store the selected destination ID
                    searchInput.dataset.selectedId = destination.id.toString();
                });
                
                resultsList.appendChild(listItem);
            });
            
            // If there are more results than shown
            if (results.length > 5) {
                const moreItem: HTMLLIElement = document.createElement('li');
                moreItem.className = 'px-3 py-2 text-center text-xs text-gray-500 border-t';
                moreItem.textContent = `+${results.length - 5} more destinations`;
                resultsList.appendChild(moreItem);
            }
            
            searchResults.appendChild(resultsList);
            searchResults.classList.remove('hidden');
        }

        // Close results when clicking outside
        document.addEventListener('click', function(event: MouseEvent) {
            if (!searchInput.contains(event.target as Node) && !searchResults.contains(event.target as Node)) {
                searchResults.classList.add('hidden');
            }
        });

        // Show results when focusing on input
        searchInput.addEventListener('focus', function() {
            const query: string = this.value.toLowerCase().trim();
            if (query.length >= 2) {
                const filteredResults = destinations.filter(destination => 
                    destination.name.toLowerCase().includes(query) || 
                    destination.description.toLowerCase().includes(query)
                );
                displayResults(filteredResults);
            }
        });
    }

    
    
    
    
    // Search button functionality
    document.addEventListener('click', function(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.closest('#search-button')) {
            e.preventDefault();
            
            const locationInput: HTMLInputElement | null = document.getElementById('location-search') as HTMLInputElement;
            if (!locationInput) return;
            
            // Check if the location input is empty
            if (locationInput.value.trim() === '') {
                // Show error message for empty input
                showLocationError(locationInput, 'Please enter a location');
                return; // Stop execution - don't perform search
            }
            
            // Check if the location exists in our destinations data
            // Skip this validation for the tickets tab where departure is fixed to Kolkata
            const activeTabElement = document.querySelector('#tab-navigation button.bg-black');
            const activeTab: string = activeTabElement ? (activeTabElement as HTMLElement).id : 'tours';
            const selectedDestId = locationInput.dataset.selectedId;
            
            // For tickets tab, we only need to validate the destination input
            if (activeTab === 'tickets') {
                // For tickets tab, we don't need to validate as strictly
                // Just proceed with the search
            } else {
                // For other tabs, validate that the location exists in our data
                if (!selectedDestId) {
                    const query: string = locationInput.value.toLowerCase().trim();
                    const matchingDestinations = destinations.filter(dest => 
                        dest.name.toLowerCase() === query || // Exact match
                        dest.name.toLowerCase().includes(query) // Partial match
                    );
                    
                    if (matchingDestinations.length === 0) {
                        // Show error message for invalid location
                        showLocationError(locationInput, 'Please select a valid location');
                        return; // Stop execution - don't perform search
                    }
                }
            }
            
            // Clear any existing error message
            clearLocationError(locationInput);
            
            // Get form data with proper selectors
            const formContainer: HTMLElement | null = document.querySelector('form.bg-gray-200');
            let checkInDate: string = '';
            let checkOutDate: string = '';
            let guests: string = '';
            
            if (formContainer) {
                // Get all date inputs in the form
                const dateInputs: NodeListOf<HTMLInputElement> = formContainer.querySelectorAll('input[type="date"]');
                if (dateInputs.length >= 1) checkInDate = dateInputs[0].value;
                if (dateInputs.length >= 2) checkOutDate = dateInputs[1].value;
                
                // Get the select input for guests
                const selectInput: HTMLSelectElement | null = formContainer.querySelector('select');
                if (selectInput) guests = selectInput.value;
            }
              
            // Show loading state
            const resultsSection: HTMLElement | null = document.getElementById('search-results-section');
            
            if (!resultsSection) {
                // Create results section if it doesn't exist
                createResultsSection();
                return;
            }
            
            const loadingIndicator: HTMLElement | null = document.getElementById('loading-results');
            const resultsContainer: HTMLElement | null = document.getElementById('results-container');
            const noResultsMessage: HTMLElement | null = document.getElementById('no-results-message');
            
            if (resultsSection) resultsSection.classList.remove('hidden');
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            if (resultsContainer) resultsContainer.classList.add('hidden');
            if (noResultsMessage) noResultsMessage.classList.add('hidden');
            
            // Scroll to results section
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Simulate loading delay (remove in production and replace with actual API call)
            setTimeout(() => {
                // Hide loading indicator
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
                
                // Update search summary
                const searchSummary: HTMLElement | null = document.getElementById('search-summary');
                if (searchSummary) {
                    searchSummary.textContent = 
                        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} in ${locationInput.value || 'All Destinations'} from ${formatDate(checkInDate)} to ${formatDate(checkOutDate)} for ${guests}`;
                }
                
                // Filter destinations based on search
                let filteredDestinations: any[] = [];
                
                if (selectedDestId) {
                    // If a specific destination was selected from dropdown
                    filteredDestinations = destinations.filter(dest => dest.id.toString() === selectedDestId);
                } else {
                    // If text was entered but no specific destination selected
                    const query: string = locationInput.value.toLowerCase().trim();
                    filteredDestinations = destinations.filter(dest => 
                        dest.name.toLowerCase().includes(query) || 
                        dest.description.toLowerCase().includes(query) ||
                        dest.category.toLowerCase().includes(query)
                    );
                }
                
                // Display results
                if (filteredDestinations.length > 0) {
                    displayDestinationResults(filteredDestinations, activeTab);
                    if (resultsContainer) resultsContainer.classList.remove('hidden');
                } else {
                    if (noResultsMessage) noResultsMessage.classList.remove('hidden');
                }
            }, 1500); // 1.5 second simulated loading time
        }
    });

    // Function to show location input error
    function showLocationError(inputElement: HTMLInputElement, message: string): void {
        // Remove any existing error message
        clearLocationError(inputElement);
        
        // Create error message
        const errorMessage: HTMLDivElement = document.createElement('div');
        errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
        errorMessage.textContent = message;
        
        // Add error styling to input
        const inputContainer: HTMLElement | null = inputElement.closest('.flex');
        if (inputContainer) {
            inputContainer.classList.add('border-red-500');
        }
        
        // Insert error message after the input container
        const parentLabel: HTMLElement | null = inputElement.closest('label');
        if (parentLabel) {
            const inputWrapper: HTMLElement | null = inputElement.closest('.flex');
            if (inputWrapper) {
                parentLabel.insertBefore(errorMessage, inputWrapper.nextSibling);
            }
        }
        
        // Shake the input to indicate error
        inputElement.classList.add('shake-animation');
        setTimeout(() => {
            inputElement.classList.remove('shake-animation');
        }, 500);
    }

    // Function to clear location input error
    function clearLocationError(inputElement: HTMLInputElement): void {
        // Remove error styling from input
        const inputContainer: HTMLElement | null = inputElement.closest('.flex');
        if (inputContainer) {
            inputContainer.classList.remove('border-red-500');
        }
        
        // Remove any existing error message
        const parentLabel: HTMLElement | null = inputElement.closest('label');
        if (parentLabel) {
            const errorMessage: HTMLElement | null = parentLabel.querySelector('.error-message');
            if (errorMessage) {
                parentLabel.removeChild(errorMessage);
            }
        }
    }



    
    
    // Create results section if it doesn't exist
    function createResultsSection(): void {
        const resultsSection: HTMLElement = document.createElement('section');
        resultsSection.id = 'search-results-section';
        resultsSection.className = 'py-12 px-4 sm:px-6 bg-gray-50';
        
        resultsSection.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <header class="mb-8 text-center">
                    <h2 class="text-2xl sm:text-3xl font-bold">Search Results</h2>
                    <p id="search-summary" class="text-gray-600 mt-2">Showing destinations matching your search</p>
                </header>
                
                <!-- Results Container -->
                <div id="results-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Results will be populated here -->
                </div>
                
                <!-- No Results Message -->
                <div id="no-results-message" class="hidden text-center py-12">
                    <img src="assets/no-results.png" alt="No results" class="w-24 h-24 mx-auto opacity-50">
                    <p class="text-xl font-semibold mt-4">No destinations found</p>
                    <p class="text-gray-500 mt-2">Try adjusting your search criteria</p>
                    <button id="clear-search" class="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800">
                        Clear Search
                    </button>
                </div>
                
                <!-- Loading Indicator -->
                <div id="loading-results" class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
                    <p class="text-gray-600 mt-4">Finding the perfect destinations...</p>
                </div>
            </div>
        `;
        
        // Insert after hero section
        const heroSection: HTMLElement | null = document.querySelector('section');
        if (heroSection) {
            heroSection.parentNode?.insertBefore(resultsSection, heroSection.nextSibling);
            
            // Add event listener for clear search button
            const clearSearchButton: HTMLElement | null = document.getElementById('clear-search');
            if (clearSearchButton) {
                clearSearchButton.addEventListener('click', function() {
                    const locationInput: HTMLInputElement | null = document.getElementById('location-search') as HTMLInputElement;
                    if (locationInput) locationInput.value = '';
                    const searchResultsSection = document.getElementById('search-results-section');
                    if (searchResultsSection) searchResultsSection.classList.add('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            
            // Trigger search again now that the section exists
            const searchButton: HTMLElement | null = document.querySelector('#search-button');
            if (searchButton) searchButton.click();
        }
    }

    // Display destination results with different layouts based on category
    function displayDestinationResults(destinations: any[], category: string): void {
        const resultsContainer: HTMLElement | null = document.getElementById('results-container');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        destinations.forEach((destination, index) => {
            // Create destination card
            const card: HTMLElement = document.createElement('article');
            card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
            
            // Set animation order for staggered appearance
            const animationOrder = index;
            card.style.setProperty('--animation-order', animationOrder.toString());
            
            // Use actual image or placeholder
            const imageUrl = destination.image || getPlaceholderImage(destination.name);
            
            // Star rating display
            const stars = '★'.repeat(Math.floor(destination.rating)) + 
                        (destination.rating % 1 >= 0.5 ? '½' : '') +
                        '☆'.repeat(5 - Math.ceil(destination.rating));
            
            // Different content based on tab category
            let cardContent = '';
            
            switch(category) {
                case 'tours':
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                from ${destination.price}/person
                            </div>
                            <div class="absolute bottom-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                                7-day tour
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg">${destination.name}</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">${destination.description}</p>
                            
                            <div class="mt-3 flex flex-wrap gap-1">
                                ${destination.activities ? destination.activities.map((activity: string) => 
                                    `<span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">${activity}</span>`
                                ).join('') : ''}
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Tour guide:</span> English speaking
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Group size:</span> Max 12
                                </div>
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                View Tour Details
                            </button>
                        </div>
                    `;
                    break;
                    
                case 'hotels':
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                ${destination.price}/night
                            </div>
                            <div class="absolute bottom-3 left-3 bg-blue-400 text-white text-xs font-bold px-2 py-1 rounded">
                                Free cancellation
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg">${destination.name} Hotel</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">Luxury accommodation in the heart of ${destination.name}</p>
                            
                            <div class="mt-3 flex flex-wrap gap-1">
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">WiFi</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Pool</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Spa</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Restaurant</span>
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Check-in:</span> 2 PM
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Check-out:</span> 11 AM
                                </div>
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                Book Room
                            </button>
                        </div>
                    `;
                    break;
                    
                case 'tickets':
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                ${destination.price} one-way
                            </div>
                            <div class="absolute bottom-3 left-3 bg-green-400 text-white text-xs font-bold px-2 py-1 rounded">
                                Direct flights
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg">Flights to ${destination.name}</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">Multiple airlines with daily departures</p>
                            
                            <div class="mt-3 flex items-center justify-between">
                                <div class="text-sm font-semibold">Kolkata</div>
                                <div class="flex-1 mx-2 border-t border-dashed border-gray-300 relative">
                                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="text-sm font-semibold">${destination.name.split(',')[0]}</div>
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Duration:</span> 8h 20m
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Airlines:</span> Multiple
                                </div>
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                Search Flights
                            </button>
                        </div>
                    `;
                    break;
                    
                case 'rental':
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                ${destination.price}/day
                            </div>
                            <div class="absolute bottom-3 left-3 bg-purple-400 text-white text-xs font-bold px-2 py-1 rounded">
                                Unlimited mileage
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg">Car Rental in ${destination.name}</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">Explore ${destination.name} at your own pace</p>
                            
                            <div class="mt-3 flex flex-wrap gap-1">
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">SUV</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Sedan</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Compact</span>
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Luxury</span>
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Pick-up:</span> Airport
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Insurance:</span> Included
                                </div>
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                View Vehicles
                            </button>
                        </div>
                    `;
                    break;
                    
                case 'activities':
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                ${destination.price}/person
                            </div>
                            <div class="absolute bottom-3 left-3 bg-red-400 text-white text-xs font-bold px-2 py-1 rounded">
                                Top rated
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                                                <h3 class="font-bold text-lg">${destination.name} Activities</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">Unforgettable experiences in ${destination.name}</p>
                            
                            <div class="mt-3 flex flex-wrap gap-1">
                                ${destination.activities ? destination.activities.slice(0, 3).map((activity: string) => 
                                    `<span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">${activity}</span>`
                                ).join('') : ''}
                                <span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">Guided Tours</span>
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Duration:</span> 3-4 hours
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span class="font-semibold">Languages:</span> Multiple
                                </div>
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                Browse Activities
                            </button>
                        </div>
                    `;
                    break;
                    
                default:
                    // Default case - use tours layout
                    cardContent = `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${destination.name}" class="w-full h-48 object-cover">
                            <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                ${destination.price}
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg">${destination.name}</h3>
                                <div class="text-yellow-500 text-sm">${stars}</div>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">${destination.description}</p>
                            
                            <div class="mt-3 flex flex-wrap gap-1">
                                ${destination.activities ? destination.activities.map((activity: string) => 
                                    `<span class="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">${activity}</span>`
                                ).join('') : ''}
                            </div>
                            
                            <button class="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                View Details
                            </button>
                        </div>
                    `;
            }
            
            card.innerHTML = cardContent;
            resultsContainer.appendChild(card);
        });
    }

    
    
    
    
    // ===== MOBILE MENU TOGGLE =====
    const menuToggle: HTMLElement | null = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const mobileMenu: HTMLElement | null = document.getElementById('mobile-menu');
            if (mobileMenu) {
                if (mobileMenu.classList.contains('translate-x-full')) {
                    mobileMenu.classList.remove('translate-x-full');
                    mobileMenu.classList.add('translate-x-0');
                    mobileMenu.classList.remove('hidden');
                } else {
                    mobileMenu.classList.remove('translate-x-0');
                    mobileMenu.classList.add('translate-x-full');
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                    }, 300);
                }
            }
        });
    }

    // Scroll to top button
    const scrollToTopButton: HTMLElement | null = document.getElementById('scroll-to-top');
    if (scrollToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopButton.classList.remove('opacity-0', 'invisible');
                scrollToTopButton.classList.add('opacity-100');
            } else {
                scrollToTopButton.classList.remove('opacity-100');
                scrollToTopButton.classList.add('opacity-0', 'invisible');
            }
        });

        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }




    // Fetch destinations data
    fetch('json_files/destinations.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            destinations = data;
            console.log('Destinations loaded:', destinations.length);
            
            // Initialize search after data is loaded
            initializeSearch();
        })
        .catch(error => {
            console.error('Error loading destinations:', error);
            // Fallback data in case the fetch fails
            
            initializeSearch();
        });

    // Initialize slider
    initSlider();
});







// FAQ Accordion & Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ items and tab content
    const tabButtons: NodeListOf<Element> = document.querySelectorAll('.tab-button');
    const tabContents: NodeListOf<Element> = document.querySelectorAll('.tab-content');
    const faqItems: NodeListOf<Element> = document.querySelectorAll('section.py-16 section.mt-10 article');

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function(this: Element) {
            const tab = (this as HTMLElement).dataset.tab;

            // Deactivate all buttons and hide all contents
            tabButtons.forEach(btn => btn.classList.remove('activated', 'bg-gray-200'));
            tabContents.forEach(content => content.classList.add('hidden'));

            // Activate the current button and show its content
            this.classList.add('activated', 'bg-gray-200');
            const tabContent = document.querySelector(`section[data-content="${tab}"]`);
            if (tabContent) tabContent.classList.remove('hidden');
        });
    });

    // Add click event listeners to all FAQ headers
    faqItems.forEach((item, index) => {
        const header: HTMLElement | null = item.querySelector('header');
        if (header) {
            header.addEventListener('click', function() {
                const article: HTMLElement = this.parentElement as HTMLElement;
                const content: HTMLElement | null = article.querySelector('p');
                const button: HTMLElement | null = article.querySelector('button');
                
                // Check if this item has content
                if (!content) {
                    // Create content for items that don't have it yet
                    const newContent: HTMLParagraphElement = document.createElement('p');
                    newContent.className = 'p-4 sm:p-5 text-xs sm:text-sm text-gray-600 bg-gray-50 hidden';
                    
                    // Set content based on the question
                    switch(index) {
                        case 1:
                            newContent.textContent = 'Travel document requirements vary by destination. Typically, you\'ll need a passport valid for at least six months beyond your travel dates. Some countries require visas, travel insurance, or proof of onward travel. Check the specific requirements for your destination on our website or contact our customer service for assistance with obtaining necessary documents.';
                            break;
                        case 2:
                            newContent.textContent = 'Our modification and cancellation policies vary depending on the type of booking and the provider\'s terms. Most bookings can be modified or canceled through your account dashboard. For hotels and tours, free cancellation is typically available up to 24-48 hours before check-in. Flight changes may incur airline fees. Please refer to the specific terms provided during booking or contact our customer service for assistance.';
                            break;
                        case 3:
                            newContent.textContent = 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. We also support digital payment methods such as PayPal, Apple Pay, Google Pay, and major cryptocurrencies. All payments are processed securely with industry-standard encryption to protect your financial information.';
                            break;
                        case 4:
                            newContent.textContent = 'Our customer service team is available 24/7 to assist with urgent matters. For general inquiries, we operate from 8:00 AM to 10:00 PM (EST) seven days a week. Live chat typically responds within 2 minutes, email inquiries within 24 hours, and phone calls are usually answered within 5 minutes during peak hours. We strive to resolve most issues during the first contact.';
                            break;
                        default:
                            newContent.textContent = 'Additional information about this topic will be provided soon.';
                    }
                    
                    article.appendChild(newContent);
                }
                
                // Toggle the expanded state
                toggleFAQItem(article);
            });
        }
    });

    // Function to toggle FAQ item state
    function toggleFAQItem(article: HTMLElement): void {
        const isExpanded: boolean = article.classList.contains('expanded');
        const button: HTMLElement | null = article.querySelector('button');
        const content: HTMLElement | null = article.querySelector('p');
        const header: HTMLElement | null = article.querySelector('header');

        if (isExpanded) {
            // Collapse this item
            article.classList.remove('expanded');
            if (button) {
                button.classList.remove('bg-black');
                button.classList.add('bg-gray-200', 'text-gray-700');
                button.innerHTML = '<img src="assets/add.png" alt="add" class="h-3 sm:h-3.5">';
            }
            if (header) {
                header.classList.remove('bg-gray-100');
            }

            // Hide content with animation
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
                setTimeout(() => {
                    if (content) {
                        content.style.maxHeight = '0px';
                        setTimeout(() => {
                            if (content) {
                                content.classList.add('hidden');
                                content.style.maxHeight = '';
                            }
                        }, 10);
                    }
                }, 10);
            }

        } else {
            // First, collapse all other items
            document.querySelectorAll('section.py-16 section.mt-10 article.expanded').forEach((item: Element) => {
                if (item !== article) toggleFAQItem(item as HTMLElement);
            });

            // Expand this item
            article.classList.add('expanded');
            if (button) {
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('bg-black');
                button.innerHTML = '<img src="assets/cross.png" alt="cross" class="h-3 sm:h-3.5">';
            }
            if (header) {
                header.classList.add('bg-gray-100');
            }

            // Show content with animation
            if (content) {
                content.classList.remove('hidden');
                content.style.maxHeight = '0px';
                setTimeout(() => {
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        setTimeout(() => {
                            if (content) {
                                content.style.maxHeight = '';
                            }
                        }, 1000);
                    }
                }, 10);
            }
        }
    }
});




// Clear Search Funtionality 
function initializeClearSearchButton(): void {
    const clearSearchButton: HTMLElement | null = document.getElementById('clear-search');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', clearSearch);
    } else {
        console.error('Clear search button not found');
    }
}

function clearSearch(): void {
    const locationInput: HTMLInputElement | null = document.getElementById('location-search') as HTMLInputElement;
    if (locationInput) {
        locationInput.value = '';
    }

    const searchResultsSection: HTMLElement | null = document.getElementById('search-results-section');
    if (searchResultsSection) {
        searchResultsSection.classList.add('hidden');
    } else {
        console.error('Search results section not found');
    }

    // Reset any other search-related elements or states here
    // For example, you might want to clear any displayed results:
    const resultsContainer: HTMLElement | null = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeClearSearchButton();
    // ... other initializations
});


// Email id verification
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm: HTMLFormElement | null = document.getElementById('newsletterForm') as HTMLFormElement;
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const emailInput: HTMLInputElement | null = document.getElementById('emailInput') as HTMLInputElement;
            const errorMessage: HTMLElement | null = document.getElementById('errorMessage');

            if (!emailInput || !errorMessage) return;

            // Stricter regular expression for validating email addresses
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (emailRegex.test(emailInput.value)) {
                // Hide error message and proceed with form submission
                errorMessage.classList.add('hidden');
                alert('Subscription successful');
                
                // Optionally, you could submit the form here if using a backend
                // this.submit();
            } else {
                // Show error message
                errorMessage.textContent = 'Please enter a valid email address.';
                errorMessage.classList.remove('hidden');
            }
        });
    }
});


// Check if service workers are supported by the browser
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration: ServiceWorkerRegistration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error: Error) => {
                console.error('Service Worker registration failed:', error.message);
            });
    });
}

