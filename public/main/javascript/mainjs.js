
let mainJsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {

    if (mainJsInitialized) return; // 이미 초기화되었으면 리턴
    mainJsInitialized = true;

    const container = document.getElementById('container');

    if (!localStorage.getItem('introSeen')) {
        window.location.href = 'intro.html';
        clearMarkersAndOverlays();
    } else if (!localStorage.getItem('tutorialSeen')) {
        window.location.href = 'tutorial.html';
        clearMarkersAndOverlays();
    } else {
        container.style.display = 'block';
    }

    

    if (performance.navigation.type === 1) {
        localStorage.removeItem('searchResults');
        localStorage.removeItem('searchKeyword');
        localStorage.removeItem('searchCollection');
        localStorage.removeItem('searchRank');
        localStorage.removeItem('addresses');
        sessionStorage.removeItem('searchResults');
        sessionStorage.removeItem('searchKeyword');
        sessionStorage.removeItem('searchCollection');
        sessionStorage.removeItem('searchRank');
        sessionStorage.removeItem('addresses');
        sessionStorage.removeItem('selectedLocation');
        sessionStorage.removeItem('tutorialSeen');
        localStorage.setItem('introSeen', '');
        localStorage.setItem('tutorialSeen', '');
    }



    // 북마크 아이콘 클릭 시 북마크 추가 또는 제거
    document.addEventListener('click', async function(event) {
        if (event.target.classList.contains('bookmarkicon')) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }
            
            const bookmarkElement = await event.target.closest('.slide-content'); // 부모 요소 중 가장 가까운 북마크 요소 찾기
            console.log(bookmarkElement);
            const checkbox = await bookmarkElement.querySelector('.bookmarkicon'); // 북마크 아이콘 체크박스 가져오기
            const dataid = await bookmarkElement.querySelector('.dataid').textContent; // 북마크 요소에서 dataId 가져오기

            // 체크박스 상태에 따라 북마크 추가 또는 제거
            try {
                if (checkbox.checked) {
                    const response = await fetch(`/info/bookmark`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                    },
                            body: JSON.stringify({ id: dataid })
                        });

                        if (response.ok) {
                            console.log('북마크 추가 성공');

                        } else {
                            console.error('북마크 추가 실패:', response.status, response.statusText);
                        }
                } else {
                    const response = await fetch(`/info/bookmark`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ dataId: dataid })
                    });

                    if (response.ok) {
                        console.log('북마크 삭제 성공');
                    } else {
                        console.error('북마크 삭제 실패:', response.status, response.statusText);
                    }
                    }
            } catch (error) {
                console.error('요청 중 오류 발생:', error);
            }
        }
    });
    const searchBtn = document.getElementById('search-btn');
    const searchbox = document.getElementById('search');

    async function displayData(datas, containerId = 'slide') {
        const container = document.getElementById(containerId);
        
        container.innerHTML = ''; // 이전 데이터를 지웁니다.
        const empty = document.createElement('div');
        empty.id = 'slide-empty';
        container.appendChild(empty);

        // 마커와 오버레이 제거 함수 호출
        clearMarkersAndOverlays(); 

        const addresses = [];

        if (datas && Array.isArray(datas)) {
            datas.forEach(item => {
                if (!item || Object.keys(item).length === 0) {
                    return;
                }

                if (item.addr) {
                    addresses.push({
                        addr: item.addr,
                        name: item.name || '',
                        rank: item.rank || '',
                        tel: item.tel || '',
                        detail: item.detail || '',
                        violation: item.detail ? true : false
                    });

                    let starImg = '';
                    if (item.rank === '매우우수') {
                        starImg = './css/images/3star.svg';
                    } else if (item.rank === '우수') {
                        starImg = './css/images/2star.svg';
                    } else if (item.rank === '좋음') {
                        starImg = './css/images/1star.svg';
                    }

                    let tel = item.tel || '';
                    if (tel.includes('*')) {
                        tel = '';
                    } else {
                        tel = tel.replace(/\s+/g, '-'); // 숫자 사이에 빈칸이 있으면 "-"로 대체
                        if (tel.startsWith('02')) {
                            if (tel.length === 9) {
                                tel = tel.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
                            } else {
                                tel = tel.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                            }
                        } else if (tel.length <= 8) {
                            tel = '';
                        } else if (tel.startsWith('000')) {
                            tel = '';
                        }
                    }

                    const slideItem = document.createElement('div');
                    slideItem.classList.add('slide-content');

                    if (item.detail) {
                        slideItem.classList.add('violation');
                    }

                    let slideContent = `<h2>${item.name}`;
                    const itemId = item._id;
                    let isBookmarked = false;
                    const token = localStorage.getItem('token');
                    if (token) {
                        // 로컬 스토리지에서 북마크 데이터  가져오기
                        const bookmarksObject = JSON.parse(localStorage.getItem('bookmark') || '{}');
                        // 객체를 배열로 변환
                        const bookmarksArray = Object.values(bookmarksObject);
                        if (bookmarksArray.length > 0) {
                            // 북마크 배열에서 현재 아이템의 ID와 일치하는 북마크 찾기
                            isBookmarked = bookmarksArray[0].find(bookmark => bookmark.dataId == itemId);
                        }
                    }
                    // 체크된 상태인지 확인하여 HTML에 추가
                    slideContent += `<input type="checkbox" class="bookmarkicon" name="bookmarkicon" ${isBookmarked ? 'checked' : ''}></input><p class="dataid" style="display:none">${itemId}</p>`;

                    if (item.detail) {
                        slideContent += ` <img src="./css/images/alert_circle_outline_icon_red.png" alt="위반" class="violation-icon">`;
                    } else if (!item.detail && !item.rank) {
                        slideContent += ` <span class="exemplary-text"><img src="./css/images/logo.png" alt="모범음식점" class="exemplary-icon"> 클린잇 - 모범음식점</span>`;
                    }

                    slideContent += `</h2>
                                    <p id="addr">${item.addr}</p>`;

                    if (tel) {
                        slideContent += `<p id="tel">연락처 : ${tel}</p>`;
                    }
                    if (item.rank) {
                        slideContent += `<p id="rank">위생등급 : ${item.rank}</p>
                                        <img src="${starImg}" alt="${item.rank}" class="star-img">`;
                    }
                    if (item.detail) {
                        slideContent += `<p id="detail">위반내용 : ${item.detail}</p>`;
                    }

                    slideItem.innerHTML = slideContent;
                    container.appendChild(slideItem);
                    clearMarkersAndOverlays();

                    slideItem.addEventListener('click', () => {
                        // 주소 검색 및 지도 중심 이동
                        window.moveMapCenter(item.addr);
                    });
                }
            });

            const center = getMapCenter();
            const sortedAddresses = sortResultsByDistance(addresses, center);
            const limitedAddresses = sortedAddresses.slice(0, MAX_MARKERS + zoomLevel * 5);

            localStorage.setItem('addresses', JSON.stringify(limitedAddresses));
            addMarkers(limitedAddresses, true);
        } else {
            console.error('데이터가 없습니다.');
        }
    }
    

    async function search(containerId = 'slide') {
        scrollToTop();
        const keyword = searchbox.value;
        const checkboxes = document.querySelectorAll('.search-check:checked');
        const rank = document.querySelectorAll('.rank:checked');
        const collection = [];
        checkboxes.forEach(checkbox => {
            collection.push(checkbox.value);
        });
        if (!keyword) {
            console.error('검색어를 입력하세요.');
            alert('검색어를 입력하세요.');
            return;
        }
        let rans = [];
        rank.forEach(rank => {
            rans.push(rank.value);
        });
        let query = {
            $and: [
                {
                    $or: [
                        { addr: { $regex: keyword, $options: 'i' } }, // 'i' 옵션은 대소문자 구분 없이 검색하도록 합니다.
                        { name: { $regex: keyword, $options: 'i' } }
                    ]
                },
            ]
        };
        if (rans.length > 0) {
            query.$and.push({ rank: { $in: rans } });
        }
        try {
            const queryString = encodeURIComponent(JSON.stringify(query));
            const response = await fetch(`/main/search?collection=${collection}&query=${queryString}`);
            if (!response.ok) {
                throw new Error('서버 응답에 문제가 발생했습니다.');
            }
            const data = await response.json();

            sessionStorage.setItem('searchResults', JSON.stringify(data));
            sessionStorage.setItem('searchKeyword', keyword);
            sessionStorage.setItem('searchCollection', JSON.stringify(collection));
            sessionStorage.setItem('searchRank', JSON.stringify(rans));
            
            displayData(data, containerId);
            window.clearMarkersAndOverlays();
        } catch (error) {
            console.error('데이터를 불러오는 중 오류가 발생했습니다.', error);
        }
    }

    // 마커를 추가하는 함수
    function addMarkers(addressData, shouldRecenter) {
        window.clearMarkersAndOverlays();
        addressData.forEach((data, index) => {
            searchAndDisplayAddress(data, shouldRecenter && index === 0);
        });
    }


    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const savedResults = sessionStorage.getItem('searchResults');
    const savedKeyword = sessionStorage.getItem('searchKeyword');
    const savedCollection = sessionStorage.getItem('searchCollection');
    const savedRank = sessionStorage.getItem('searchRank');
    const savedAddresses = localStorage.getItem('addresses');

    if (savedResults && savedKeyword && savedCollection && savedRank) {
        const results = JSON.parse(savedResults);
        const keyword = savedKeyword;
        const collection = JSON.parse(savedCollection);
        const rank = JSON.parse(savedRank);

        searchbox.value = keyword;
        document.querySelectorAll('.search-check').forEach(checkbox => {
            checkbox.checked = collection.includes(checkbox.value);
        });
        document.querySelectorAll('.rank').forEach(rankBox => {
            rankBox.checked = rank.includes(rankBox.value);
        });
        
        displayData(results);
    }

    if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        addMarkers(addresses, true);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', async function() {
            const token = localStorage.getItem('token');
                if (token) {
                    getBookmark()
                }
            if (searchBtn.disabled) {
                console.log("서버 통신 중");
                return;
            }
            searchBtn.disabled = true;
            await search();
            clearMarkersAndOverlays(); 
            searchBtn.disabled = false;
        });
    }

    if (searchbox) {
        searchbox.addEventListener('keypress', async function(event) {
            if (event.key === 'Enter') {
                const token = localStorage.getItem('token');
                if (token) {
                    getBookmark()
                }
                if (searchBtn.disabled) {
                    console.log("서버 통신 중");
                    return;
                }
                searchBtn.disabled = true;
                await search();
                clearMarkersAndOverlays(); 
                searchBtn.disabled = false;
            }
        });
    }

    if (typeof map !== 'undefined') {
        map.addListener('zoom_changed', function() {
            zoomLevel = map.getLevel();
            // updateOverlaysVisibility();
        });
    }

    

    // 마커와 오버레이를 제거하는 함수
    function clearMarkersAndOverlays() {
        console.log("clearMarkersAndOverlays 호출됨");
        if (Array.isArray(markers)) {
            markers.forEach(marker => marker.setMap(null));
            markers = [];
        } else {
            markers = [];
        }
    
        if (Array.isArray(overlays)) {
            overlays.forEach(overlay => overlay.setMap(null));
            overlays = [];
        } else {
            overlays = [];
        }

        if (Array.isArray(toggleOverlays)) {
            toggleOverlays.forEach(overlay => overlay.setMap(null));
            toggleOverlays = [];
        } else {
            toggleOverlays = [];
        }
    }
    async function getBookmark() {
        const token = localStorage.getItem('token');
        if(token){
            try {
                const response = await fetch(`/info/bookmark`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                if(response.ok) {
                    const data = await response.json(); // JSON 형태로 변환
                    console.log(data);
                    localStorage.setItem('bookmark', JSON.stringify(data)); // 문자열로 변환하여 저장
                } else {
                    console.error('Failed to fetch bookmark:', response.status);
                }
            } catch (error) {
                console.error('Error fetching bookmark:', error);
            }
        }
    }

    // 데이터 초기화 및 지도 이동 처리
    const selectedLocation = JSON.parse(sessionStorage.getItem('selectedLocation'));
    console.log('Loaded selected location:', selectedLocation);
    if (selectedLocation) {
        setTimeout(() => {
            window.moveMapCenter(selectedLocation.addr);
        }, 900); // 2초 지연 후 지도 이동
    }
    
    
    window.search = search;
    window.displayData = displayData;
    window.clearMarkersAndOverlays = clearMarkersAndOverlays;




});
