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
var _a;
// Current pagination
let currentPage = 1;
const toursPerPage = 3;
// Function to fetch tours data
function fetchTours() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('json_files/tours.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch tours, status: ${response.status}`);
        }
        return yield response.json();
    });
}
// Function to create a tour card
function createTourCard(tour) {
    return `
        <article class="hover-effect bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 relative">
            <span class="absolute top-4 left-4 text-orange-400 bg-white text-xs font-semibold px-3 py-1 rounded-full z-20">
                ${tour.badge}
            </span>
            <button class="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-20">
                <img src="assets/heart.png" alt="heart" class="h-4">
            </button>
            <figure class="relative">
                <img src="${tour.image}" alt="${tour.title}" class="w-full h-56 object-cover rounded-t-2xl">
                <div class="absolute -bottom-0 z-20 right-4 bg-white px-3 py-1 rounded-2xl text-sm flex items-center border-black drop-shadow-md">
                    ⭐ <span class="font-semibold text-black ml-1">${tour.rating}</span> (${tour.reviews} reviews)
                </div>
            </figure>
            <figcaption class="p-5 text-left rounded-t-2xl -translate-y-4 bg-white">
                <h3 class="text-lg font-bold">${tour.title}</h3>
                <p class="text-gray-500 text-sm mt-1 flex items-center">
                    <img src="assets/clock.png" alt="clock" class="h-3 mr-1 opacity-50"> ${tour.duration} 
                    <img src="assets/user.png" alt="user" class="h-3 mr-1 ml-4 opacity-50"> ${tour.guests}
                </p>
                <div class="flex items-center justify-between mt-6">
                    <p class="text-lg font-bold">
                        $${tour.price} <span class="text-sm text-gray-500">/ person</span>
                    </p>
                    <button class="btn-hover bg-gray-300 text-black text-sm font-semibold px-4 py-2 rounded-full">
                        Book Now
                    </button>
                </div>
            </figcaption>
        </article>
    `;
}
// Function to render tours
function renderTours() {
    return __awaiter(this, void 0, void 0, function* () {
        const tours = yield fetchTours();
        const tourGrid = document.getElementById('tourGrid');
        if (!tourGrid) {
            console.error('Tour grid not found!');
            return;
        }
        const startIndex = (currentPage - 1) * toursPerPage;
        const endIndex = startIndex + toursPerPage;
        const toursToRender = tours.slice(startIndex, endIndex);
        toursToRender.forEach((tour) => {
            tourGrid.innerHTML += createTourCard(tour);
        });
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn && endIndex >= tours.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
}
// Event listener for Load More button
(_a = document.getElementById('loadMoreBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    currentPage++;
    renderTours();
});
// Initial render of tours
renderTours();
(function () {
    const blogContainer = document.getElementById('tourGrid');
    if (!blogContainer) {
        console.error('Tour grid container not found!');
        return;
    }
    blogContainer.addEventListener('click', function (event) {
        const target = event.target;
        const heartButton = target.closest('button');
        if (heartButton && heartButton.querySelector('img[alt="heart"]')) {
            const heartIcon = heartButton.querySelector('img');
            if (heartIcon.src.includes('heart-red.png')) {
                heartIcon.src = 'assets/heart.png';
                heartButton.classList.remove('liked');
            }
            else {
                heartIcon.src = 'assets/heart-red.png';
                heartButton.classList.add('liked');
            }
        }
    });
})();
