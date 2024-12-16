var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(37.500716, 127.036539), // 초기 지도 중심 좌표
        level: 3, // 지도 확대 레벨
        draggable: true // 드래그 허용 설정
    };


let kakaoMapInitialized = false;
    
document.addEventListener('DOMContentLoaded', function() {
    if (kakaoMapInitialized) return; // 이미 초기화되었으면 리턴
    kakaoMapInitialized = true;

    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            currentLocation = new kakao.maps.LatLng(lat, lng);

            map.setCenter(currentLocation);
            firstSearch = false; // 첫 검색 완료로 설정
            watchCurrentLocation(); // 위치 추적 시작
        }, function(error) {
            console.error('Error occurred. Error code: ' + error.code);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
});

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도 생성
var geocoder = new kakao.maps.services.Geocoder(); // 주소-좌표 변환 객체 생성

var markers = []; // 기존 마커들을 저장할 배열
var overlays = []; // 기존 커스텀 오버레이를 저장할 배열
var toggleOverlays = []; // 토글 아이콘 오버레이들을 저장할 배열
let firstSearch = true; // 첫 번째 검색 여부
let toggledOverlays = new Map(); // 토글된 오버레이 상태를 저장할 Map

// 인포윈도우 내용 생성
function createInfoWindowContent(name, addr, tel, rank, detail, violation) {
    let starImg = '';
    switch (rank) {
        case '매우우수':
            starImg = './css/images/3star.svg';
            break;
        case '우수':
            starImg = './css/images/2star.svg';
            break;
        case '좋음':
            starImg = './css/images/1star.svg';
            break;
        default:
            starImg = '';
    }

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

    const infoWindowClass = violation ? 'custom-info-window violation' : 'custom-info-window';

    const detailImage = detail ? '<img src="./css/images/alert_circle_outline_icon_red.png" alt="Warning Icon" class="warning-icon">' : '';
    const additionalImage = (!detail && !starImg) ? '<img src="./css/images/logo.png" alt="Mobam Icon" class="mobam-icon">' : '';

    return `
        <div class="${infoWindowClass}";">
            <h4 class="info-title">${name} ${detailImage} ${additionalImage}</h4>
            <div class="info-address">${addr}</div>
            <div class="info-phone">${tel}</div>
            <div class="info-rating">
                <span class="rank-text">${rank}</span>
                <img src="${starImg}" alt="${rank}">
            </div>
            <div class="info-detail">${detail}</div>
        </div>
    `;
}

// 기존 마커와 오버레이를 제거하는 함수
function clearMarkersAndOverlays() {
    if (Array.isArray(markers)) {
        markers.forEach(marker => marker.setMap(null));

    }

    if (Array.isArray(overlays)) {
        overlays.forEach(overlay => overlay.setMap(null));

    }

    if (Array.isArray(toggleOverlays)) {
        toggleOverlays.forEach(overlay => overlay.setMap(null));

    }
}

// 마커와 오버레이를 생성하고 배열에 저장하는 함수
function searchAndDisplayAddress(data, shouldRecenter) {
    if (!data.addr || data.addr.trim() === "") {
        console.error('Invalid address:', data.addr);
        return;
    }
    geocoder.addressSearch(data.addr, function(result, status) {
        
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            var imageSrc = data.violation ? './css/images/violation_marker.svg' : './css/images/map_marker.svg';

            var markerImage = new kakao.maps.MarkerImage(imageSrc, new kakao.maps.Size(36, 41), {
                offset: new kakao.maps.Point(18, 41)
            });

            var marker = new kakao.maps.Marker({
                map: map,
                position: coords,
                image: markerImage
            });

            var infowindowContent = createInfoWindowContent(data.name, data.addr, data.tel, data.rank, data.detail, data.violation);
            var infowindow = new kakao.maps.CustomOverlay({
                position: coords,
                content: infowindowContent,
                yAnchor: 1
            });

            markers.push(marker);
            overlays.push(infowindow);

            // 인포윈도우에 클릭 이벤트 추가
            infowindow.a.classList.add('clickable-overlay');
            infowindow.a.addEventListener('click', function() {
                if (infowindow.getMap()) {
                    infowindow.setMap(null);
                    showToggleIcon(coords, infowindow);
                }
            });

            // 기본적으로 모든 오버레이를 맵에 추가
            marker.setMap(map);
            infowindow.setMap(map);

            if (shouldRecenter) {
                map.setCenter(coords);
            }
        } else {
            console.error('Failed to search address:', data.addr, status);
        }
    });
}

