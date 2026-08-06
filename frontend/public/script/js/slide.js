$(".mn-sldr").slick({
    arrows: false,
    dots: false,
    prevArrow:
      '<span class="prev_button"><i class="fas fa-angle-left"></i></span>',
    nextArrow:
      '<span class="next_button"><i class="fas fa-angle-right"></i></span>',
    infinite: true,
    slidesToShow: 1,
    pauseOnHover: false,
    dragable: true,
    slidesToScroll: 1,
    autoplay: true,
    swipeToSlide: true,
    autoplaySpeed: 1500,
    speed: 1000,
    responsive: [
      {
        breakpoint: 575,
        settings: {
          arrows: false,
          slidesToShow: 1,
        },
      },
    ],
  });
$(".testimoni").slick({
    arrows: false,
    dots: false,
    prevArrow:
      '<span class="prev_button"><i class="fas fa-angle-left"></i></span>',
    nextArrow:
      '<span class="next_button"><i class="fas fa-angle-right"></i></span>',
    infinite: true,
    slidesToShow: 2,
    // pauseOnHover: true,
    dragable: true,
    slidesToScroll: 1,
    autoplay: true,
    swipeToSlide: true,
    autoplaySpeed: 3000,
    speed: 1000,
    responsive: [
      {
        breakpoint: 575,
        settings: {
          arrows: false,
          slidesToShow: 1,
        },
      },
    ],
  });

  $(document).ready(function () {
    $(".abt3-txt ").slick({
      slidesToShow: 1,
      dots: true,
      speed: 1000,
      pauseOnHover: true,
      slidesToScroll: 1,
      autoplaySpeed: 2500,
      autoplay: true,
      swipe: true,
      swipeToSlide: true,
      arrows: false,
      dragable: true,
      focusOnSelect: true,
    });
  });

  $(".ind8-slider").slick({
    arrows: false,
    dots: false,
    prevArrow:
      '<span class="prev_button"><i class="fas fa-angle-left"></i></span>',
    nextArrow:
      '<span class="next_button"><i class="fas fa-angle-right"></i></span>',
    infinite: true,
    slidesToShow: 5,
    pauseOnHover: false,
    dragable: false,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 9000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1390,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        },
      },

      {
        breakpoint: 767,
        settings: {
          arrows: false,
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 400,
        settings: {
          arrows: false,
          slidesToShow: 2,
        },
      },
    ],
  });
