"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function () {
    let locations = [];
    const defaultVisibleCount = 7;
    let filteredLocations = [];
    function fetchFeaturedLocations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('json_files/featuredLocations.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                locations = (yield response.json());
                filteredLocations = [...locations];
                renderFeaturedLocations();
                setupFilterListeners();
            }
            catch (error) {
                console.error('Error fetching featured locations:', error);
            }
        });
    }
    function createLocationCard(location) {
        return `
            <article class="location-card relative bg-white shadow-lg rounded-xl overflow-hidden hover-effect" style="height: 300px;">
                <div class="card-inner">
                    <div class="card-front">
                        <figure>
                            <img src="${location.image}" alt="${location.name}" class="w-full h-40 object-cover">
                        </figure>
                        <div class="p-4 text-left">
                            <h3 class="font-semibold text-md sm:text-lg">${location.name}</h3>
                            <p class="text-xs sm:text-sm text-gray-500">${location.tours} Tours, ${location.activities} Activities</p>
                        </div>
                        <button class="flip-button absolute bottom-4 right-4 bg-gray-200 p-2 rounded-full shadow-md md:mb-5 lg:mb-0 transition-all duration-300 ease-in-out hover:bg-gray-300 hover:shadow-lg hover:scale-110">
                            <img src="assets/right-arrow.png" alt="right-arrow" class="h-4">
                        </button>
                    </div>
                    <div class="card-back pb-12 pt-2 text-left">
                        <h2 class="font-semibold text-md sm:text-lg">${location.name}</h2>
                        <p><strong>Category:</strong> ${location.category}</p>
                        <p><strong>Duration:</strong> ${location.duration}</p>
                        <p><strong>Rating:</strong> ${location.rating} ⭐</p>
                        <p><strong>Price Range:</strong> ${location.priceRange}</p>
                        <button class="flip-button absolute bottom-4 right-4 bg-gray-200 p-2 rounded-full shadow-md transition-all duration-300 ease-in-out hover:bg-gray-300 hover:shadow-lg hover:scale-110">
                            <img src="assets/left-arrow.png" alt="left-arrow" class="h-4">
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
    function createSpecialOfferCard() {
        return `
            <aside id="specialOfferCard" class="hover-effect bg-yellow-300 text-black p-6 rounded-xl shadow-lg flex flex-col justify-center items-center" style="height: 300px;">
                <h3 class="font-semibold text-md sm:text-lg text-center">Crafting Your Perfect Travel Experience</h3>
                <button id="browseAllBtn" class="mt-4 flex items-center text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-full">
                    Browse All locations ➝
                </button>
            </aside>
        `;
    }
    function renderFeaturedLocations(showAll = false) {
        const container = document.querySelector('#featuredLocationsGrid');
        if (!container) {
            console.error('Featured locations grid container not found!');
            return;
        }
        const locationsToShow = showAll ? filteredLocations : filteredLocations.slice(0, defaultVisibleCount);
        const locationCards = locationsToShow.map(createLocationCard).join('');
        if (!showAll && filteredLocations.length > defaultVisibleCount) {
            container.innerHTML = locationCards + createSpecialOfferCard();
            attachBrowseAllListener();
        }
        else {
            container.innerHTML = locationCards;
        }
        attachFlipListeners();
    }
    function attachFlipListeners() {
        const flipButtons = document.querySelectorAll('.flip-button');
        flipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = button.closest('.location-card');
                card === null || card === void 0 ? void 0 : card.classList.toggle('flipped');
            });
        });
    }
    function attachBrowseAllListener() {
        const browseAllBtn = document.getElementById('browseAllBtn');
        browseAllBtn === null || browseAllBtn === void 0 ? void 0 : browseAllBtn.addEventListener('click', () => renderFeaturedLocations(true));
    }
    function setupFilterListeners() {
        const filterSelects = ['categoriesSelect', 'durationSelect', 'reviewSelect', 'priceSelect'];
        filterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select === null || select === void 0 ? void 0 : select.addEventListener('change', applyFilters);
        });
    }
    function applyFilters() {
        var _a, _b, _c, _d;
        const category = ((_a = document.getElementById('categoriesSelect')) === null || _a === void 0 ? void 0 : _a.value) || 'Categories';
        const duration = ((_b = document.getElementById('durationSelect')) === null || _b === void 0 ? void 0 : _b.value) || 'Duration';
        const review = ((_c = document.getElementById('reviewSelect')) === null || _c === void 0 ? void 0 : _c.value) || 'Review/Rating';
        const price = ((_d = document.getElementById('priceSelect')) === null || _d === void 0 ? void 0 : _d.value) || 'Price Range';
        filteredLocations = locations.filter(location => {
            return (category === 'Categories' || location.category === category) &&
                (duration === 'Duration' || location.duration === duration) &&
                (review === 'Review/Rating' || location.rating >= parseInt(review)) &&
                (price === 'Price Range' || location.priceRange === price);
        });
        renderFeaturedLocations();
    }
    function init() {
        fetchFeaturedLocations();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
