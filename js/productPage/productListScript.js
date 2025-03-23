import items from './productListItems.js';

// 페이지네이션 생성 함수
function createPagination(items, itemsPerPage) {
    let currentPage = 1; // 현재 페이지
    const totalPages = Math.ceil(items.length / itemsPerPage); // 전체 페이지 수
    const gridWrapper = document.querySelector('.grid-wrapper-inner');
    const paginationContainer = document.querySelector('.pagination-controls');
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    const pageNumbersContainer = document.createElement('div');

    // 화살표 버튼 추가
    prevButton.className = 'prev-button';
    prevButton.innerHTML = '&lt;'; // '<' 화살표
    nextButton.className = 'next-button';
    nextButton.innerHTML = '&gt;'; // '>' 화살표

    pageNumbersContainer.className = 'page-numbers-container';

    paginationContainer.innerHTML = ''; // 기존 내용을 초기화
    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageNumbersContainer);
    paginationContainer.appendChild(nextButton);

    // 특정 페이지의 상품을 렌더링하는 함수
    function renderPage(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, items.length);
        const currentItems = items.slice(startIndex, endIndex);

        // 기존 내용 초기화
        gridWrapper.innerHTML = '';

        // 현재 페이지의 상품 추가
        currentItems.forEach((item) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';

            // 디테일 영역 생성
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'grid-item-details';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'grid-item-info';

            const titleElement = document.createElement('h3');
            titleElement.className = 'grid-item-title';
            titleElement.textContent = item.title;

            const priceElement = document.createElement('p');
            priceElement.className = 'grid-item-price';
            priceElement.textContent = item.price;

            const arrowDiv = document.createElement('div');
            arrowDiv.className = 'grid-item-arrow';

            const arrowIcon = document.createElement('img');
            arrowIcon.src = 'https://raw.githubusercontent.com/hyeonky/dp-static/main/popmart/btnIcon/arrow-right.svg';
            arrowIcon.alt = 'Arrow Icon';
            arrowIcon.className = 'arrow-icon';

            arrowDiv.appendChild(arrowIcon);

            infoDiv.appendChild(titleElement);
            infoDiv.appendChild(priceElement);
            detailsDiv.appendChild(infoDiv);
            detailsDiv.appendChild(arrowDiv);

            // 상품 이미지를 위한 div 추가
            const imgElement = document.createElement('img');
            imgElement.src = item.imgSrc;
            imgElement.alt = item.title;

            // 이미지가 로드되지 않을 때 placeholder 사용
            imgElement.onerror = function () {
                this.src = 'https://via.placeholder.com/150';
                this.onerror = null; // 무한 호출 방지
            };

            // 상품 클릭 시 디테일 페이지로 이동
            gridItem.addEventListener('click', () => {
                window.location.href = `/page/productPage/productDetail.html?id=${item.id}`;
            });

            // DOM 구조에 추가
            gridItem.appendChild(imgElement);
            gridItem.appendChild(detailsDiv);
            gridWrapper.appendChild(gridItem);
        });

        // 페이지 번호 렌더링
        renderPageNumbers();
    }

    // 페이지 번호 버튼 렌더링 함수
    function renderPageNumbers() {
        pageNumbersContainer.innerHTML = ''; // 기존 번호 초기화

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-number';
            pageButton.textContent = i;

            if (i === currentPage) {
                pageButton.classList.add('active'); // 현재 페이지 강조
            }

            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage); // 선택한 페이지 렌더링
            });

            pageNumbersContainer.appendChild(pageButton);
        }
    }

    // 이전/다음 버튼 클릭 이벤트
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });

    renderPage(currentPage); // 첫 페이지 렌더링
}

// 브랜드 추가 표시 기능
function setupAdditionalBrandsToggle() {
    const addCategoryButton = document.querySelector('.add-category');
    const additionalBrands = document.querySelector('.additional-brands');

    if (addCategoryButton && additionalBrands) {
        addCategoryButton.addEventListener('click', () => {
            // toggle 방식으로 숨기거나 표시
            if (additionalBrands.style.display === 'none' || additionalBrands.style.display === '') {
                additionalBrands.style.display = 'flex';
            } else {
                additionalBrands.style.display = 'none';
            }
        });
    }
}

// 브랜드 필터링 기능
function setupCategoryFilter() {
    const categoryLinks = document.querySelectorAll('[data-category]');

    categoryLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 링크 동작 막기
            const selectedCategory = link.getAttribute('data-category'); // 선택된 카테고리

            // 선택된 카테고리에 해당하는 아이템 필터링
            const filteredItems = items.filter((item) => item.category === selectedCategory);

            // 필터링된 결과로 페이지네이션 재생성
            const itemsPerPage = window.innerWidth <= 599 ? 6 : 9; // 화면 크기 따라 조정
            createPagination(filteredItems, itemsPerPage);
        });
    });
}

// 페이지네이션 초기화 함수
function setupPagination() {
    const itemsPerPage = window.innerWidth <= 599 ? 6 : 9; // 모바일은 6개, 데스크탑은 9개
    createPagination(items, itemsPerPage);
}

// DOMContentLoaded 이벤트로 초기화
document.addEventListener('DOMContentLoaded', () => {
    setupPagination(); // 초기 페이지네이션 설정
    setupAdditionalBrandsToggle(); // 추가 브랜드 토글 설정
    setupCategoryFilter(); // 카테고리 필터링 설정
});

// 화면 크기 변경 시 다시 설정
window.addEventListener('resize', setupPagination);
