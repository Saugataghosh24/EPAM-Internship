interface Place {
    name: string;
    image: string;
    tours: number;
}

(function () {
    let places: Place[] = [];
    let currentIndex: number = 0;
    const itemsPerView: number = 6;

    async function fetchPopularPlaces(): Promise<void> {
        try {
            const response = await fetch('json_files/popularPlaces.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            places = (await response.json()) as Place[];
            renderPopularPlaces();
            window.addEventListener('resize', handleResize);
            handleResize(); // Initial setup based on screen size
        } catch (error) {
            console.error('Error fetching popular places:', error);
        }
    }

    function createPlaceCard(place: Place): string {
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

    function renderPopularPlaces(): void {
        const container = document.querySelector('#popularPlacesContainer') as HTMLElement | null;
        if (!container) {
            console.error('Popular places container not found!');
            return;
        }
        container.innerHTML = places.map(createPlaceCard).join('');
        updateSlidePosition();
        updateArrowStates();
    }

    function updateSlidePosition(): void {
        const container = document.querySelector('#popularPlacesContainer') as HTMLElement | null;
        if (!container) {
            console.error('Popular places container not found!');
            return;
        }

        if (window.innerWidth >= 768) { // md breakpoint
            const slideAmount = -currentIndex * (100 / itemsPerView);
            container.style.transform = `translateX(${slideAmount}%)`;
        } else {
            container.style.transform = 'translateX(0)';
        }
    }

    function updateArrowStates(): void {
        const leftArrow = document.querySelector('#leftArrow') as HTMLButtonElement | null;
        const rightArrow = document.querySelector('#rightArrow') as HTMLButtonElement | null;

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
        } else {
            leftArrow.style.display = 'none';
            rightArrow.style.display = 'none';
        }
    }

    function slideLeft(): void {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
            updateArrowStates();
        }
    }

    function slideRight(): void {
        if (currentIndex + itemsPerView < places.length) {
            currentIndex++;
            updateSlidePosition();
            updateArrowStates();
        }
    }

    function handleResize(): void {
        updateSlidePosition();
        updateArrowStates();
    }

    function init(): void {
        const leftArrow = document.querySelector('#leftArrow') as HTMLButtonElement | null;
        const rightArrow = document.querySelector('#rightArrow') as HTMLButtonElement | null;

        if (leftArrow && rightArrow) {
            leftArrow.addEventListener('click', slideLeft);
            rightArrow.addEventListener('click', slideRight);
        } else {
            console.error('Arrow buttons not found!');
        }

        fetchPopularPlaces();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();