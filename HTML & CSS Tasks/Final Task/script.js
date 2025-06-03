const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
    
menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('translate-x-0');
});

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('#tab-navigation button');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove the 'bg-black text-gray-300' classes from all tabs
            tabs.forEach(btn => btn.classList.remove('bg-black', 'text-gray-300'));
            
            // Add the 'bg-black text-gray-300' classes to the clicked tab
            this.classList.add('bg-black', 'text-gray-300');
        });
    });
    
    // Trigger click on the "Tours" tab to set the default active tab
    document.getElementById('tours').click();
});