import productDetailItem from './productDetailItem.js';
import { initializeProductSwipers } from './productDetailSwiper.js';

// 제품 슬라이더 업데이트 함수
function updateProductSlider() {
    const swiperWrapper = document.querySelector('.product-slider .swiper-wrapper');
    swiperWrapper.innerHTML = ''; // 기존 내용 초기화

    // URL 파라미터로 상품 ID 받아오기
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    // 해당 상품 정보 찾기
    const product = productDetailItem.find((item) => item.id === productId);

    if (product) {
        const allImages = [...product.mainImages]; // 기존 5개의 이미지
        const additionalImages = [...product.mainImages]; // 추가로 동일한 ID의 이미지를 2개 더 추가

        // 8개의 이미지를 배열에 넣기
        const totalImages = [...allImages, ...additionalImages].slice(0, 7); // 최대 7개만

        totalImages.forEach((imgSrc) => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `상품 이미지`;

            slide.appendChild(img);
            swiperWrapper.appendChild(slide);
        });

        // 모든 이미지가 로드되면 Swiper 초기화
        const images = swiperWrapper.querySelectorAll('img');
        let loadedImagesCount = 0;

        images.forEach((image) => {
            image.onload = () => {
                loadedImagesCount++;
                if (loadedImagesCount === images.length) {
                    // 모든 이미지가 로드되었을 때 Swiper 초기화
                    initializeProductSwipers();
                }
            };
        });
    }
}

