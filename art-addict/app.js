// 작가 데이터
// 새로운 작가를 추가하려면 아래 배열에 객체를 추가하세요.
// 파일 경로는 자동으로 생성됩니다: artists/{name}/{name}_작가노트_2025(by블루로터스).docx
// hasNote: 작가노트 파일 존재 여부
// hasPress: 평론 파일 존재 여부  
// hasProfile: 프로필 파일 존재 여부
const artists = [
    { name: '김강용', hasNote: true, hasPress: false, hasProfile: true },
    { name: '김덕용', hasNote: true, hasPress: false, hasProfile: true },
    { name: '김은형', hasNote: true, hasPress: true, hasProfile: true },
    { name: '박현주', hasNote: true, hasPress: false, hasProfile: true },
    { name: '송윤주', hasNote: false, hasPress: false, hasProfile: true },
    { name: '안지용', hasNote: true, hasPress: false, hasProfile: true },
    { name: '이창남', hasNote: true, hasPress: false, hasProfile: true },
    { name: '홍성용', hasNote: true, hasPress: false, hasProfile: true },
    { name: '황혜선', hasNote: false, hasPress: false, hasProfile: true },
    // 새로운 작가 추가 예시:
    // { name: '새작가명', hasNote: true, hasPress: false, hasProfile: true }
];

// 현재 상태
let currentArtist = null;
let currentPressIndex = null;
let loadingArtist = null; // 현재 로딩 중인 작가 이름

// DOM 요소
const mainPage = document.getElementById('main-page');
const artistPage = document.getElementById('artist-page');
const pressDetailPage = document.getElementById('press-detail-page');
const menuToggle = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');
const artistList = document.getElementById('artist-list');
const backButton = document.getElementById('back-button');
const pressBackButton = document.getElementById('press-back-button');
const artistNameTitle = document.getElementById('artist-name');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initArtistList();
    initEventListeners();
    initRouting();
});

// 작가 목록 초기화
function initArtistList() {
    artistList.innerHTML = '';
    artists.forEach(artist => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = artist.name;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToArtist(artist.name);
            closeMenu();
        });
        li.appendChild(a);
        artistList.appendChild(li);
    });
}

// 이벤트 리스너 초기화
function initEventListeners() {
    menuToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });
    backButton.addEventListener('click', navigateToMain);
    pressBackButton.addEventListener('click', navigateToArtistFromPress);
    
    // 섹션 토글 버튼들
    document.querySelectorAll('.section-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            toggleSection(section);
        });
    });
}

// 라우팅 초기화
function initRouting() {
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
}

function handleRouting() {
    const hash = window.location.hash.slice(1);
    
    if (hash.startsWith('press/')) {
        const parts = hash.split('/');
        if (parts.length === 3) {
            const artistName = decodeURIComponent(parts[1]);
            const pressIndex = parseInt(parts[2]);
            showPressDetail(artistName, pressIndex);
            return;
        }
    }
    
    if (hash.startsWith('artist/')) {
        const artistName = decodeURIComponent(hash.replace('artist/', ''));
        navigateToArtist(artistName);
        return;
    }
    
    navigateToMain();
}

// 메뉴 토글
function toggleMenu() {
    menuOverlay.classList.toggle('active');
}

function closeMenu() {
    menuOverlay.classList.remove('active');
}

// 메인 페이지로 이동
function navigateToMain() {
    window.location.hash = '';
    mainPage.classList.add('active');
    artistPage.classList.remove('active');
    pressDetailPage.classList.remove('active');
    closeMenu();
}

// 작가 페이지로 이동
function navigateToArtist(name) {
    currentArtist = name;
    window.location.hash = `artist/${encodeURIComponent(name)}`;
    mainPage.classList.remove('active');
    artistPage.classList.add('active');
    pressDetailPage.classList.remove('active');
    
    artistNameTitle.textContent = name;
    loadArtistContent(name);
}

// 평론 상세에서 작가 페이지로 돌아가기
function navigateToArtistFromPress() {
    if (currentArtist) {
        navigateToArtist(currentArtist);
    } else {
        navigateToMain();
    }
}

