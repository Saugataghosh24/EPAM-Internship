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
    let places = [];
    let currentIndex = 0;
    const itemsPerView = 6;
    function fetchPopularPlaces() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('json_files/popularPlaces.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                places = (yield response.json());
                renderPopularPlaces();
                window.addEventListener('resize', handleResize);
                handleResize(); // Initial setup based on screen size
            }
            catch (error) {
                console.error('Error fetching popular places:', error);
            }
        });
    }
    function createPlaceCard(place) {
        return `
            <article class="flex flex-col items-center flex-shrink-0 w-1/2 md:w-1/6">
                <figure class="w-24 h-32 bg-gray-200 rounded-full overflow-hidden">
                    <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover hover-effect">
                </figure>
                <figcaption class="mt-2 font-medium">${place.name}</figcaption>
                <p class="text-gray-500 text-sm">${place.tours} Tours</p>
            </article>
        `;
    }
    function renderPopularPlaces() {
        const container = document.querySelector('#popularPlacesContainer');
        if (!container) {
            console.error('Popular places container not found!');
            return;
        }
        container.innerHTML = places.map(createPlaceCard).join('');
        updateSlidePosition();
        updateArrowStates();
    }
    function updateSlidePosition() {
        const container = document.querySelector('#popularPlacesContainer');
        if (!container) {
            console.error('Popular places container not found!');
            return;
        }
        if (window.innerWidth >= 768) { // md breakpoint
            const slideAmount = -currentIndex * (100 / itemsPerView);
            container.style.transform = `translateX(${slideAmount}%)`;
        }
        else {
            container.style.transform = 'translateX(0)';
        }
    }
    function updateArrowStates() {
        const leftArrow = document.querySelector('#leftArrow');
        const rightArrow = document.querySelector('#rightArrow');
        if (!leftArrow || !rightArrow) {
            console.error('Arrow buttons not found!');
            return;
        }
        if (window.innerWidth >= 768) { // md breakpoint
            leftArrow.disabled = currentIndex === 0;
            rightArrow.disabled = currentIndex + itemsPerView >= places.length;
            leftArrow.style.opacity = leftArrow.disabled ? '0.5' : '1';
            rightArrow.style.opacity = rightArrow.disabled ? '0.5' : '1';
            leftArrow.style.display = 'block';
            rightArrow.style.display = 'block';
        }
        else {
            leftArrow.style.display = 'none';
            rightArrow.style.display = 'none';
        }
    }
    function slideLeft() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
            updateArrowStates();
        }
    }
    function slideRight() {
        if (currentIndex + itemsPerView < places.length) {
            currentIndex++;
            updateSlidePosition();
            updateArrowStates();
        }
    }
    function handleResize() {
        updateSlidePosition();
        updateArrowStates();
    }
    function init() {
        const leftArrow = document.querySelector('#leftArrow');
        const rightArrow = document.querySelector('#rightArrow');
        if (leftArrow && rightArrow) {
            leftArrow.addEventListener('click', slideLeft);
            rightArrow.addEventListener('click', slideRight);
        }
        else {
            console.error('Arrow buttons not found!');
        }
        fetchPopularPlaces();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
