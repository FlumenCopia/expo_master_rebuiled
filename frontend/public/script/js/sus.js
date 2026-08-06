// scroll smooth and button magnit fr mobile==============================


const lenis = new Lenis();

function raf(e) {
    lenis.raf(e), requestAnimationFrame(raf);
}
lenis.on("scroll", (e) => {}), requestAnimationFrame(raf);

var magnets = document.querySelectorAll(".magnetic"),
    strength = 50;

function moveMagnet(e) {
    var t = e.currentTarget,
        n = t.getBoundingClientRect();
    TweenMax.to(t, 1, {
        x: ((e.clientX - n.left) / t.offsetWidth - 0.5) * strength,
        y: ((e.clientY - n.top) / t.offsetHeight - 0.5) * strength,
        ease: Power4.easeOut,
    });
}

function addMagnetEvents() {
    magnets.forEach((e) => {
        e.addEventListener("mousemove", moveMagnet);
        e.addEventListener("mouseout", resetMagnet);
    });
}

function removeMagnetEvents() {
    magnets.forEach((e) => {
        e.removeEventListener("mousemove", moveMagnet);
        e.removeEventListener("mouseout", resetMagnet);
    });
}

function resetMagnet(e) {
    TweenMax.to(e.currentTarget, 1, {
        x: 0,
        y: 0,
        ease: Power4.easeOut
    });
}

function checkViewport() {
    if (window.innerWidth <= 992) {
        removeMagnetEvents();
    } else {
        addMagnetEvents();
    }
}
window.addEventListener('resize', checkViewport);
window.addEventListener('load', checkViewport);


// scroll smooth and button magnit fr mobile close=========================


// scroll slow or speed control============================================

gsap.to(".pContent", {
    yPercent: -100,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),
  gsap.to(".prjContent", {
    yPercent: -12,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),
  gsap.to(".slow1", {
    yPercent: 100,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),
  gsap.to(".slow", {
    yPercent: 50,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),
  gsap.to(".slow2", {
    yPercent: -50,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),
  gsap.to(".slow3", {
    yPercent: -150,
    ease: "none",
    scrollTrigger: { trigger: ".Section", scrub: !0 },
  }),

gsap.registerPlugin(ScrollTrigger);

let mask = document.querySelectorAll(".msk");

mask.forEach((e) => {
  let t = e.querySelector("img"),
    n = gsap.timeline({
      scrollTrigger: {
        trigger: e,
        start: "center center", // Animation starts when the element reaches the center of the viewport
        end: "center center",   // End point to retain consistent behavior
        toggleActions: "restart none none reset",
        once: true, // Play the animation only once
      },
    });

  n.set(e, { autoAlpha: 1 });
  n.from(e, 1.5, { yPercent: -100, ease: Power2.out });
  n.from(t, 1.5, {
    yPercent: 100,
    scale: 1.3,
    delay: -1.5,
    ease: Power2.out,
  });
});





// back to top button=========================================================

let mybutton = document.getElementById("tp-Btn");

window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
    mybutton.style.opacity = "1";
  } else {
    mybutton.style.opacity = "0";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// back to top button  close==================================================




$(document).ready(function () {
  // variables
  var hamburger = $(".hamburger-init"),
    menu_wrapper = $(".nv-menu-wrapper"),
    menu = $(".mb-menu"),
    item_with_children = $(".menu-item-has-children");

  // logic
  hamburger.on("click", function () {
    $(".nv-container").toggleClass("hamburger-guide");
    $(this).toggleClass("active");
    menu_wrapper.toggleClass("visible");
    menu.toggleClass("menu-active");
  });

  item_with_children.on("click", function () {
    $(this).toggleClass("sub-menu-active");
    $(this).children(".mb-menu").slideToggle();
  });
});
