// 페이지가 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
    // 전역 변수 및 요소
    const cartItems = document.querySelectorAll('.cart-item');
    const selectedItemsContainer = document.querySelector('.selected-items');
    const selectedThumbnails = document.querySelector('.selected-thumbnails');
    const orderSummary = document.querySelector('.order-summary');
    const selectAllCheckbox = document.getElementById('select-all');
    const topButton = document.getElementById('top-button');

    // 디바이스 정보
    const device = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth <= 1024 && window.innerWidth > 768,
        isDesktop: window.innerWidth > 1024,
    };

    // 초기화 함수들 실행
    initCart();
    setupEventListeners();

    /**
     * 장바구니 초기화
     */
    /**
     * 장바구니 초기화
     */
    function initCart() {
        // 체크박스 레이블 스타일 먼저 초기화
        const labels = document.querySelectorAll('.checkbox-label');
        labels.forEach((label) => {
            label.style.display = 'inline-block';
            label.style.width = 'auto';
            label.style.height = 'auto';
            label.style.marginBottom = '-100px';
            label.style.padding = '0';

            // SVG 요소만 클릭 가능하도록 설정
            const svgs = label.querySelectorAll('svg');
            svgs.forEach((svg) => {
                svg.style.display = 'inline-block';
                svg.style.pointerEvents = 'auto';
            });

            // #select-all-text는 제외하고 나머지 텍스트 노드는 감춤
            if (!label.querySelector('#select-all-text')) {
                Array.from(label.childNodes).forEach((node) => {
                    if (node.nodeType === 3) {
                        // 텍스트 노드
                        node.textContent = '';
                    }
                });
            }
        });

        // 그 다음 체크박스 숨기기
        hideCheckboxes();

        // 체크박스 초기 상태 설정
        updateCheckboxStatus();

        // 기존 코드들
        // 수량 입력 컨테이너 초기화
        initializeQuantityContainers();

        // 이미지 중앙 정렬
        initializeImages();

        // 아이템 합계 초기화
        initializeItemTotals();

        // 선택된 상품 업데이트
        updateSelectedItems();

        // 총 가격 업데이트
        updateTotalPrice();

        // 하단 패널 위치 조정
        adjustBottomPanel();
    }
    /**
     * 체크박스 숨기기
     */
    function hideCheckboxes() {
        const checkboxes = document.querySelectorAll('.checkbox-input, .item-checkbox-input');
        checkboxes.forEach((checkbox) => {
            checkbox.style.display = 'none';
            checkbox.style.opacity = '0';
            checkbox.style.position = 'absolute';
            checkbox.style.zIndex = '-1';
            checkbox.style.width = '0';
            checkbox.style.height = '0';
            checkbox.style.margin = '0';
            checkbox.style.padding = '0';
            checkbox.style.appearance = 'none';
            checkbox.style.webkitAppearance = 'none';
            checkbox.style.mozAppearance = 'none';
            checkbox.style.visibility = 'hidden';
        });
    }
    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
        // 체크박스 이벤트
        setupCheckboxes();

        // 수량 컨트롤 이벤트
        setupQuantityControls();

        // 버튼 이벤트 (삭제, 주문 등)
        setupButtons();

        // 스크롤 이벤트
        setupScrollEvents();

        // 창 크기 변경 이벤트
        window.addEventListener('resize', handleResize);
    }

    /**
     * 수량 입력 컨테이너 초기화
     */
    function initializeQuantityContainers() {
        const containers = document.querySelectorAll('.quantity-input-container');
        containers.forEach((container) => {
            const input = container.querySelector('.quantity-input');
            if (input) {
                container.setAttribute('data-value', input.value);
                input.style.outline = 'none';
                input.style.boxShadow = 'none';
                input.style.webkitAppearance = 'none';
                input.style.mozAppearance = 'none';
                input.style.appearance = 'none';
            }
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            container.style.width = '54px';
            container.style.height = '37px';
        });
    }

    /**
     * 이미지 중앙 정렬
     */
    function initializeImages() {
        const images = document.querySelectorAll('.item-image img:not(.cart-image):not(.thumbnail-image)');
        images.forEach((img) => {
            img.style.position = 'absolute';
            img.style.top = '50%';
            img.style.left = '50%';
            img.style.transform = 'translate(-50%, -50%)';
            img.style.maxWidth = '90%';
            img.style.maxHeight = '90%';
            img.style.width = 'auto';
            img.style.height = 'auto';
        });
    }

    /**
     * 아이템 합계 초기화
     */
    function initializeItemTotals() {
        cartItems.forEach((item) => {
            // 특정 상품 수량 예외 처리 (바비 스타일 아이콘)
            const itemName = item.querySelector('.item-name');
            if (itemName && itemName.textContent.includes('바비 스타일 아이콘')) {
                const quantityInput = item.querySelector('.quantity-input');
                const quantityContainer = item.querySelector('.quantity-input-container');
                if (quantityInput && quantityInput.value === '2') {
                    quantityInput.value = '1';
                    if (quantityContainer) {
                        quantityContainer.setAttribute('data-value', '1');
                    }
                }
            }

            // 아이템 합계 계산
            calculateItemTotal(item);
        });
    }

    /**
     * 창 크기 변경 이벤트 처리
     */
    function handleResize() {
        // 디바이스 정보 업데이트
        device.width = window.innerWidth;
        device.height = window.innerHeight;
        device.isMobile = window.innerWidth <= 768;
        device.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        device.isDesktop = window.innerWidth > 1024;

        // 하단 패널 위치 조정
        adjustBottomPanel();

        // 스크롤 이벤트 강제 발생
        window.dispatchEvent(new Event('scroll'));
    }

    /**
     * 하단 패널 위치 조정
     */
    function adjustBottomPanel() {
        if (!selectedItemsContainer) return;

        // 공통 스타일 적용
        selectedItemsContainer.style.position = 'fixed';
        selectedItemsContainer.style.bottom = '0';
        selectedItemsContainer.style.background = 'white';
        selectedItemsContainer.style.boxShadow = '0 -4px 10px rgba(0, 0, 0, 0.1)';
        selectedItemsContainer.style.padding = '15px';
        selectedItemsContainer.style.borderRadius = '30px 30px 0 0';
        selectedItemsContainer.style.border = '3px solid black';
        selectedItemsContainer.style.zIndex = '100';
        selectedItemsContainer.style.height = 'auto';
        selectedItemsContainer.style.overflowY = 'visible'; // 스크롤 제거

        if (device.isMobile) {
            // 모바일에서는 전체 너비
            selectedItemsContainer.style.width = '100%';
            selectedItemsContainer.style.left = '0';
            selectedItemsContainer.style.transform = 'none';
        } else {
            // 데스크탑에서는 비율에 맞게 조정
            selectedItemsContainer.style.width = device.isTablet ? '95%' : '90%';
            selectedItemsContainer.style.maxWidth = '1520px';
            selectedItemsContainer.style.left = '50%';
            selectedItemsContainer.style.transform = 'translateX(-50%)';
        }

        // 선택된 아이템 썸네일 컨테이너 스타일 설정
        if (selectedThumbnails) {
            selectedThumbnails.style.display = 'flex';
            selectedThumbnails.style.flexWrap = 'nowrap';
            selectedThumbnails.style.alignItems = 'center';
            selectedThumbnails.style.justifyContent = 'flex-start';
            selectedThumbnails.style.gap = '10px';
            selectedThumbnails.style.margin = '10px 0';
            selectedThumbnails.style.maxWidth = '100%';
            selectedThumbnails.style.height = '70px';
        }

        // 선택상품 정보 및 버튼 영역 조정
        const selectedCount = selectedItemsContainer.querySelector('.selected-count');
        if (selectedCount) {
            selectedCount.style.display = 'flex';
            selectedCount.style.justifyContent = 'space-between';
            selectedCount.style.alignItems = 'center';
            selectedCount.style.marginTop = '10px';
        }

        // 주문 버튼 영역 조정
        const actionButtons = selectedItemsContainer.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'row';
            actionButtons.style.justifyContent = 'flex-end';
            actionButtons.style.alignItems = 'center';
            actionButtons.style.gap = '10px';
            actionButtons.style.marginLeft = 'auto'; // 오른쪽 정렬
        }
    }

    /**
     * 체크박스 이벤트 설정
     */
    /**
     * 체크박스 이벤트 설정
     */
    /**
     * 체크박스 이벤트 설정
     */
    function setupCheckboxes() {
        // 모든 체크박스에 대해 명시적으로 SVG 상태 설정
        const checkboxes = document.querySelectorAll('.checkbox-input, .item-checkbox-input');
        checkboxes.forEach((checkbox) => {
            const label = checkbox.nextElementSibling;
            if (!label) return;

            const checkedSvg = label.querySelector('.checked-svg');
            const uncheckedSvg = label.querySelector('.unchecked-svg');

            if (!checkedSvg || !uncheckedSvg) return;

            // 초기 상태 명확히 설정 - 둘 중 하나만 보이도록
            function updateSvgDisplay(isChecked) {
                if (isChecked) {
                    checkedSvg.style.display = 'block';
                    uncheckedSvg.style.display = 'none';
                } else {
                    checkedSvg.style.display = 'none';
                    uncheckedSvg.style.display = 'block';
                }
            }

            // 초기 상태 명확히 설정
            updateSvgDisplay(checkbox.checked);

            // 체크박스 변경 시 SVG 업데이트
            checkbox.addEventListener('change', function () {
                updateSvgDisplay(this.checked);

                updateCheckboxStatus();
                updateSelectedItems();
                updateTotalPrice();
            });
        });

        // 전체 선택 체크박스 처리
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            const selectAllLabel = selectAllCheckbox.nextElementSibling;
            const checkedSvg = selectAllLabel.querySelector('.checked-svg');
            const uncheckedSvg = selectAllLabel.querySelector('.unchecked-svg');

            // 초기 상태 설정
            function updateSelectAllSvgDisplay(isChecked) {
                if (isChecked) {
                    checkedSvg.style.display = 'block';
                    uncheckedSvg.style.display = 'none';
                } else {
                    checkedSvg.style.display = 'none';
                    uncheckedSvg.style.display = 'block';
                }
            }

            // 초기 상태 설정
            updateSelectAllSvgDisplay(selectAllCheckbox.checked);

            // 전체 선택 체크박스 변경 이벤트
            selectAllCheckbox.addEventListener('change', function () {
                // 전체선택 체크박스 SVG 상태 업데이트
                updateSelectAllSvgDisplay(this.checked);

                const isChecked = this.checked;

                // 모든 상품 체크박스에 적용
                const itemCheckboxes = document.querySelectorAll('.item-checkbox-input');
                itemCheckboxes.forEach((checkbox) => {
                    // 체크박스 상태 변경
                    checkbox.checked = isChecked;

                    // 개별 체크박스 SVG 업데이트
                    const itemLabel = checkbox.nextElementSibling;
                    const itemCheckedSvg = itemLabel.querySelector('.checked-svg');
                    const itemUncheckedSvg = itemLabel.querySelector('.unchecked-svg');

                    if (isChecked) {
                        itemCheckedSvg.style.display = 'block';
                        itemUncheckedSvg.style.display = 'none';
                    } else {
                        itemCheckedSvg.style.display = 'none';
                        itemUncheckedSvg.style.display = 'block';
                    }
                });

                // 전체선택 텍스트 업데이트
                const selectAllText = document.getElementById('select-all-text');
                if (selectAllText) {
                    selectAllText.textContent = isChecked ? '전체 선택 삭제' : '전체선택';
                }

                // 선택된 상품, 가격 업데이트
                updateSelectedItems();
                updateTotalPrice();
            });
        }

        // 체크박스 레이블 수정
        const labels = document.querySelectorAll('.checkbox-label');
        labels.forEach((label) => {
            label.style.display = 'inline-block';
            label.style.width = 'auto';
            label.style.height = 'auto';
            label.style.margin = '0 0 -0px 0';
            label.style.padding = '0';

            // SVG 요소만 클릭 가능하도록 설정
            const svgs = label.querySelectorAll('svg');
            svgs.forEach((svg) => {
                svg.style.display = 'inline-block';
                svg.style.pointerEvents = 'auto';
            });

            // #select-all-text는 제외하고 나머지 텍스트 노드는 감춤
            if (!label.querySelector('#select-all-text')) {
                Array.from(label.childNodes).forEach((node) => {
                    if (node.nodeType === 3) {
                        // 텍스트 노드
                        node.textContent = '';
                    }
                });
            }
        });

        // 체크박스 숨기기
        setTimeout(hideCheckboxes, 100);
    }

    // 기존의 updateCheckboxVisibility 함수는 삭제해도 됩니다.

    /**
     * 체크박스 상태 업데이트
     */
    function updateCheckboxStatus() {
        // 개별 체크박스 SVG 상태 업데이트
        updateCheckboxVisibility();

        // 전체선택 체크박스 상태 업데이트
        const itemCheckboxes = document.querySelectorAll('.item-checkbox-input');
        const selectAllText = document.getElementById('select-all-text');

        if (!selectAllCheckbox || !selectAllText || itemCheckboxes.length === 0) return;

        let allChecked = true;

        for (let i = 0; i < itemCheckboxes.length; i++) {
            if (!itemCheckboxes[i].checked) {
                allChecked = false;
                break;
            }
        }

        // 이전 상태와 다를 때만 업데이트 (무한 루프 방지)
        if (selectAllCheckbox.checked !== allChecked) {
            selectAllCheckbox.checked = allChecked;

            // SVG 상태 수동 업데이트
            const label = selectAllCheckbox.nextElementSibling;
            if (label) {
                const checkedSvg = label.querySelector('.checked-svg');
                const uncheckedSvg = label.querySelector('.unchecked-svg');

                if (checkedSvg && uncheckedSvg) {
                    if (allChecked) {
                        checkedSvg.style.display = 'block';
                        uncheckedSvg.style.display = 'none';
                    } else {
                        checkedSvg.style.display = 'none';
                        uncheckedSvg.style.display = 'block';
                    }
                }
            }
        }

        // 텍스트 업데이트
        selectAllText.textContent = allChecked ? '전체 선택 삭제' : '전체선택';
    }

    /**
     * 체크박스 SVG 상태 업데이트
     */
    function updateCheckboxVisibility() {
        const checkboxes = document.querySelectorAll('.checkbox-input');

        checkboxes.forEach((checkbox) => {
            const label = checkbox.nextElementSibling;
            if (!label) return;

            const checkedSvg = label.querySelector('.checked-svg');
            const uncheckedSvg = label.querySelector('.unchecked-svg');

            if (!checkedSvg || !uncheckedSvg) return;

            if (checkbox.checked) {
                checkedSvg.style.display = 'block';
                uncheckedSvg.style.display = 'none';
            } else {
                checkedSvg.style.display = 'none';
                uncheckedSvg.style.display = 'block';
            }
        });
    }

    /**
     * 수량 컨트롤 이벤트 설정
     */
    function setupQuantityControls() {
        // 마이너스 버튼
        const minusButtons = document.querySelectorAll('.quantity-btn.minus-btn');
        minusButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                const container = this.nextElementSibling;
                const input = container.querySelector('.quantity-input');

                if (!input) return;

                let currentValue = parseInt(input.value) || 1;
                if (currentValue > 1) {
                    currentValue--;
                    input.value = currentValue;
                    container.setAttribute('data-value', currentValue);

                    // 상품 합계 업데이트
                    const cartItem = findParent(this, '.cart-item');
                    if (cartItem) {
                        calculateItemTotal(cartItem);
                        updateTotalPrice();
                    }
                }
            });
        });

        // 플러스 버튼
        const plusButtons = document.querySelectorAll('.quantity-btn.plus-btn');
        plusButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                const container = this.previousElementSibling;
                const input = container.querySelector('.quantity-input');

                if (!input) return;

                let currentValue = parseInt(input.value) || 1;
                currentValue++;
                input.value = currentValue;
                container.setAttribute('data-value', currentValue);

                // 상품 합계 업데이트
                const cartItem = findParent(this, '.cart-item');
                if (cartItem) {
                    calculateItemTotal(cartItem);
                    updateTotalPrice();
                }
            });
        });

        // 확인 버튼
        const confirmButtons = document.querySelectorAll('.confirm-btn');
        confirmButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                // 상품 합계 업데이트
                const cartItem = findParent(this, '.cart-item');
                if (cartItem) {
                    calculateItemTotal(cartItem);
                    updateTotalPrice();
                }
            });
        });

        // 수량 입력 필드
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach((input) => {
            input.style.position = 'absolute'; // 절대 위치로 변경
            input.style.top = '0';
            input.style.left = '0';
            input.style.opacity = '1';
            input.style.zIndex = '10';
            input.style.width = '100%';
            input.style.height = '100%';
            input.style.textAlign = 'center';
            input.style.border = 'none';
            input.style.background = 'transparent';
            input.style.fontSize = '16px';
            input.style.fontWeight = 'bold';
            input.style.color = '#000';
            // 값 변경 이벤트
            input.addEventListener('change', function () {
                let value = parseInt(this.value) || 1;
                if (value < 1) value = 1;
                this.value = value;

                const container = this.closest('.quantity-input-container');
                if (container) {
                    container.setAttribute('data-value', value);
                }

                // 상품 합계 업데이트
                const cartItem = findParent(this, '.cart-item');
                if (cartItem) {
                    calculateItemTotal(cartItem);
                    updateTotalPrice();
                }
            });

            // 엔터 키 처리
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });
        });
    }

    /**
     * 버튼 이벤트 설정 (삭제, 주문 등)
     */
    function setupButtons() {
        // 모든 버튼을 SVG로 교체
        replaceButtonsWithSvg();

        // 삭제하기 버튼
        const deleteButtons = document.querySelectorAll('.action-btn:not(.delete)');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                const cartItem = findParent(this, '.cart-item');
                if (cartItem && cartItem.parentNode) {
                    cartItem.parentNode.removeChild(cartItem);
                    updateSelectedItems();
                    updateTotalPrice();
                    updateCheckboxStatus();
                }
            });
        });

        // 주문하기 버튼
        const orderButtons = document.querySelectorAll('.action-btn.delete');
        orderButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                alert('주문이 완료되었습니다.');
            });
        });

        // TOP 버튼
        if (topButton) {
            topButton.addEventListener('click', function () {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            });
        }
    }

    /**
     * 모든 버튼을 SVG로 교체
     */
    function replaceButtonsWithSvg() {
        const buttons = document.querySelectorAll('.action-btn');

        buttons.forEach((button) => {
            // 삭제하기 버튼 교체
            if (button.textContent === '삭제하기') {
                button.innerHTML = `
                    <svg width="79" height="39" viewBox="0 0 79 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="77" height="37" rx="12" fill="#D2D2D2" />
                        <rect x="1" y="1" width="77" height="37" rx="12" stroke="black" stroke-width="2" />
                        <path d="M25.372 16.148H27.1V17.252H25.372V19.964H24.172V13.712H25.372V16.148ZM19.468 17.564C18.916 18.396 18.048 19.168 16.864 19.88L16.228 18.932C17.204 18.34 17.924 17.712 18.388 17.048C18.852 16.376 19.084 15.64 19.084 14.84V14.072H20.248V14.84C20.248 15.44 20.156 16.008 19.972 16.544L23.068 18.716L22.408 19.64L19.468 17.564ZM24.172 21.752H18.112V20.66H25.372V24.968H24.172V21.752ZM36.6189 24.848V13.712H37.7829V24.848H36.6189ZM32.4309 17.78H34.2069V13.88H35.3469V24.62H34.2069V18.872H32.4309V17.78ZM31.2789 16.28C31.2789 17.072 31.1989 17.856 31.0389 18.632L33.5589 22.544L32.6109 23.204L30.6189 20.108C30.2429 21.164 29.6549 22.236 28.8549 23.324L27.9429 22.616C28.6949 21.616 29.2549 20.612 29.6229 19.604C29.9909 18.596 30.1749 17.488 30.1749 16.28V15.68H28.3389V14.588H33.1869V15.68H31.2789V16.28ZM48.6098 17.9H50.3378V18.992H48.6098V24.848H47.4098V13.712H48.6098V17.9ZM42.3698 13.724H43.5818V15.356H46.2338V16.424H39.7178V15.356H42.3698V13.724ZM42.9938 17.42C43.5058 17.42 43.9698 17.528 44.3858 17.744C44.8018 17.96 45.1298 18.268 45.3698 18.668C45.6098 19.068 45.7298 19.528 45.7298 20.048V20.696C45.7298 21.216 45.6098 21.676 45.3698 22.076C45.1298 22.476 44.8018 22.784 44.3858 23C43.9698 23.224 43.5058 23.336 42.9938 23.336C42.4818 23.336 42.0138 23.224 41.5898 23C41.1738 22.784 40.8418 22.476 40.5938 22.076C40.3538 21.676 40.2338 21.216 40.2338 20.696V20.048C40.2338 19.528 40.3538 19.068 40.5938 18.668C40.8418 18.268 41.1738 17.96 41.5898 17.744C42.0058 17.528 42.4738 17.42 42.9938 17.42ZM44.5298 20.096C44.5298 19.608 44.3818 19.22 44.0858 18.932C43.7978 18.644 43.4338 18.5 42.9938 18.5C42.5458 18.5 42.1738 18.644 41.8778 18.932C41.5818 19.22 41.4338 19.608 41.4338 20.096V20.648C41.4338 21.144 41.5818 21.54 41.8778 21.836C42.1738 22.124 42.5458 22.268 42.9938 22.268C43.4338 22.268 43.7978 22.124 44.0858 21.836C44.3818 21.54 44.5298 21.144 44.5298 20.648V20.096ZM59.6647 24.848V13.712H60.8527V24.848H59.6647ZM52.0567 15.68V14.588H57.4327V15.572C57.4327 17.132 57.0087 18.588 56.1607 19.94C55.3127 21.292 54.1047 22.484 52.5367 23.516L51.8167 22.568C53.2327 21.664 54.3207 20.612 55.0807 19.412C55.8487 18.212 56.2327 17.012 56.2327 15.812V15.68H52.0567Z" fill="black" />
                    </svg>
                `;

                // 접근성을 위한 aria-label 추가
                button.setAttribute('aria-label', '삭제하기');
            }

            // 주문하기 버튼 교체
            else if (
                button.textContent === '주문하기' ||
                button.textContent === '선택상품 주문' ||
                button.textContent === '전체상품 주문' ||
                button.classList.contains('delete')
            ) {
                button.innerHTML = `
                    <svg width="79" height="39" viewBox="0 0 79 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="77" height="37" rx="12" fill="#FF8C8C"/>
                        <rect x="1" y="1" width="77" height="37" rx="12" stroke="black" stroke-width="2"/>
                        <path d="M17.248 18.536C19.856 17.616 21.16 16.536 21.16 15.296H17.848V14.24H25.528V15.296H22.36C22.36 15.752 22.268 16.168 22.084 16.544L26.128 18.56L25.6 19.568L21.448 17.48C20.696 18.28 19.44 18.976 17.68 19.568L17.248 18.536ZM16.456 20.636H26.92V21.728H22.288V24.98H21.1V21.728H16.456V20.636ZM29.4669 13.952H37.1469V18.344H29.4669V13.952ZM30.6669 17.276H35.9469V14.996H30.6669V17.276ZM28.0749 20.612V19.508H38.5389V20.612H33.9069V22.58H32.7189V20.612H28.0749ZM29.4189 21.62H30.6189V23.732H37.4349V24.848H29.4189V21.62ZM48.6098 17.9H50.3378V18.992H48.6098V24.848H47.4098V13.712H48.6098V17.9ZM42.3698 13.724H43.5818V15.356H46.2338V16.424H39.7178V15.356H42.3698V13.724ZM42.9938 17.42C43.5058 17.42 43.9698 17.528 44.3858 17.744C44.8018 17.96 45.1298 18.268 45.3698 18.668C45.6098 19.068 45.7298 19.528 45.7298 20.048V20.696C45.7298 21.216 45.6098 21.676 45.3698 22.076C45.1298 22.476 44.8018 22.784 44.3858 23C43.9698 23.224 43.5058 23.336 42.9938 23.336C42.4818 23.336 42.0138 23.224 41.5898 23C41.1738 22.784 40.8418 22.476 40.5938 22.076C40.3538 21.676 40.2338 21.216 40.2338 20.696V20.048C40.2338 19.528 40.3538 19.068 40.5938 18.668C40.8418 18.268 41.1738 17.96 41.5898 17.744C42.0058 17.528 42.4738 17.42 42.9938 17.42ZM44.5298 20.096C44.5298 19.608 44.3818 19.22 44.0858 18.932C43.7978 18.644 43.4338 18.5 42.9938 18.5C42.5458 18.5 42.1738 18.644 41.8778 18.932C41.5818 19.22 41.4338 19.608 41.4338 20.096V20.648C41.4338 21.144 41.5818 21.54 41.8778 21.836C42.1738 22.124 42.5458 22.268 42.9938 22.268C43.4338 22.268 43.7978 22.124 44.0858 21.836C44.3818 21.54 44.5298 21.144 44.5298 20.648V20.096ZM59.6647 24.848V13.712H60.8527V24.848H59.6647ZM52.0567 15.68V14.588H57.4327V15.572C57.4327 17.132 57.0087 18.588 56.1607 19.94C55.3127 21.292 54.1047 22.484 52.5367 23.516L51.8167 22.568C53.2327 21.664 54.3207 20.612 55.0807 19.412C55.8487 18.212 56.2327 17.012 56.2327 15.812V15.68H52.0567Z" fill="black"/>
                    </svg>
                `;

                // 접근성을 위한 aria-label 추가
                button.setAttribute('aria-label', '주문하기');
            }
        });
    }

    /**
     * 스크롤 이벤트 설정
     */
    function setupScrollEvents() {
        window.addEventListener('scroll', function () {
            // TOP 버튼 표시/숨김
            handleTopButtonVisibility();

            // 하단에 도달했을 때 레이아웃 변경
            handleBottomLayout();
        });

        // 초기 상태 설정
        window.dispatchEvent(new Event('scroll'));
    }

    /**
     * TOP 버튼 표시/숨김 처리
     */
    function handleTopButtonVisibility() {
        if (!topButton) return;

        if (window.pageYOffset > 300) {
            topButton.style.opacity = '1';
            topButton.style.visibility = 'visible';
        } else {
            topButton.style.opacity = '0';
            topButton.style.visibility = 'hidden';
        }
    }

    /**
     * 하단 패널 위치 조정 - 맨 아래에서는 fixed 제거하는 버전
     */
    /**
     * 하단 패널 위치 조정 - 100% 너비 적용 버전
     */
    function handleBottomLayout() {
        if (!selectedItemsContainer || !orderSummary) return;

        // 스크롤이 페이지 하단에 도달했는지 확인
        const isAtBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 200;

        // 기본 스타일 (공통)
        selectedItemsContainer.style.display = 'block';
        selectedItemsContainer.style.width = '100%'; // 항상 100% 너비 적용
        selectedItemsContainer.style.zIndex = '100';
        selectedItemsContainer.style.background = 'white';
        selectedItemsContainer.style.boxShadow = '0 -4px 10px rgba(0, 0, 0, 0.1)';
        selectedItemsContainer.style.padding = '15px';

        if (isAtBottom) {
            // 페이지 하단에 도달: fixed 제거하고 일반 흐름에 따르도록 설정
            selectedItemsContainer.style.position = 'relative';
            selectedItemsContainer.style.bottom = 'auto';
            selectedItemsContainer.style.left = '0';
            selectedItemsContainer.style.transform = 'none';
            selectedItemsContainer.style.margin = '30px 0 50px';
            selectedItemsContainer.style.borderRadius = '30px';
        } else {
            // 일반 스크롤 상태: fixed 위치로 고정
            selectedItemsContainer.style.position = 'fixed';
            selectedItemsContainer.style.bottom = '0';
            selectedItemsContainer.style.left = '0';
            selectedItemsContainer.style.transform = 'none';
            selectedItemsContainer.style.margin = '0';
            selectedItemsContainer.style.borderRadius = '30px 30px 0 0';
        }

        // merged 클래스가 있으면 제거
        if (selectedItemsContainer.classList.contains('merged')) {
            selectedItemsContainer.classList.remove('merged');
        }

        // 선택된 항목 컨테이너 내의 요약 내용 제거
        const summaryContent = selectedItemsContainer.querySelector('.summary-content');
        if (summaryContent) {
            summaryContent.remove();
        }

        // 페이지 맨 아래 도달 여부 계산
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

        // 기존 병합 컨테이너 확인
        let mergedContainer = document.getElementById('merged-container');

        if (isAtBottom) {
            // 맨 아래 도달: 병합 컨테이너 생성 및 표시
            if (!mergedContainer) {
                // 병합 컨테이너 생성
                mergedContainer = document.createElement('div');
                mergedContainer.id = 'merged-container';
                mergedContainer.style.width = '100%';
                mergedContainer.style.maxWidth = '1520px';
                mergedContainer.style.margin = '20px auto';
                mergedContainer.style.padding = '15px';
                mergedContainer.style.backgroundColor = 'white';
                mergedContainer.style.borderRadius = '20px';
                mergedContainer.style.boxShadow = '0 -4px 10px rgba(0, 0, 0, 0.1)';
                mergedContainer.style.position = 'relative';
                mergedContainer.style.zIndex = '101'; // fixed 컨테이너보다 높은 z-index

                // 주문 요약 복제
                const orderCopy = document.createElement('div');
                orderCopy.innerHTML = orderSummary.innerHTML;
                orderCopy.style.marginBottom = '15px';
                mergedContainer.appendChild(orderCopy);

                // 구분선 추가
                const divider = document.createElement('hr');
                divider.style.margin = '15px 0';
                divider.style.border = 'none';
                divider.style.borderTop = '1px solid #eee';
                mergedContainer.appendChild(divider);

                // 선택된 항목 복제
                const selectCopy = document.createElement('div');
                // 썸네일과 카운트 부분만 복제
                const thumbnails = selectedItemsContainer.querySelector('.selected-thumbnails');
                const count = selectedItemsContainer.querySelector('.selected-count');
                if (thumbnails) selectCopy.appendChild(thumbnails.cloneNode(true));
                if (count) selectCopy.appendChild(count.cloneNode(true));

                mergedContainer.appendChild(selectCopy);

                // 병합 컨테이너를 body에 추가
                document.body.appendChild(mergedContainer);
            }

            // 병합 컨테이너 표시
            mergedContainer.style.display = 'block';
        } else {
            // 스크롤 중: 병합 컨테이너 숨김
            if (mergedContainer) {
                mergedContainer.style.display = 'none';
            }
        }
    }

    /**
     * 선택된 상품 목록 업데이트 - 썸네일 및 버튼 영역 설정
     */
    function updateSelectedItems() {
        if (!selectedThumbnails) return;

        // 썸네일 영역 초기화
        selectedThumbnails.innerHTML = '';

        // 스타일 초기화 및 설정 - 가로로 모든 항목 표시
        selectedThumbnails.style.display = 'flex';
        selectedThumbnails.style.flexDirection = 'row';
        selectedThumbnails.style.alignItems = 'center';
        selectedThumbnails.style.flexWrap = 'nowrap'; // 줄바꿈 없음
        selectedThumbnails.style.gap = '10px';
        selectedThumbnails.style.width = '100%';
        selectedThumbnails.style.height = '70px'; // 높이 고정
        selectedThumbnails.style.padding = '5px 15px';
        selectedThumbnails.style.overflowX = 'visible'; // 스크롤 제거

        // 체크된 상품 찾기
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox-input:checked');

        // 선택된 항목 개수 업데이트
        const countSpan = selectedItemsContainer.querySelector('.selected-count span');
        if (countSpan) {
            countSpan.textContent = `${selectedCheckboxes.length} 개 상품이 선택 되었습니다.`;
        }

        // 썸네일 추가
        selectedCheckboxes.forEach((checkbox) => {
            const cartItem = findParent(checkbox, '.cart-item');
            if (!cartItem) return;

            const image = cartItem.querySelector('.item-image img');
            if (!image) return;

            const checkboxId = checkbox.getAttribute('id');

            // 썸네일 요소 생성
            const thumbItem = document.createElement('div');
            thumbItem.className = 'selected-item';
            thumbItem.setAttribute('data-id', checkboxId);

            // 명확한 크기 설정
            thumbItem.style.width = '60px';
            thumbItem.style.height = '60px';
            thumbItem.style.border = '3px solid #E0212';
            thumbItem.style.borderRadius = '8px';
            thumbItem.style.overflow = 'hidden';
            thumbItem.style.position = 'relative';
            thumbItem.style.display = 'flex';
            thumbItem.style.flexShrink = '0'; // 크기 유지
            thumbItem.style.margin = '0 5px';

            // 이미지 추가
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.className = 'thumbnail-image';

            // 이미지 스타일 설정
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.position = 'static';
            img.style.transform = 'none';

            // X 표시 오버레이 생성 (숨김 상태)
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.color = 'white';
            overlay.style.display = 'none';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.fontSize = '24px';
            overlay.innerHTML = '×';

            // 이미지에 호버 이벤트 추가
            thumbItem.addEventListener('mouseenter', function () {
                overlay.style.display = 'flex';
            });

            thumbItem.addEventListener('mouseleave', function () {
                overlay.style.display = 'none';
            });

            // 요소 구성
            thumbItem.appendChild(img);
            thumbItem.appendChild(overlay);
            selectedThumbnails.appendChild(thumbItem);

            // 클릭 이벤트 추가
            thumbItem.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 체크박스 찾아서 해제
                const itemId = thumbItem.getAttribute('data-id');
                const checkbox = document.getElementById(itemId);
                if (checkbox) {
                    checkbox.checked = false;
                    updateCheckboxVisibility();
                    updateSelectedItems();
                    updateTotalPrice();
                    updateCheckboxStatus();
                }
            });
        });

        // 선택상품 정보 및 버튼 영역 조정
        const selectedCount = selectedItemsContainer.querySelector('.selected-count');
        if (selectedCount) {
            selectedCount.style.display = 'flex';
            selectedCount.style.justifyContent = 'space-between';
            selectedCount.style.alignItems = 'center';
            selectedCount.style.marginTop = '10px';
            selectedCount.style.width = '100%';
        }

        // 주문 버튼 영역 조정
        const actionButtons = selectedItemsContainer.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'row';
            actionButtons.style.justifyContent = 'flex-end';
            actionButtons.style.alignItems = 'center';
            actionButtons.style.gap = '10px';
            actionButtons.style.marginLeft = 'auto'; // 오른쪽 정렬
        }
    }

    /**
     * 선택된 상품 목록 업데이트 - 버튼 영역 개선 버전
     */
    function updateSelectedItems() {
        if (!selectedThumbnails) return;

        // 썸네일 영역 초기화
        selectedThumbnails.innerHTML = '';

        // 스타일 초기화 및 설정 - 가로로 모든 항목 표시
        selectedThumbnails.style.display = 'flex';
        selectedThumbnails.style.flexDirection = 'row';
        selectedThumbnails.style.alignItems = 'center';
        selectedThumbnails.style.flexWrap = 'nowrap'; // 줄바꿈 없음
        selectedThumbnails.style.gap = '10px';
        selectedThumbnails.style.width = '100%';
        selectedThumbnails.style.height = '70px'; // 높이 고정
        selectedThumbnails.style.padding = '5px 15px';
        selectedThumbnails.style.overflowX = 'visible'; // 스크롤 제거

        // 체크된 상품 찾기
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox-input:checked');

        // 선택된 항목 개수 업데이트
        const countSpan = selectedItemsContainer.querySelector('.selected-count span');
        if (countSpan) {
            countSpan.textContent = `${selectedCheckboxes.length} 개 상품이 선택 되었습니다.`;
        }

        // 썸네일 추가
        selectedCheckboxes.forEach((checkbox) => {
            const cartItem = findParent(checkbox, '.cart-item');
            if (!cartItem) return;

            const image = cartItem.querySelector('.item-image img');
            if (!image) return;

            const checkboxId = checkbox.getAttribute('id');

            // 썸네일 요소 생성
            const thumbItem = document.createElement('div');
            thumbItem.className = 'selected-item';
            thumbItem.setAttribute('data-id', checkboxId);

            // 명확한 크기 설정
            thumbItem.style.width = '60px';
            thumbItem.style.height = '60px';
            thumbItem.style.border = '1px solid #ddd';
            thumbItem.style.borderRadius = '4px';
            thumbItem.style.overflow = 'hidden';
            thumbItem.style.position = 'relative';
            thumbItem.style.display = 'flex';
            thumbItem.style.flexShrink = '0'; // 크기 유지
            thumbItem.style.margin = '0 5px';

            // 이미지 추가
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.className = 'thumbnail-image';

            // 이미지 스타일 설정
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.position = 'static';
            img.style.transform = 'none';

            // X 표시 오버레이 생성 (숨김 상태)
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.color = 'white';
            overlay.style.display = 'none';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.fontSize = '24px';
            overlay.innerHTML = '×';

            // 이미지에 호버 이벤트 추가
            thumbItem.addEventListener('mouseenter', function () {
                overlay.style.display = 'flex';
            });

            thumbItem.addEventListener('mouseleave', function () {
                overlay.style.display = 'none';
            });

            // 요소 구성
            thumbItem.appendChild(img);
            thumbItem.appendChild(overlay);
            selectedThumbnails.appendChild(thumbItem);

            // 클릭 이벤트 추가
            thumbItem.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 체크박스 찾아서 해제
                const itemId = thumbItem.getAttribute('data-id');
                const checkbox = document.getElementById(itemId);
                if (checkbox) {
                    checkbox.checked = false;
                    updateCheckboxVisibility();
                    updateSelectedItems();
                    updateTotalPrice();
                    updateCheckboxStatus();
                }
            });
        });

        // 선택상품 정보 및 버튼 영역 조정
        const selectedCount = selectedItemsContainer.querySelector('.selected-count');
        if (selectedCount) {
            selectedCount.style.display = 'flex';
            selectedCount.style.justifyContent = 'space-between';
            selectedCount.style.alignItems = 'center';
            selectedCount.style.marginTop = '10px';
            selectedCount.style.width = '100%';
        }

        // 주문 버튼 영역 조정
        const actionButtons = selectedItemsContainer.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'row';
            actionButtons.style.justifyContent = 'flex-end';
            actionButtons.style.alignItems = 'center';
            actionButtons.style.gap = '10px';
            actionButtons.style.marginLeft = 'auto'; // 오른쪽 정렬
        }
    }
    /**
     * 선택된 상품 목록 업데이트
     */
    function updateSelectedItems() {
        if (!selectedThumbnails) return;

        // 썸네일 영역 초기화
        selectedThumbnails.innerHTML = '';

        // 스타일 초기화 및 설정 - 가로로 모든 항목 표시
        selectedThumbnails.style.display = 'flex';
        selectedThumbnails.style.flexDirection = 'row';
        selectedThumbnails.style.alignItems = 'center';
        selectedThumbnails.style.flexWrap = 'nowrap'; // 줄바꿈 없음
        selectedThumbnails.style.gap = '10px';
        selectedThumbnails.style.width = '100%';
        selectedThumbnails.style.height = '70px'; // 높이 고정
        selectedThumbnails.style.padding = '5px 15px';
        selectedThumbnails.style.overflowX = 'visible'; // 스크롤 제거

        // 체크된 상품 찾기
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox-input:checked');

        // 선택된 항목 개수 업데이트
        const countSpan = selectedItemsContainer.querySelector('.selected-count span');
        if (countSpan) {
            countSpan.textContent = `${selectedCheckboxes.length} 개 상품이 선택 되었습니다.`;
        }

        // 썸네일 추가
        selectedCheckboxes.forEach((checkbox) => {
            const cartItem = findParent(checkbox, '.cart-item');
            if (!cartItem) return;

            const image = cartItem.querySelector('.item-image img');
            if (!image) return;

            const checkboxId = checkbox.getAttribute('id');

            // 썸네일 요소 생성
            const thumbItem = document.createElement('div');
            thumbItem.className = 'selected-item';
            thumbItem.setAttribute('data-id', checkboxId);

            // 명확한 크기 설정
            thumbItem.style.width = '60px';
            thumbItem.style.height = '60px';
            thumbItem.style.border = '1px solid #ddd';
            thumbItem.style.borderRadius = '4px';
            thumbItem.style.overflow = 'hidden';
            thumbItem.style.position = 'relative';
            thumbItem.style.display = 'flex';
            thumbItem.style.flexShrink = '0'; // 크기 유지
            thumbItem.style.margin = '0 5px';

            // 이미지 추가
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.className = 'thumbnail-image';

            // 이미지 스타일 설정
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.position = 'static';
            img.style.transform = 'none';

            // X 표시 오버레이 생성 (숨김 상태)
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.color = 'white';
            overlay.style.display = 'none';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.fontSize = '24px';
            overlay.innerHTML = '×';

            // 이미지에 호버 이벤트 추가
            thumbItem.addEventListener('mouseenter', function () {
                overlay.style.display = 'flex';
            });

            thumbItem.addEventListener('mouseleave', function () {
                overlay.style.display = 'none';
            });

            // 요소 구성
            thumbItem.appendChild(img);
            thumbItem.appendChild(overlay);
            selectedThumbnails.appendChild(thumbItem);

            // 클릭 이벤트 추가
            thumbItem.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 체크박스 찾아서 해제
                const itemId = thumbItem.getAttribute('data-id');
                const checkbox = document.getElementById(itemId);
                if (checkbox) {
                    checkbox.checked = false;
                    updateCheckboxVisibility();
                    updateSelectedItems();
                    updateTotalPrice();
                    updateCheckboxStatus();
                }
            });
        });

        // 선택상품 정보 및 버튼 영역 조정
        const selectedCount = selectedItemsContainer.querySelector('.selected-count');
        if (selectedCount) {
            selectedCount.style.display = 'flex';
            selectedCount.style.justifyContent = 'space-between';
            selectedCount.style.alignItems = 'center';
            selectedCount.style.marginTop = '10px';
            selectedCount.style.width = '100%';
        }

        // 주문 버튼 영역 조정
        const actionButtons = selectedItemsContainer.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'row';
            actionButtons.style.justifyContent = 'flex-end';
            actionButtons.style.alignItems = 'center';
            actionButtons.style.gap = '10px';
            actionButtons.style.marginLeft = 'auto'; // 오른쪽 정렬
        }
    }
    /**
     * 개별 상품 합계 계산
     */
    function calculateItemTotal(cartItem) {
        if (!cartItem) return 0;

        const quantityInput = cartItem.querySelector('.quantity-input');
        const priceElement = cartItem.querySelector('.item-price');
        const totalElement = cartItem.querySelector('.item-total');

        if (!quantityInput || !priceElement || !totalElement) return 0;

        const quantity = parseInt(quantityInput.value) || 1;
        const unitPrice = extractNumbers(priceElement.textContent);
        const total = quantity * unitPrice;

        totalElement.textContent = `합계: ${formatPrice(total)}`;

        return total;
    }

    /**
     * 총 가격 계산 및 업데이트
     */
    function updateTotalPrice() {
        const selectedItems = document.querySelectorAll('.item-checkbox-input:checked');
        let totalPrice = 0;

        // 선택된 상품의 합계 계산
        selectedItems.forEach((checkbox) => {
            const cartItem = findParent(checkbox, '.cart-item');
            if (cartItem) {
                const totalElement = cartItem.querySelector('.item-total');
                if (totalElement) {
                    totalPrice += extractNumbers(totalElement.textContent);
                }
            }
        });

        // 결제 예정금액 및 총 상품금액 업데이트
        const summaryElements = document.querySelectorAll('.summary-row .summary-value');
        if (summaryElements.length >= 2) {
            summaryElements[0].textContent = formatPrice(totalPrice);
            summaryElements[1].textContent = formatPrice(totalPrice);
        }
    }

    /**
     * 상위 요소 찾기
     */
    function findParent(element, selector) {
        while (element) {
            if (element.matches && element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    /**
     * 텍스트에서 숫자만 추출
     */
    function extractNumbers(text) {
        if (!text) return 0;

        const numericValues = text.match(/\d+/g);
        if (!numericValues) return 0;

        return parseInt(numericValues.join(''));
    }

    /**
     * 가격 포맷 적용
     */
    function formatPrice(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' 원';
    }

    /**
     * 페이지 상단으로 스크롤
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
});