// 상품 정보 업데이트 함수
function updateProductInfo(productId) {
    const product = productDetailItem.find((item) => item.id === productId);

    if (product) {
        document.querySelector('.product-info h2').textContent = product.title;
        document.querySelector('.product-info .price').textContent = product.price;

        const cardTitle = document.querySelector('.product-card .product-title');
        if (cardTitle) cardTitle.textContent = product.title;

        const cardPrice = document.querySelector('.product-card .product-price');
        if (cardPrice) cardPrice.textContent = product.price;

        const detailImgContainer = document.querySelector('.product-detail-section .detail-img');
        detailImgContainer.innerHTML = '';

        product.detailImages.forEach((imgSrc) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${product.title} 상세 이미지`;
            detailImgContainer.appendChild(img);
        });

        const infoTable = document.querySelector('.product-info-section table');
        let tableHTML = '';
        for (const [key, value] of Object.entries(product.information)) {
            tableHTML += `
                <tr>
                    <th>${key}</th>
                    <td>${value}</td>
                </tr>
            `;
        }
        infoTable.innerHTML = tableHTML;
    } else {
        console.error('상품 정보 업데이트 실패: 상품을 찾을 수 없습니다.');
    }
}

// 관련 상품 업데이트 함수
function updateRelatedProducts() {
    const swiperWrapper = document.querySelector('.related-products-section .swiper-wrapper');
    swiperWrapper.innerHTML = '';

    const selectedProducts = new Set();
    for (let i = 0; i < 4; i++) {
        let randomProduct;
        do {
            const randomIndex = Math.floor(Math.random() * productDetailItem.length);
            randomProduct = productDetailItem[randomIndex];
        } while (selectedProducts.has(randomProduct.id));

        selectedProducts.add(randomProduct.id);

        const swiperSlide = document.createElement('div');
        swiperSlide.classList.add('swiper-slide');

        const imageIndex = [0, 2, 4][i % 3];
        if (randomProduct.mainImages[imageIndex]) {
            swiperSlide.innerHTML = `
                <img src="${randomProduct.mainImages[imageIndex]}" alt="${randomProduct.title}" />
                <h3>${randomProduct.title}</h3>
                <p>${randomProduct.price}</p>
            `;
            swiperWrapper.appendChild(swiperSlide);
        } else {
            console.error(`mainImages[${imageIndex}] does not exist for product ID: ${randomProduct.id}`);
        }
    }
}

// 스크롤 이벤트에 따른 동작 설정
function setupScrollEvents() {
    const productCard = document.querySelector('.product-card');
    const toggleBtn = document.querySelector('.toggle-btn');
    const productInfo = document.querySelector('.product-info');

    const cardThreshold = 300;
    const toggleThreshold = 600; // toggle-btn 표시 기준 추가

    // 초기 상태에서 product-card 숨기기
    if (productCard) {
        productCard.style.display = 'none';
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const cartBtn = document.querySelector('.cart-btn');

        const displayStyle = scrollY > toggleThreshold ? 'block' : 'none';
        if (cartBtn) cartBtn.style.display = displayStyle;

        // toggle-btn 표시/숨김
        if (toggleBtn) {
            toggleBtn.style.display = displayStyle;

            // toggle-btn 나타날 때 product-card 숨기기
            if (scrollY > toggleThreshold && productCard.style.display !== 'block') {
                productCard.style.display = 'none'; // 자동으로 숨김
                productCard.classList.remove('visible');
            }
        }

        // 스크롤 맨 위로 올라갔을 때 product-card 숨기기
        if (scrollY === 0 && productCard.style.display === 'block') {
            gsap.to(productCard, {
                y: -50,
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    productCard.style.display = 'none';
                },
            });
        }

        // product-info 표시/숨김
        if (scrollY > cardThreshold) {
            productInfo.style.opacity = '0';
            productInfo.style.pointerEvents = 'none';
        } else {
            productInfo.style.opacity = '1';
            productInfo.style.pointerEvents = 'auto';
        }
    });

    // toggle-btn 클릭 시 product-card 동작
    if (toggleBtn && productCard) {
        toggleBtn.addEventListener('click', () => {
            if (productCard.style.display === 'block') {
                gsap.to(productCard, {
                    y: 50,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        productCard.style.display = 'none';
                    },
                });
            } else {
                productCard.style.display = 'block';
                gsap.fromTo(productCard, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
                setupQuantityEvents(); // 버튼 이벤트 다시 연결
            }
        });
    }
}

// 수량 버튼 이벤트 연결 함수
function setupQuantityEvents() {
    const buttons = [
        { selector: '.product-card .minus', action: 'decrement', target: '.product-card .quantity-control span' },
        { selector: '.product-card .plus', action: 'increment', target: '.product-card .quantity-control span' },
        { selector: '.product-info .minus', action: 'decrement', target: '.product-info .quantity-control span' },
        { selector: '.product-info .plus', action: 'increment', target: '.product-info .quantity-control span' },
    ];

    buttons.forEach(({ selector, action, target }) => {
        const btn = document.querySelector(selector);
        const quantitySpan = document.querySelector(target);

        if (btn && quantitySpan) {
            // 중복 이벤트 리스너 제거
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.querySelector(selector);

            // 새로운 이벤트 리스너 등록
            newBtn.addEventListener('click', () => {
                let quantity = parseInt(quantitySpan.textContent, 10);
                if (action === 'decrement' && quantity > 1) {
                    quantitySpan.textContent = quantity - 1; // 수량 감소
                } else if (action === 'increment') {
                    quantitySpan.textContent = quantity + 1; // 수량 증가
                }
            });
        }
    });
}

// 버튼 및 UI 이벤트 설정
function setupUIEvents() {
    // const topBtn = document.querySelector('.top-btn');
    // if (topBtn) {
    //     topBtn.addEventListener('click', () => {
    //         window.scrollTo({ top: 0, behavior: 'smooth' });
    //     });
    // }

    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            alert('장바구니에 추가되었습니다!');
        });
    }

    // 수량 버튼 이벤트 설정
    setupQuantityEvents();

    const downBtn = document.querySelector('.down-btn-wrapper');
    const targetSection = document.querySelector('.product-detail-section');
    if (downBtn && targetSection) {
        downBtn.addEventListener('click', () => {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const downBtnWrapper = document.querySelector('.down-btn-wrapper');

    // 클릭 시 애니메이션 중지/재시작
    downBtnWrapper.addEventListener('click', () => {
        if (downBtnWrapper.style.animation) {
            downBtnWrapper.style.animation = ''; // 애니메이션 중지
        } else {
            downBtnWrapper.style.animation = 'bounce 1.5s infinite ease-in-out'; // 애니메이션 재시작
        }
    });
}

// 페이지 초기화 함수
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (productId && !isNaN(productId)) {
        updateProductInfo(productId);
        updateProductSlider(productId);
        updateRelatedProducts();
        setupScrollEvents();
        setupUIEvents();
    } else {
        console.error('유효한 상품 ID가 아닙니다.');
    }
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', initializePage);
