document.addEventListener("DOMContentLoaded", function () {
  const loadingOverlay = document.getElementById("loading-overlay");
  window.addEventListener("load", function () {
    loadingOverlay.style.display = "none";
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  const sliderContainer = document.querySelector(".slider-container");
  const images = sliderContainer.querySelectorAll("img");
  let currentIndex = 0;

  const leftArrow = document.createElement("div");
  leftArrow.classList.add("slider-arrow", "left");
  leftArrow.innerHTML = "❮";

  const rightArrow = document.createElement("div");
  rightArrow.classList.add("slider-arrow", "right");
  rightArrow.innerHTML = "❯";

  const imageSlider = document.querySelector(".image-slider");
  imageSlider.appendChild(leftArrow);
  imageSlider.appendChild(rightArrow);

  function showImage(index) {
    sliderContainer.style.transform = `translateX(-${index * 100}%)`;
  }

  function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function showPrevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  let slideInterval = setInterval(showNextImage, 3000);

  rightArrow.addEventListener("click", () => {
    clearInterval(slideInterval);
    showNextImage();
    slideInterval = setInterval(showNextImage, 3000);
  });

  leftArrow.addEventListener("click", () => {
    clearInterval(slideInterval);
    showPrevImage();
    slideInterval = setInterval(showNextImage, 3000);
  });

  const sections = document.querySelectorAll(
    "#about, #events-glimpse, #events, #team, #contact"
  );
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  sections.forEach((section) => {
    observer.observe(section);
  });

  const categoryButtons = document.querySelectorAll("#team .btn-category");
  const teamMembers = document.querySelectorAll("#team .team-member");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      teamMembers.forEach((member) => {
        if (member.getAttribute("data-category") === category) {
          member.classList.add("active");
        } else {
          member.classList.remove("active");
        }
      });
    });
  });

  categoryButtons[0].click();

  document
    .getElementById("navbar-brand")
    .addEventListener("mouseenter", function () {
      const slidingText = document.getElementById("slidingText");
      slidingText.style.maxWidth = "400px";
      slidingText.style.opacity = "1";
    });

  document
    .getElementById("navbar-brand")
    .addEventListener("mouseleave", function () {
      const slidingText = document.getElementById("slidingText");
      slidingText.style.maxWidth = "0";
      slidingText.style.opacity = "0";
    });

  // Event Carousel Functionality
  function initializeEventCarousels() {
    const carousels = document.querySelectorAll(".event-carousel");
    
    carousels.forEach((carousel) => {
      const container = carousel.querySelector(".event-carousel-container");
      const items = container.querySelectorAll(".event-carousel-item");
      const leftArrow = carousel.querySelector(".event-carousel-arrow-left");
      const rightArrow = carousel.querySelector(".event-carousel-arrow-right");
      const indicatorsContainer = carousel.querySelector(".event-carousel-indicators");
      
      if (items.length === 0) return;
      
      let currentIndex = 0;
      
      // Create indicators
      items.forEach((_, index) => {
        const indicator = document.createElement("div");
        indicator.classList.add("event-carousel-indicator");
        if (index === 0) indicator.classList.add("active");
        indicator.addEventListener("click", () => {
          currentIndex = index;
          updateCarousel();
        });
        indicatorsContainer.appendChild(indicator);
      });
      
      // Hide arrows if only one item
      if (items.length <= 1) {
        if (leftArrow) leftArrow.style.display = "none";
        if (rightArrow) rightArrow.style.display = "none";
        if (indicatorsContainer) indicatorsContainer.style.display = "none";
        return;
      }
      
      function updateCarousel() {
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update indicators
        const indicators = indicatorsContainer.querySelectorAll(".event-carousel-indicator");
        indicators.forEach((indicator, index) => {
          if (index === currentIndex) {
            indicator.classList.add("active");
          } else {
            indicator.classList.remove("active");
          }
        });
      }
      
      function showNext() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
      }
      
      function showPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
      }
      
      if (leftArrow) {
        leftArrow.addEventListener("click", () => {
          clearInterval(carousel.slideInterval);
          showPrev();
          startAutoSlide();
        });
      }
      
      if (rightArrow) {
        rightArrow.addEventListener("click", () => {
          clearInterval(carousel.slideInterval);
          showNext();
          startAutoSlide();
        });
      }
      
      function startAutoSlide() {
        if (items.length > 1) {
          carousel.slideInterval = setInterval(showNext, 6000);
        }
      }
      
      // Pause on hover
      carousel.addEventListener("mouseenter", () => {
        if (carousel.slideInterval) {
          clearInterval(carousel.slideInterval);
        }
      });
      
      carousel.addEventListener("mouseleave", () => {
        startAutoSlide();
      });
      
      // Start auto-slide
      startAutoSlide();
    });
  }
  
  // Initialize carousels when DOM is ready
  initializeEventCarousels();
  
  // Re-initialize if new carousels are added dynamically
  const eventsGlimpseSection = document.getElementById("events-glimpse");
  if (eventsGlimpseSection) {
    const observer = new MutationObserver(() => {
      initializeEventCarousels();
    });
    observer.observe(eventsGlimpseSection, { childList: true, subtree: true });
  }
});