// 파일 경로 생성 헬퍼 함수
function getFilePath(name, type) {
    // 현재 페이지의 base path를 가져옴
    let basePath = window.location.pathname;
    
    // index.html이 있는 디렉토리 경로 추출
    if (basePath.endsWith('/index.html') || basePath.endsWith('/')) {
        basePath = basePath.replace(/\/index\.html$/, '').replace(/\/$/, '');
    } else {
        basePath = basePath.substring(0, basePath.lastIndexOf('/'));
    }
    
    // 빈 경로인 경우 현재 디렉토리
    if (!basePath) {
        basePath = '.';
    }
    
    let fileName = '';
    if (type === 'note') {
        fileName = `${name}_작가노트_2025(by블루로터스).docx`;
    } else if (type === 'press') {
        fileName = `${name}_평론.docx`;
    } else if (type === 'profile') {
        fileName = `${name}_프로필_2025(by블루로터스).docx`;
    }
    
    // 상대 경로 사용 (로컬과 GitHub Pages 모두에서 작동)
    return `${basePath}/artists/${name}/${fileName}`;
}

// 작가 콘텐츠 로드
async function loadArtistContent(name) {
    const artist = artists.find(a => a.name === name);
    if (!artist) return;
    
    // 현재 로딩 중인 작가 설정
    loadingArtist = name;
    
    // 모든 섹션을 먼저 표시 (기본 상태)
    document.getElementById('about-section').classList.remove('hidden');
    document.getElementById('press-section').classList.remove('hidden');
    document.getElementById('cv-section').classList.remove('hidden');
    
    // 모든 섹션 콘텐츠 초기화
    document.getElementById('about-content').innerHTML = '';
    document.getElementById('press-content').innerHTML = '';
    document.getElementById('cv-content').innerHTML = '';
    
    // About Artist
    if (artist.hasNote) {
        const aboutContent = document.getElementById('about-content');
        aboutContent.innerHTML = '<div class="loading">로딩 중...</div>';
        await loadDocx(getFilePath(name, 'note'), aboutContent, name);
    } else {
        // 파일이 없으면 About Artist 섹션 숨기기
        document.getElementById('about-section').classList.add('hidden');
    }
    
    // 로딩 중 작가가 변경되었는지 확인
    if (loadingArtist !== name) return;
    
    // Press
    if (artist.hasPress) {
        const pressContent = document.getElementById('press-content');
        pressContent.innerHTML = '<div class="loading">로딩 중...</div>';
        const pressLoaded = await loadPressList(name, pressContent);
        // 파일이 없거나 로드 실패하면 Press 섹션 숨기기
        if (!pressLoaded) {
            document.getElementById('press-section').classList.add('hidden');
        }
    } else {
        // hasPress가 false면 Press 섹션 숨기기
        document.getElementById('press-section').classList.add('hidden');
    }
    
    // 로딩 중 작가가 변경되었는지 확인
    if (loadingArtist !== name) return;
    
    // CV
    if (artist.hasProfile) {
        const cvContent = document.getElementById('cv-content');
        cvContent.innerHTML = '<div class="loading">로딩 중...</div>';
        await loadDocx(getFilePath(name, 'profile'), cvContent, name);
    } else {
        // 파일이 없으면 CV 섹션 숨기기
        document.getElementById('cv-section').classList.add('hidden');
    }
    
    // 모든 섹션 닫기
    document.querySelectorAll('.section-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.section-toggle').forEach(button => {
        button.classList.remove('active');
    });
}

