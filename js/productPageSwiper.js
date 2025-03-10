// 스와이퍼 초기화 함수
function initSwiper() {
    // 기존 스와이퍼가 있으면 제거
    if (window.productSwiper) {
        window.productSwiper.destroy();
    }

    // 새 스와이퍼 생성
    window.productSwiper = new Swiper('.grid-container', {
        wrapperClass: 'grid-wrapper-inner',
        slideClass: 'grid-page',
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        speed: 600,
        spaceBetween: 30,
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
    });
}

export { initSwiper };
