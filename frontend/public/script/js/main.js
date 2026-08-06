// ==========================================
// MAIN.JS - Vanilla JS (No GSAP dependency)
// ==========================================

// Slick Carousel - main hero slider
$(document).ready(function() {
    if ($('.mn-sldr').length) {
        $('.mn-sldr').slick({
            autoplay: true,
            autoplaySpeed: 3000,
            arrows: false,
            dots: false,
            fade: true,
            cssEase: 'linear'
        });
    }

    // Glimpses gallery slider
    if ($('.ind8-slider').length) {
        $('.ind8-slider').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: false,
            dots: false,
            responsive: [
                {
                    breakpoint: 768,
                    settings: { slidesToShow: 1 }
                },
                {
                    breakpoint: 1024,
                    settings: { slidesToShow: 2 }
                }
            ]
        });
    }

    // AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({ once: true, duration: 1000 });
    }
});

// ==========================================
// RADIAL CHART - IntersectionObserver
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const charts = document.querySelectorAll(".chart");
    if (!charts.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const value = parseInt(el.dataset.value, 10);

                let chartColor = "#e7a001";

                const options = {
                    chart: { width: "100%", type: "radialBar" },
                    series: [value],
                    colors: [chartColor],
                    stroke: { lineCap: "round" },
                    plotOptions: {
                        radialBar: {
                            hollow: { size: "55%" },
                            track: { background: "#e2e2e2ff" },
                            dataLabels: {
                                name: { show: true, offsetY: 20, color: "#888", fontSize: "16px" },
                                value: { show: true, fontSize: "25px", fontWeight: "bold", color: "#000000ff", offsetY: -10 }
                            }
                        }
                    },
                    labels: [""]
                };

                if (typeof ApexCharts !== 'undefined') {
                    new ApexCharts(el, options).render();
                }
                observer.unobserve(el);
            }
        });
    }, { root: null, rootMargin: "0px 0px -20% 0px", threshold: 0 });

    charts.forEach(chart => observer.observe(chart));
});

// ==========================================
// PROGRESS BARS - IntersectionObserver
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const bars = document.querySelectorAll(".progress-bar");
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const value = el.getAttribute("aria-valuenow");
                el.style.width = value + "%";
                observer.unobserve(el);
            }
        });
    }, { root: null, rootMargin: "0px 0px -20% 0px", threshold: 0 });

    bars.forEach(bar => observer.observe(bar));
});

// ==========================================
// STICKY HEADER on scroll
// ==========================================
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});