// .docx 파일 로드 및 변환
async function loadDocx(filePath, targetElement, expectedArtist) {
    try {
        console.log('파일 로드 시도:', filePath, '작가:', expectedArtist);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`파일을 불러올 수 없습니다: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        // 로딩 중 작가가 변경되었는지 확인 (다른 작가 페이지로 이동한 경우)
        if (expectedArtist && loadingArtist !== expectedArtist) {
            console.log('작가가 변경되어 콘텐츠 로드 취소:', expectedArtist, '->', loadingArtist);
            return; // 콘텐츠를 표시하지 않음
        }
        
        targetElement.innerHTML = result.value;
        
        // 에러가 있으면 표시
        if (result.messages.length > 0) {
            console.warn('변환 경고:', result.messages);
        }
    } catch (error) {
        // 로딩 중 작가가 변경되었는지 확인
        if (expectedArtist && loadingArtist !== expectedArtist) {
            console.log('작가가 변경되어 에러 처리 취소:', expectedArtist, '->', loadingArtist);
            return;
        }
        
        console.error('파일 로드 오류:', error);
        console.error('시도한 경로:', filePath);
        console.error('현재 URL:', window.location.href);
        
        let errorMessage = `콘텐츠를 불러올 수 없습니다: ${error.message}`;
        
        // CORS 오류인 경우 안내
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            if (window.location.protocol === 'file:') {
                errorMessage += '<br><br><strong>로컬 파일로 열면 작동하지 않습니다.</strong><br>로컬 개발 서버를 사용하세요:<br><code>python -m http.server 8000</code><br>또는<br><code>npx serve</code>';
            } else {
                errorMessage += '<br><br>파일 경로를 확인해주세요.';
            }
        }
        
        targetElement.innerHTML = `<div class="error">${errorMessage}</div>`;
    }
}

// Press 리스트 로드
// 반환값: 파일이 성공적으로 로드되었으면 true, 없으면 false
async function loadPressList(artistName, targetElement) {
    try {
        // 로딩 중 작가가 변경되었는지 확인
        if (loadingArtist !== artistName) {
            console.log('작가가 변경되어 Press 리스트 로드 취소:', artistName, '->', loadingArtist);
            return false;
        }
        
        const filePath = getFilePath(artistName, 'press');
        console.log('Press 파일 로드 시도:', filePath);
        const response = await fetch(filePath);
        if (!response.ok) {
            // 404 에러인 경우 파일이 없는 것으로 간주
            if (response.status === 404) {
                console.log('Press 파일을 찾을 수 없음 (404):', filePath);
                return false;
            }
            throw new Error(`파일을 불러올 수 없습니다: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        // 로딩 중 작가가 변경되었는지 다시 확인
        if (loadingArtist !== artistName) {
            console.log('작가가 변경되어 Press 리스트 표시 취소:', artistName, '->', loadingArtist);
            return false;
        }
        
        // HTML을 파싱하여 각 평론을 분리
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        const paragraphs = doc.querySelectorAll('p, h1, h2, h3');
        
        console.log('파싱된 단락 수:', paragraphs.length);
        
        if (paragraphs.length === 0) {
            // 평론이 없으면 false 반환하여 Press 섹션 숨기기
            console.log('평론 단락이 없음');
            return false;
        }
        
        // 평론을 그룹화: 제목(h1, h2, h3) 또는 첫 번째 단락을 제목으로
        const pressItems = [];
        let currentItem = null;
        
        paragraphs.forEach((para) => {
            const text = para.textContent.trim();
            if (!text) return;
            
            const tagName = para.tagName.toLowerCase();
            const isHeading = ['h1', 'h2', 'h3'].includes(tagName);
            
            if (isHeading || (!currentItem && tagName === 'p')) {
                // 새 평론 항목 시작
                if (currentItem) {
                    pressItems.push(currentItem);
                }
                currentItem = {
                    title: text,
                    content: [],
                    index: pressItems.length
                };
            } else if (currentItem) {
                // 현재 항목에 내용 추가
                currentItem.content.push(para.outerHTML);
            }
        });
        
        if (currentItem) {
            pressItems.push(currentItem);
        }
        
        // 평론이 하나도 없으면 모든 단락을 개별 항목으로 처리
        if (pressItems.length === 0) {
            paragraphs.forEach((para, index) => {
                const text = para.textContent.trim();
                if (text) {
                    pressItems.push({
                        title: text.length > 60 ? text.substring(0, 60) + '...' : text,
                        content: [para.outerHTML],
                        index: index
                    });
                }
            });
        }
        
        console.log('평론 항목 수:', pressItems.length);
        
        if (pressItems.length === 0) {
            // 평론이 없으면 false 반환하여 Press 섹션 숨기기
            console.log('평론 항목이 없음');
            return false;
        }
        
        // 로딩 중 작가가 변경되었는지 다시 확인 (파싱 후)
        if (loadingArtist !== artistName) {
            console.log('작가가 변경되어 Press 리스트 표시 취소 (파싱 후):', artistName, '->', loadingArtist);
            return false;
        }
        
        const pressList = document.createElement('ul');
        pressList.className = 'press-list';
        
        pressItems.forEach((item) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = item.title;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                showPressDetail(artistName, item.index, item);
            });
            li.appendChild(a);
            pressList.appendChild(li);
        });
        
        // 평론 데이터 저장 (나중에 상세 페이지에서 사용)
        if (!window.pressData) {
            window.pressData = {};
        }
        window.pressData[artistName] = pressItems;
        
        // 최종 확인: 로딩 중 작가가 변경되었는지 확인
        if (loadingArtist !== artistName) {
            console.log('작가가 변경되어 Press 리스트 표시 취소 (최종):', artistName, '->', loadingArtist);
            return false;
        }
        
        console.log('Press 리스트 성공적으로 로드됨:', pressItems.length, '개 항목');
        targetElement.innerHTML = '';
        targetElement.appendChild(pressList);
        return true; // 성공적으로 로드됨
        
    } catch (error) {
        console.error('Press 리스트 로드 오류:', error);
        // 파일을 찾을 수 없는 경우 (404 등) false 반환
        if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
            return false;
        }
        targetElement.innerHTML = `<div class="error">평론을 불러올 수 없습니다: ${error.message}</div>`;
        return true; // 에러가 있지만 섹션은 표시
    }
}

