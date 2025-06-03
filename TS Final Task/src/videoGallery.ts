function initializeVideoGallery(): void {
    const videoContainers = document.querySelectorAll<HTMLElement>('.video-container');

    videoContainers.forEach((container: HTMLElement) => {
        const video = container.querySelector<HTMLVideoElement>('video');
        const poster = container.querySelector<HTMLElement>('.video-poster');
        const playButton = container.querySelector<HTMLElement>('.play-button');

        if (!video || !poster || !playButton) {
            console.error('Required elements (video, poster, playButton) not found in container.');
            return;
        }

        // Hide video controls initially
        video.controls = false;

        playButton.addEventListener('click', () => {
            poster.style.display = 'none';
            playButton.style.display = 'none';
            video.controls = true;
            video.play();
        });

        video.addEventListener('play', () => {
            // Pause other videos when one starts playing
            videoContainers.forEach((otherContainer: HTMLElement) => {
                const otherVideo = otherContainer.querySelector<HTMLVideoElement>('video');
                const otherPoster = otherContainer.querySelector<HTMLElement>('.video-poster');
                const otherPlayButton = otherContainer.querySelector<HTMLElement>('.play-button');

                if (!otherVideo || !otherPoster || !otherPlayButton) {
                    console.error('Required elements (video, poster, playButton) not found in another container.');
                    return;
                }

                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                    otherVideo.controls = false;
                    otherPoster.style.display = 'block';
                    otherPlayButton.style.display = 'flex';
                }
            });
        });

        video.addEventListener('pause', () => {
            if (video.currentTime === 0) {
                video.controls = false;
                poster.style.display = 'block';
                playButton.style.display = 'flex';
            }
        });

        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.controls = false;
            poster.style.display = 'block';
            playButton.style.display = 'flex';
        });
    });
}

// Initialize the video gallery when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVideoGallery);