document.addEventListener('DOMContentLoaded', function() {
    // Loading animation
    const loadingOverlay = document.getElementById('loading-overlay');
    window.addEventListener('load', function() {
        loadingOverlay.style.display = 'none';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Image slider
    const sliderContainer = document.querySelector('.slider-container');
    const images = sliderContainer.querySelectorAll('img');
    let currentIndex = 0;

    // Create arrow elements
    const leftArrow = document.createElement('div');
    leftArrow.classList.add('slider-arrow', 'left');
    leftArrow.innerHTML = '&#10094;';
    
    const rightArrow = document.createElement('div');
    rightArrow.classList.add('slider-arrow', 'right');
    rightArrow.innerHTML = '&#10095;';

    // Add arrows to the slider
    const imageSlider = document.querySelector('.image-slider');
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

    // Auto-slide
    let slideInterval = setInterval(showNextImage, 2000);

    // Arrow click events
    rightArrow.addEventListener('click', () => {
        clearInterval(slideInterval);
        showNextImage();
        slideInterval = setInterval(showNextImage, 2000);
    });

    leftArrow.addEventListener('click', () => {
        clearInterval(slideInterval);
        showPrevImage();
        slideInterval = setInterval(showNextImage, 2000);
    });

    // Mouse hover pauses auto-slide
    // imageSlider.addEventListener('mouseenter', () => {
    //     clearInterval(slideInterval);
    // });

    // imageSlider.addEventListener('mouseleave', () => {
    //     slideInterval = setInterval(showNextImage, 5000);
    // });

    // Animate sections on scroll
    const sections = document.querySelectorAll('#about, #events, #team, #contact');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
    const categoryButtons = document.querySelectorAll("#team .btn-category");
    const teamMembers = document.querySelectorAll("#team .team-member");

    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            const category = this.getAttribute("data-category");

            categoryButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            teamMembers.forEach(member => {
                if (member.getAttribute("data-category") === category || category === "All") {
                    member.classList.add("active");
                } else {
                    member.classList.remove("active");
                }
            });
        });
    });

    // Trigger click on the first category to show members by default
    categoryButtons[0].click();
    
    // // Google Maps
    // function initMap() {
    //     const vidyalankar = { lat: 19.0179, lng: 72.8568 }; // Vidyalankar Institute of Technology coordinates
    //     const map = new google.maps.Map(document.getElementById('map'), {
    //         zoom: 15,
    //         center: vidyalankar,
    //     });
    //     const marker = new google.maps.Marker({
    //         position: vidyalankar,
    //         map: map,
    //     });
    // }

    // // Call initMap when the Google Maps API is loaded
    // if (typeof google !== 'undefined') {
    //     google.maps.event.addDomListener(window, 'load', initMap);
    // }
    document.addEventListener('DOMContentLoaded', function() {
        var video = document.getElementById('about-video');
    
        // Reset video to the start and pause it initially
        video.currentTime = 0;
        video.pause();
    
        // Play the video once it is scrolled into view
        function playVideoOnScroll() {
            var rect = video.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                video.play();
            }
        }
        const insta= document.querySelector('.video-container').addEventListener('click',{
            
        })
        
            
    
        window.addEventListener('scroll', playVideoOnScroll);
        window.addEventListener('load', playVideoOnScroll); // Play if already in view on load
    });
    document.getElementById("navbar-brand").addEventListener("mouseenter", function() {
        const slidingText = document.getElementById("slidingText");
        slidingText.style.maxWidth = "400px"; // Adjust based on the length of the text
        slidingText.style.opacity = "1";
    });
    
    document.getElementById("navbar-brand").addEventListener("mouseleave", function() {
        const slidingText = document.getElementById("slidingText");
        slidingText.style.maxWidth = "0";
        slidingText.style.opacity = "0";
    });
});
