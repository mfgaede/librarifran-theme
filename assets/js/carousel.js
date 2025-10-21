// Favorites carousel functionality
(function() {
  'use strict';

  // Initialize all carousels on the page
  function initCarousels() {
    const carousels = document.querySelectorAll('.favorites-carousel');

    carousels.forEach(carousel => {
      const items = carousel.querySelectorAll('.carousel-item');
      const prevButton = carousel.querySelector('.carousel-prev');
      const nextButton = carousel.querySelector('.carousel-next');
      const currentIndexSpan = carousel.querySelector('.current-index');

      if (items.length === 0) return;

      let currentIndex = 0;
      const totalItems = items.length;

      // Update the display
      function updateCarousel() {
        // Hide all items
        items.forEach(item => {
          item.classList.remove('active');
        });

        // Show current item
        items[currentIndex].classList.add('active');

        // Lazy load YouTube iframe for current item
        const currentItem = items[currentIndex];
        const iframe = currentItem.querySelector('iframe[data-src]');
        if (iframe) {
          iframe.src = iframe.getAttribute('data-src');
          iframe.removeAttribute('data-src');
        }

        // Update counter
        if (currentIndexSpan) {
          currentIndexSpan.textContent = currentIndex + 1;
        }

        // Update button states and labels for looping
        updateButtonStates();
      }

      // Update button states and labels to show looping behavior
      function updateButtonStates() {
        if (prevButton) {
          const isAtStart = currentIndex === 0;
          // Disable previous button at start (no loop indicator)
          prevButton.disabled = isAtStart;
          prevButton.classList.remove('loops-around');
          prevButton.setAttribute('aria-label', 'Previous');
          prevButton.setAttribute('title', 'Previous');
        }

        if (nextButton) {
          const isAtEnd = currentIndex === totalItems - 1;
          // Show loop indicator on next button at end
          nextButton.classList.toggle('loops-around', isAtEnd);

          if (isAtEnd) {
            nextButton.setAttribute('aria-label', 'Next (loops to 1)');
            nextButton.setAttribute('title', 'Back to 1');
          } else {
            nextButton.setAttribute('aria-label', 'Next');
            nextButton.setAttribute('title', 'Next');
          }
        }
      }

      // Navigate to previous item (with looping)
      function showPrevious() {
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = totalItems - 1; // Loop to end
        }
        updateCarousel();
      }

      // Navigate to next item (with looping)
      function showNext() {
        if (currentIndex < totalItems - 1) {
          currentIndex++;
        } else {
          currentIndex = 0; // Loop to beginning
        }
        updateCarousel();
      }

      // Event listeners
      if (prevButton) {
        prevButton.addEventListener('click', showPrevious);
      }
      if (nextButton) {
        nextButton.addEventListener('click', showNext);
      }

      // Keyboard navigation
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          showPrevious();
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          showNext();
          e.preventDefault();
        }
      });

      // Initialize
      updateCarousel();
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
})();