// 토글 아이콘을 표시하는 함수
function showToggleIcon(position, infowindow) {
    
    var toggleIconContent = document.createElement('div');
    toggleIconContent.className = 'info-toggle';
    toggleIconContent.innerHTML = '<img src="./css/images/info_toggle.png" class="info-toggle" alt="Toggle Icon" style=width:40px height:40px>';

    // 인라인 스타일 추가
    toggleIconContent.style.position = 'absolute';
    toggleIconContent.style.left = '50%';
    toggleIconContent.style.bottom = '35px';
    toggleIconContent.style.transform = 'translateX(-51%)';

    var toggleIconOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: toggleIconContent,
        yAnchor: 10,
        xAnchor: 0.5,
        zIndex: -1
    });

    // 토글 아이콘 클릭 이벤트 추가
    toggleIconContent.addEventListener('click', function() {
        infowindow.setMap(map);
        toggleIconOverlay.setMap(null);
    });

    toggleIconOverlay.setMap(map);
    toggleOverlays.push(toggleIconOverlay);
}

// 마커와 오버레이를 지도에 표시하는 함수
function displayMarkersAndOverlays() {
    markers.forEach(marker => marker.setMap(map));
    overlays.forEach(overlay => overlay.setMap(map));
    toggleOverlays.forEach(overlay => overlay.setMap(map));
}

// 지도 중심 좌표를 반환하는 함수
function getMapCenter() {
    return map.getCenter();
}

// 두 지점 사이의 거리를 계산하는 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구의 반지름 (km 단위)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat) / 2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

// 검색 결과를 거리 기준으로 정렬하는 함수
function sortResultsByDistance(results, center) {
    return results.sort((a, b) => {
        const distanceA = calculateDistance(center.getLat(), center.getLng(), a.lat, a.lng);
        const distanceB = calculateDistance(center.getLat(), center.getLng(), b.lat, b.lng);
        return distanceA - distanceB;
    });
}

const MAX_MARKERS = 40; // 기본 최대 마커 수
let zoomLevel = map.getLevel(); // 초기 줌 레벨

// 오버레이의 가시성을 업데이트하는 함수
// function updateOverlaysVisibility() {
//     overlays.forEach(overlay => {
//         if (!Array.from(toggledOverlays.values()).includes(overlay)) {
//             if (zoomLevel > 7) {
//                 overlay.setMap(null); // 줌 레벨이 높으면 인포윈도우 숨기기
//             } else {
//                 overlay.setMap(map); // 줌 레벨이 낮으면 인포윈도우 보이기
//             }
//         }
//     });

//     toggleOverlays.forEach(overlay => {
//         overlay.setMap(map);
//     });
// }

// 현재 위치를 표시하는 오버레이
let currentLocation = null;
var currentLocationOverlay = new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(0, 0),
    content: '<div id="current-location-circle"></div>',
    yAnchor: 0.5,
    xAnchor: 0.5
});

currentLocationOverlay.setMap(map);

// 지도를 현재 위치로 재설정하는 함수
function recenterMap() {
    if (currentLocation) {
        map.setCenter(currentLocation);
    } else {
        console.error('Current location is not available.');
    }
}

// 지도 중심을 이동시키는 함수
function moveMapCenter(address) {
    if (!address || address.trim() === "") {
        console.error('Invalid address:', address);
        return;
    }
    geocoder.addressSearch(address, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            map.setCenter(coords); // 지도 중심을 클릭된 주소로 이동
        } else {
            console.error('Failed to search address:', address, status);
        }
    });
}

// 현재 위치를 지속적으로 추적하는 함수
function watchCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            currentLocation = new kakao.maps.LatLng(lat, lng);

            currentLocationOverlay.setPosition(currentLocation);
            if (firstSearch) {
                map.setCenter(currentLocation);
                firstSearch = false;
            }
        }, function(error) {
            console.error('Error occurred. Error code: ' + error.code);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

document.getElementById('recenter-btn').addEventListener('click', recenterMap);

// watchCurrentLocation();

// // 지도 줌 레벨 변경 시 오버레이 업데이트
// kakao.maps.event.addListener(map, 'zoom_changed', function() {
//     zoomLevel = map.getLevel();
//     updateOverlaysVisibility();
// });

// // 지도 중심 변경 시 오버레이 업데이트
// kakao.maps.event.addListener(map, 'center_changed', function() {
//     updateLocationOverlay();
// });

function updateLocationOverlay() {
    if (currentLocation) {
        currentLocationOverlay.setPosition(currentLocation);
    }
}




// 필요 함수들을 전역으로 노출
window.searchAndDisplayAddress = searchAndDisplayAddress;
window.clearMarkersAndOverlays = clearMarkersAndOverlays;
window.displayMarkersAndOverlays = displayMarkersAndOverlays;
window.moveMapCenter = moveMapCenter;
