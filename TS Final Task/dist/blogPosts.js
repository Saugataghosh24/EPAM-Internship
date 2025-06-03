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
let allPosts = [];
let displayedPosts = 3;
const postsPerPage = 3;
let likedPosts = new Set(); // Using Set to store liked post IDs
function initializeBlogPosts() {
    fetchBlogPosts();
    setupViewMoreButton();
    initializeHeartButtons();
    initializeCardFlipping();
}
function fetchBlogPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('json_files/blogPosts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPosts = (yield response.json()); // Explicitly type as BlogPost[]
            renderBlogPosts();
        }
        catch (error) {
            console.error('Error fetching blog posts:', error);
        }
    });
}
function renderBlogPosts() {
    const blogContainer = document.getElementById('blog-posts-container');
    if (!blogContainer) {
        console.error('Blog posts container not found');
        return;
    }
    blogContainer.innerHTML = '';
    const postsToDisplay = allPosts.slice(0, displayedPosts);
    postsToDisplay.forEach((post) => {
        const articleHTML = createBlogPostHTML(post);
        blogContainer.innerHTML += articleHTML;
    });
    updateViewMoreButton();
}
function createBlogPostHTML(post) {
    const isLiked = likedPosts.has(post.id.toString());
    const heartIconSrc = isLiked ? 'assets/heart-red.png' : 'assets/heart.png';
    const likedClass = isLiked ? 'liked' : '';
    return `
        <article class="blog-card bg-white shadow-lg rounded-xl overflow-hidden hover-effect">
            <div class="card-inner">
                <div class="card-front">
                    <figure class="relative">
                        <img src="${post.image}" alt="Blog Image" class="w-full h-48 object-cover">
                        <figcaption class="absolute top-3 left-3 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
                            ${post.category}
                        </figcaption>
                        <button class="heart-button absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md ${likedClass}" data-post-id="${post.id}">
                            <img src="${heartIconSrc}" alt="heart" class="h-3">
                        </button>
                    </figure>
                    <div class="p-5">
                        <p class="text-gray-500 text-xs flex space-x-3">
                            <span>📅 ${post.date}</span>
                            <span>⏱️ ${post.readTime}</span>
                            <span>💬 ${post.comments} comments</span>
                        </p>
                        <h3 class="text-lg font-semibold mt-2">
                            <a href="#">${post.title}</a>
                        </h3>
                        <footer class="flex items-center justify-between mt-6">
                            <div class="flex items-center space-x-2">
                                <img src="${post.authorAvatar}" alt="avatar" class="w-6 h-6 rounded-full">
                                <span class="text-sm text-gray-900">${post.author}</span>
                            </div>
                            <button class="keep-reading-btn text-sm font-semibold bg-gray-200 px-4 py-2 rounded-full btn-hover">Keep Reading</button>
                        </footer>
                    </div>
                </div>
                <div class="card-back p-5">
                    <h3 class="text-lg font-semibold mb-3">${post.title}</h3>
                    <p class="text-sm text-gray-600 mb-4">${post.content}</p>
                    <button class="back-to-front-btn text-sm font-semibold bg-gray-200 px-4 py-2 rounded-full btn-hover">Back</button>
                </div>
            </div>
        </article>
    `;
}
function setupViewMoreButton() {
    const viewMoreButton = document.getElementById('view-more-btn');
    if (viewMoreButton) {
        viewMoreButton.addEventListener('click', loadMorePosts);
    }
    else {
        console.error('View More button not found');
    }
}
function loadMorePosts(event) {
    event.preventDefault();
    displayedPosts += postsPerPage;
    if (displayedPosts > allPosts.length) {
        displayedPosts = allPosts.length;
    }
    renderBlogPosts();
}
function updateViewMoreButton() {
    const viewMoreButton = document.getElementById('view-more-btn');
    if (viewMoreButton) {
        if (displayedPosts >= allPosts.length) {
            viewMoreButton.style.display = 'none';
        }
        else {
            viewMoreButton.style.display = 'flex';
        }
    }
}
function initializeHeartButtons() {
    const blogContainer = document.getElementById('blog-posts-container');
    if (!blogContainer) {
        console.error('Blog posts container not found');
        return;
    }
    blogContainer.addEventListener('click', function (event) {
        const target = event.target;
        const heartButton = target.closest('button');
        if (heartButton && heartButton.querySelector('img[alt="heart"]')) {
            const postId = heartButton.dataset.postId;
            if (postId)
                toggleHeartState(heartButton, postId);
        }
    });
}
function toggleHeartState(heartButton, postId) {
    const heartIcon = heartButton.querySelector('img');
    if (likedPosts.has(postId)) {
        likedPosts.delete(postId);
        heartIcon.src = 'assets/heart.png';
        heartButton.classList.remove('liked');
    }
    else {
        likedPosts.add(postId);
        heartIcon.src = 'assets/heart-red.png';
        heartButton.classList.add('liked');
    }
}
function initializeCardFlipping() {
    const blogContainer = document.getElementById('blog-posts-container');
    if (!blogContainer) {
        console.error('Blog posts container not found');
        return;
    }
    blogContainer.addEventListener('click', function (event) {
        const target = event.target;
        const keepReadingBtn = target.closest('.keep-reading-btn');
        const backToFrontBtn = target.closest('.back-to-front-btn');
        if (keepReadingBtn) {
            const card = keepReadingBtn.closest('.blog-card');
            if (card)
                card.classList.add('flipped');
        }
        else if (backToFrontBtn) {
            const card = backToFrontBtn.closest('.blog-card');
            if (card)
                card.classList.remove('flipped');
        }
    });
}
// Initialize the blog posts when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBlogPosts);
