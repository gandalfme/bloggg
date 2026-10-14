/**
 * Presentation Controller
 * Handles slide navigation with keyboard, touch/swipe, and button controls.
 */
(function () {
  'use strict';

  // ── DOM Elements ──
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressFill = document.getElementById('progressFill');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const dotContainer = document.getElementById('dotIndicators');

  // ── State ──
  let currentIndex = 0;
  const totalSlides = slides.length;
  let isAnimating = false;
  const ANIMATION_DURATION = 600; // ms, matches CSS transition

  // ── Initialize ──
  function init() {
    totalSlidesEl.textContent = totalSlides;
    createDots();
    updateUI();
    bindEvents();
    initVideoOverlays();
  }

  // ── Create dot indicators ──
  function createDots() {
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotContainer.appendChild(dot);
    }
  }

  // ── Navigation ──
  function goToSlide(index, direction) {
    if (isAnimating || index === currentIndex || index < 0 || index >= totalSlides) return;

    isAnimating = true;

    const prevSlide = slides[currentIndex];
    const nextSlide = slides[index];

    // Determine direction
    const goingForward = direction !== undefined ? direction === 'next' : index > currentIndex;

    // Pause video if leaving a video slide
    pauseSlideVideo(prevSlide);

    // Exit current slide
    prevSlide.classList.remove('active');
    if (goingForward) {
      prevSlide.classList.add('exit-left');
    }

    // Prepare next slide entry
    nextSlide.style.transition = 'none';
    nextSlide.style.transform = goingForward ? 'translateX(60px)' : 'translateX(-60px)';
    nextSlide.style.opacity = '0';

    // Force reflow
    nextSlide.offsetHeight;

    // Animate next slide in
    nextSlide.style.transition = '';
    nextSlide.classList.add('active');
    nextSlide.classList.remove('exit-left');
    nextSlide.style.transform = '';
    nextSlide.style.opacity = '';

    currentIndex = index;
    updateUI();

    setTimeout(() => {
      prevSlide.classList.remove('exit-left');
      prevSlide.style.transform = '';
      isAnimating = false;
    }, ANIMATION_DURATION);
  }

  // ── Video helpers ──
  function pauseSlideVideo(slide) {
    const video = slide.querySelector('.slide-video');
    if (video && !video.paused) {
      video.pause();
    }
  }

  function initVideoOverlays() {
    document.querySelectorAll('.slide-video-container').forEach((container) => {
      const video = container.querySelector('.slide-video');
      const overlay = container.querySelector('.video-play-overlay');
      if (!video || !overlay) return;

      overlay.addEventListener('click', () => {
        video.play();
        overlay.classList.add('hidden');
      });

      video.addEventListener('pause', () => {
        overlay.classList.remove('hidden');
      });

      video.addEventListener('ended', () => {
        overlay.classList.remove('hidden');
      });

      video.addEventListener('play', () => {
        overlay.classList.add('hidden');
      });
    });
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1, 'next');
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1, 'prev');
    }
  }

  // ── Update UI ──
  function updateUI() {
    // Counter
    currentSlideEl.textContent = currentIndex + 1;

    // Progress bar
    const progress = ((currentIndex + 1) / totalSlides) * 100;
    progressFill.style.width = `${progress}%`;

    // Buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    // Dots
    const dots = dotContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // ── Event Binding ──
  function bindEvents() {
    // Button clicks
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      }
    });

    // Touch / Swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const MIN_SWIPE_DISTANCE = 50;

    const presentation = document.getElementById('presentation');

    presentation.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    presentation.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
        if (deltaX < 0) {
          nextSlide(); // Swipe left → next
        } else {
          prevSlide(); // Swipe right → prev
        }
      }
    }
  }

  // ── Start ──
  init();
})();
