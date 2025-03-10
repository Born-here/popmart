import items from './productPageItems.js';
import { initSwiper } from './productPageSwiper.js';

document.addEventListener('DOMContentLoaded', function () {
    // 그리드 컨테이너 가져오기
    const gridContainer = document.querySelector('.grid-container');
    const itemsPerPage = 9; // 페이지당 아이템 수
    const totalPages = Math.ceil(items.length / itemsPerPage);

    // 기존 내용 지우기 (서클 요소 제외)
    const circleElement = document.getElementById('circle');
    gridContainer.innerHTML = '';

    // 스와이퍼 구조 생성
    gridContainer.classList.add('swiper');

    // 페이지네이션과 네비게이션 버튼 추가
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'swiper-pagination';

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';

    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';

    // 스와이퍼 래퍼 생성
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'grid-wrapper-inner swiper-wrapper';

    // 각 페이지에 아이템 추가
    for (let page = 0; page < totalPages; page++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'grid-page swiper-slide';

        // 현재 페이지의 아이템 인덱스 계산
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, items.length);

        // 페이지에 아이템 추가
        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i];
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';

            gridItem.innerHTML = `
        <img src="${item.imgSrc}" alt="${item.title}" />
        <div>
          <h3>${item.title}</h3>
          <p>${item.price}</p>
        </div>
      `;

            // 그리드 아이템에 이벤트 리스너 추가
            gridItem.addEventListener('mouseenter', handleItemHover);
            gridItem.addEventListener('mouseleave', handleItemLeave);

            pageDiv.appendChild(gridItem);
        }

        wrapperDiv.appendChild(pageDiv);
    }

    // 스와이퍼 구조에 요소 추가
    gridContainer.appendChild(wrapperDiv);
    gridContainer.appendChild(paginationDiv);
    gridContainer.appendChild(nextButton);
    gridContainer.appendChild(prevButton);

    // 서클 요소 다시 추가
    if (circleElement) {
        gridContainer.appendChild(circleElement);
    } else {
        // 서클 요소가 없었다면 새로 생성
        const circle = document.createElement('div');
        circle.id = 'circle';
        circle.className = 'circle';
        gridContainer.appendChild(circle);
    }

    // 스와이퍼 초기화
    initSwiper();

    // 마우스 효과 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove);
});

// 마우스 움직임 핸들러
function handleMouseMove(e) {
    const circle = document.getElementById('circle');
    if (circle) {
        circle.style.left = e.clientX + 'px';
        circle.style.top = e.clientY + 'px';
    }
}

// 아이템 호버 핸들러
function handleItemHover(e) {
    const circle = document.getElementById('circle');
    if (circle) {
        circle.classList.add('hovered');
        circle.style.opacity = '1';
    }
}

// 아이템 호버 해제 핸들러
function handleItemLeave(e) {
    const circle = document.getElementById('circle');
    if (circle) {
        circle.classList.remove('hovered');
        circle.style.opacity = '0';
    }
}
