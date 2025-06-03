interface Flight {
    image: string;
    departureDate: string;
    returnDate: string;
    from: string;
    to: string;
    businessPrice: number;
    economyPrice: number;
    seatsLeft: number;
}

(function () {
    let currentPage: number = 0;
    const flightsPerPage: number = 4;
    let flights: Flight[] = [];

    function createFlightCard(flight: Flight): string {
        return `
            <article class="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden hover-effect">
                <figure class="w-full sm:w-1/3 h-40 sm:h-full relative">
                    <img src="${flight.image}" class="w-full h-full object-cover" alt="Flight Image">
                    <button class="absolute top-3 left-3 bg-white p-1.5 rounded-full shadow-md">
                        <img src="assets/heart.png" alt="heart" class="h-3">
                    </button>
                </figure>
                <figcaption class="p-4 w-full sm:w-2/3 bg-white h-full">
                    <p class="text-gray-500 text-xs sm:text-sm flex items-center">
                        <img src="assets/clock.png" alt="clock" class="h-3 mr-1 opacity-50"> ${flight.departureDate}
                        <span class="mx-1">
                            <img src="assets/Horizontal Divider.png" alt="divider" class="w-4 mx-2">
                        </span>
                        <img src="assets/clock.png" alt="clock" class="h-3 mr-1 opacity-50"> ${flight.returnDate}
                    </p>
                    <h2 class="text-base sm:text-lg font-bold mt-2">
                        ${flight.from} <span class="text-gray-500 px-2">⇄</span> ${flight.to}
                    </h2>
                    <div class="flex gap-10 mt-2">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-500">Business</p>
                            <p class="text-lg sm:text-xl font-bold">$${flight.businessPrice.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="hidden sm:block text-xs sm:text-sm text-gray-500">Economy</p>
                            <p class="hidden sm:block text-lg sm:text-xl font-bold">$${flight.economyPrice.toFixed(2)}</p>
                        </div>
                    </div>
                    <footer class="flex justify-between items-center mt-12">
                        <p class="text-xs text-gray-500">${flight.seatsLeft} Seats left</p>
                        <button class="btn-hover bg-gray-300 text-black text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full">
                            Book Now
                        </button>
                    </footer>
                </figcaption>
            </article>
        `;
    }

    function renderFlights(): void {
        const flightGrid = document.getElementById('flightGrid') as HTMLElement | null;
        if (!flightGrid) {
            console.error('Flight grid element not found!');
            return;
        }
        const startIndex = currentPage * flightsPerPage;
        const endIndex = startIndex + flightsPerPage;
        const flightsToRender = flights.slice(startIndex, endIndex);

        const newFlights = flightsToRender.map(createFlightCard).join('');

        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = newFlights;

        // Apply fade-out effect to current flights
        flightGrid.style.opacity = '0';

        // After a short delay, update the content and fade in
        setTimeout(() => {
            flightGrid.innerHTML = newFlights;
            flightGrid.style.opacity = '1';
        }, 300);

        updateButtonStates();
    }

    function updateButtonStates(): void {
        const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;

        if (!prevBtn || !nextBtn) {
            console.error('Navigation buttons not found!');
            return;
        }

        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = (currentPage + 1) * flightsPerPage >= flights.length;

        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }

    function nextPage(): void {
        if ((currentPage + 1) * flightsPerPage < flights.length) {
            currentPage++;
            renderFlights();
        }
    }

    function prevPage(): void {
        if (currentPage > 0) {
            currentPage--;
            renderFlights();
        }
    }

    async function fetchFlights(): Promise<void> {
        try {
            const response = await fetch('json_files/flights.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            flights = await response.json() as Flight[];
            renderFlights();
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
    }

    function init(): void {
        const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', prevPage);
            nextBtn.addEventListener('click', nextPage);
        } else {
            console.error('Navigation buttons not found!');
        }

        fetchFlights();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function () {
    const blogContainer = document.getElementById('flightGrid') as HTMLElement | null;

    if (!blogContainer) {
        console.error('Flight grid container not found!');
        return;
    }

    blogContainer.addEventListener('click', function (event) {
        const target = event.target as HTMLElement;
        const heartButton = target.closest('button') as HTMLElement | null;
        if (heartButton && heartButton.querySelector('img[alt="heart"]')) {
            const heartIcon = heartButton.querySelector<HTMLImageElement>('img')!;
            
            if (heartIcon.src.includes('heart-red.png')) {
                heartIcon.src = 'assets/heart.png';
                heartButton.classList.remove('liked');
            } else {
                heartIcon.src = 'assets/heart-red.png';
                heartButton.classList.add('liked');
            }
        }
    });
})();