let listJsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (listJsInitialized) return; // 이미 초기화되었으면 리턴
    listJsInitialized = true;
    
    const searchBtn = document.getElementById('search-btn');
    const searchbox = document.getElementById('search');

    // 북마크 아이콘 클릭 시 북마크 추가 또는 제거
    document.addEventListener('click', async function(event) {
        if (event.target.classList.contains('bookmarkicon')) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }
            

            const bookmarkElement = await event.target.closest('.content-info'); // 부모 요소 중 가장 가까운 북마크 요소 찾기
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

    async function displayListData(datas) {
        const container = document.getElementById('data-container');
        container.innerHTML = ''; // 이전 데이터를 지웁니다.
        container.innerHTML += `<div style="height: 120px; width: 100%;"></div>`;

        if (datas && Array.isArray(datas)) {
            datas.forEach(item => {
                let rank = '';
                if(item.rank === '매우우수'){
                    rank = `<div class="star"><h3>위생등급: 매우우수<img src="./css/images/3star.svg" class="3star"></h3></div>`;
                } else if(item.rank === '우수'){
                    rank = `<div class="star"><h3>위생등급: 우수<img src="./css/images/2star.svg" class="2star"></h3></div>`;
                } else if(item.rank === '좋음'){
                    rank = `<div class="star"><h3>위생등급: 좋음<img src="./css/images/1star.svg" class="1star"></h3></div>`;
                }

                if (!item.detail){
                    item.detail = '';
                } else if(item.detail){
                    item.detail = `<span class="violation">위반내용: ${item.detail}</span>`;
                }
                if (!item.no){
                    item.no = '';
                } else {
                    item.no = `지정번호: ` + item.no;
                }
                if (!item.penalty){
                    item.penalty = '';
                } else {
                    item.penalty = `처벌내용: ` + item.penalty;
                }
                if (!item.category){
                    item.category = '';
                } else {
                    item.category = `업종명: ` + item.category;
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

                const itemElement = document.createElement('div');
                itemElement.classList.add('content');
                if (item.detail) {
                    itemElement.classList.add('violation');
                }
                let itemHTML = '<div class="content-info">';
                itemHTML += `<h2>${item.name}</h2>`;

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
                    }}

                // 체크된 상태인지 확인하여 HTML에 추가
                itemHTML += `<input type="checkbox" class="bookmarkicon" name="bookmarkicon" ${isBookmarked ? 'checked' : ''}></input><p class="dataid" style="display:none">${itemId}</p>`;

                if (item.detail) {
                    itemHTML += ` <img src="./css/images/alert_circle_outline_icon_red.png" alt="위반" class="violation-icon">`;
                } else if (!item.detail && !item.rank) {
                    itemHTML += ` <span class="exemplary-text"><img src="./css/images/logo.png" alt="모범음식점" class="exemplary-icon"> 클린잇 - 모범음식점</span>`;
                }
                itemHTML += rank; // 위생등급
                itemHTML += `<p>${item.detail || ''}</p><br>`;                               
                itemHTML += `<p class="address">${item.addr || '[ ※ 폐업한 음식점 입니다. ]'}</p><br>`; // 주소
                if (tel) {
                    itemHTML += `<p class="tel">전화번호: ${tel}</p><br>`; // 전화번호
                }
                itemElement.innerHTML = itemHTML;
                container.appendChild(itemElement);
                window.clearMarkersAndOverlays();
                
                itemElement.addEventListener('click', function(event) {
                    if (!event.target.classList.contains('bookmarkicon')) {
                        console.log('Saving selected location:', item.addr);
                        // 클릭된 항목의 데이터를 sessionStorage에 저장
                        sessionStorage.setItem('selectedLocation', JSON.stringify(item));
                        // index.html로 이동
                        window.location.href = 'index.html';
                    }
                });
                })
        } else {
            console.error('데이터가 없습니다.');
        }
    }

    const savedResults = sessionStorage.getItem('searchResults');
    if (savedResults) {
        const results = JSON.parse(savedResults);
        displayListData(results);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', async function() {
            if (searchBtn.disabled) {
                const token = localStorage.getItem('token');
                if (token) {
                    getBookmark()
                }
                console.log("서버 통신 중");
                return;
            }
            searchBtn.disabled = true;
            clearMarkersAndOverlays();
            await window.search('data-container');
            displayListData(JSON.parse(sessionStorage.getItem('searchResults')));
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
                clearMarkersAndOverlays();;
                await window.search('data-container');
                displayListData(JSON.parse(sessionStorage.getItem('searchResults')));
                searchBtn.disabled = false;
            }
        });
    }

    function clearMarkersAndOverlays() {
        console.log("clearMarkersAndOverlays 호출됨");
        if (Array.isArray(markers)) {
            markers.forEach(marker => marker.setMap(null));
            markers = [];
        }
        if (Array.isArray(overlays)) {
            overlays.forEach(overlay => overlay.setMap(null));
            overlays = [];
        }
    }


    // window.search 함수를 정의합니다.
    window.search = async function(containerId = 'data-container') {
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
                        { addr: { $regex: keyword, $options: 'i' } },
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
            window.clearMarkersAndOverlays();

            displayListData(data);
        } catch (error) {
            console.error('데이터를 불러오는 중 오류가 발생했습니다.', error);
        }
    };
});

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