// 평론 상세 페이지 표시
async function showPressDetail(artistName, pressIndex, pressItem = null) {
    currentArtist = artistName;
    currentPressIndex = pressIndex;
    window.location.hash = `press/${encodeURIComponent(artistName)}/${pressIndex}`;
    
    mainPage.classList.remove('active');
    artistPage.classList.remove('active');
    pressDetailPage.classList.add('active');
    
    const detailText = document.getElementById('press-detail-text');
    detailText.innerHTML = '<div class="loading">로딩 중...</div>';
    
    // 저장된 평론 데이터가 있으면 사용
    if (pressItem && window.pressData && window.pressData[artistName]) {
        const item = window.pressData[artistName][pressIndex];
        if (item) {
            document.getElementById('press-title').textContent = item.title;
            detailText.innerHTML = `<h2>${item.title}</h2>` + item.content.join('');
            return;
        }
    }
    
    // 저장된 데이터가 없으면 파일에서 다시 로드
    try {
        const response = await fetch(getFilePath(artistName, 'press'));
        if (!response.ok) {
            throw new Error(`파일을 불러올 수 없습니다: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        const paragraphs = doc.querySelectorAll('p, h1, h2, h3');
        
        // 평론 항목 재구성
        const pressItems = [];
        let currentItem = null;
        
        paragraphs.forEach((para) => {
            const text = para.textContent.trim();
            if (!text) return;
            
            const tagName = para.tagName.toLowerCase();
            const isHeading = ['h1', 'h2', 'h3'].includes(tagName);
            
            if (isHeading || (!currentItem && tagName === 'p')) {
                if (currentItem) {
                    pressItems.push(currentItem);
                }
                currentItem = {
                    title: text,
                    content: [],
                    index: pressItems.length
                };
            } else if (currentItem) {
                currentItem.content.push(para.outerHTML);
            }
        });
        
        if (currentItem) {
            pressItems.push(currentItem);
        }
        
        // 평론이 하나도 없으면 모든 단락을 개별 항목으로 처리
        if (pressItems.length === 0) {
            paragraphs.forEach((para, index) => {
                const text = para.textContent.trim();
                if (text) {
                    pressItems.push({
                        title: text.length > 60 ? text.substring(0, 60) + '...' : text,
                        content: [para.outerHTML],
                        index: index
                    });
                }
            });
        }
        
        if (pressItems[pressIndex]) {
            const item = pressItems[pressIndex];
            document.getElementById('press-title').textContent = item.title;
            detailText.innerHTML = `<h2>${item.title}</h2>` + item.content.join('');
        } else {
            document.getElementById('press-title').textContent = `${artistName} - 평론`;
            detailText.innerHTML = '<div class="error">평론을 찾을 수 없습니다.</div>';
        }
    } catch (error) {
        console.error('평론 상세 로드 오류:', error);
        document.getElementById('press-title').textContent = `${artistName} - 평론`;
        detailText.innerHTML = `<div class="error">평론을 불러올 수 없습니다: ${error.message}</div>`;
    }
}

// 섹션 토글
function toggleSection(section) {
    // 현재 작가 페이지에 있는지 확인
    if (!artistPage.classList.contains('active') || !currentArtist) {
        return;
    }
    
    // 로딩 중인 경우 토글하지 않음
    if (loadingArtist && loadingArtist !== currentArtist) {
        return;
    }
    
    const button = document.querySelector(`[data-section="${section}"]`);
    const content = document.getElementById(`${section}-content`);
    
    if (!button || !content) return;
    
    // 섹션이 숨겨져 있으면 토글하지 않음
    if (button.parentElement.classList.contains('hidden')) {
        return;
    }
    
    const isActive = content.classList.contains('active');
    
    if (isActive) {
        content.classList.remove('active');
        button.classList.remove('active');
    } else {
        // 다른 섹션 닫기
        document.querySelectorAll('.section-content').forEach(c => {
            c.classList.remove('active');
        });
        document.querySelectorAll('.section-toggle').forEach(b => {
            b.classList.remove('active');
        });
        
        // 현재 섹션 열기
        content.classList.add('active');
        button.classList.add('active');
    }
}

