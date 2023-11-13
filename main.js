const map_API_KEY = "f6a4e1ee7714fa35a1560cbaf26c3f54";
const API_KEY =
  "XrE%2FOpLYS333gaSIeDccqLn6acHP65bY4XycvhWJFIwHRnDQPwMlNNDkVNP%2FTrDk4%2FdtmkMh9eQU7ZnMLywj2A%3D%3D";
let map_url = new URL(
  `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${map_API_KEY}`
);
let url = new URL(
  `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${API_KEY}&numOfRows=10&MobileOS=ETC&MobileApp=hodootrip&arrange=O&listYN=Y&_type=json`
);
let mapX = 126.981611;
let mapY = 37.568477;
let SpotList = [];
let page = 1;
let totalCount = "";
const pageSize = 10;
let totalPages = "";
const areaCodes = [
  { name: "서울", code: 1 },
  { name: "인천", code: 2 },
  { name: "대전", code: 3 },
  { name: "대구", code: 4 },
  { name: "광주", code: 5 },
  { name: "부산", code: 6 },
  { name: "울산", code: 7 },
  { name: "세종", code: 8 },
  { name: "경기", code: 31 },
  { name: "강원", code: 32 },
  { name: "충북", code: 33 },
  { name: "충남", code: 34 },
  { name: "경북", code: 35 },
  { name: "경남", code: 36 },
  { name: "전북", code: 37 },
  { name: "전남", code: 38 },
  { name: "제주", code: 39 },
];
const contentTypeIds = [
  { name: "관광지", code: 12 },
  { name: "숙박", code: 32 },
  { name: "축제&행사", code: 15 },
  { name: "음식점", code: 39 },
];
let areaCode = "";
let contentTypeId = 12;
let searchInput = document.getElementById("search-input");
let searchButton = document.getElementsByClassName("searchButton");
const areaList = document.querySelectorAll("#areaCode-buttons button");
let positionList = [];
let markers = [];
let marker = "";
let pageInput = document.getElementById("pageInput");
let pageGoButton = document.getElementById("pageGoButton");
let navList = document.querySelectorAll(".nav-item a");
let headLine = document.getElementById("head-line");
let mapContainer = document.getElementById("map");
let options = {
  center: new kakao.maps.LatLng(37.568477, 126.981611),
  level: 6,
};
let map = new kakao.maps.Map(mapContainer, options);
const groupSize = 5;

navList.forEach((nav) => {
  nav.addEventListener("click", (event) => goNav(event));
});

searchInput.addEventListener("focus", () => {
  searchInput.value = "";
});
searchInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    search();
  }
});
areaList.forEach((areas) =>
  areas.addEventListener("click", (event) => getTripSpotByArea(event))
);
pageInput.addEventListener("focus", () => {
  pageInput.value = "";
});

const search = async () => {
  areaList.forEach((a) => {
    a.classList.remove("active");
  });
  let keyword = searchInput.value;
  if (keyword.length == 0) {
    alert("검색어를 입력하세요.");
  } else {
    headLine.innerHTML = "검색결과";
    areaCode = "";
    pageInput.value = "";
    page = 1;
    getTripSpot();
  }
};

const goNav = (e) => {
  searchInput.value = "";
  pageInput.value = "";
  headLine.innerHTML = e.target.innerText;
  contentTypeId = contentTypeIds.find(
    (a) => a.name == headLine.textContent
  ).code;
  areaList.forEach((a) => {
    a.classList.remove("active");
  });
  areaCode = "";
  page = 1;
  getTripSpot();
};

const getTripSpot = async () => {
  try {
    if (headLine.textContent == "검색결과") {
      keyword = searchInput.value;
      url = new URL(
        `http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&numOfRows=10&MobileOS=ETC&MobileApp=hodootrip&arrange=O&listYN=Y&_type=json&keyword=${keyword}`
      );
    } else {
      url = new URL(
        `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${API_KEY}&numOfRows=10&MobileOS=ETC&MobileApp=hodootrip&arrange=O&listYN=Y&_type=json`
      );
      url.searchParams.set("contentTypeId", contentTypeId);
    }
    url.searchParams.set("areaCode", areaCode);
    url.searchParams.set("pageNo", page);
    let rawData = await fetch(url);
    let data = await rawData.json();
    console.log("데이터", data);
    if (data.response.header.resultCode == "0000") {
      totalCount = data.response.body.totalCount;
      SpotList = data.response.body.items.item;
      console.log("리스트", SpotList);
      if (totalCount !== 0) {
        render();
        paginationRender();
        mapRender();
      } else {
        page = 0;
        paginationRender();
        throw new Error("일치하는 결과가 없습니다.");
      }
    } else {
      throw new Error(data.resultMsg);
    }
  } catch (error) {
    errorRender(error.message);
  }
};
getTripSpot();

const getTripSpotByArea = async (event) => {
  areaList.forEach((a) => {
    a.classList.remove("active");
  });
  pageInput.value = "";
  area = event.target.textContent;
  areaCode = areaCodes.find((a) => a.name == area).code;
  console.log(area, areaCode, contentTypeId);
  page = 1;
  event.target.classList.add("active");
  contentTypeId =
    headLine.textContent == "검색결과"
      ? ""
      : contentTypeIds.find((a) => a.name == headLine.textContent).code;
  getTripSpot();
};

const render = () => {
  let SpotHTML = SpotList.map((item) => {
    return `<div class="row spot-area">
        <div class="col-5">
          <img class="img-size" src="${
            item.firstimage2 ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU%22"
          }" />
        </div>
        <div class="col-7 spot-story">
          <div class="spot-title" onclick="mapCenter(${item.mapy}, ${
      item.mapx
    })">${item.title}</div>
          <div class="spot-text">${item.addr1}</div>
          <div class="spot-text ${item.tel.length === 0 ? "disabled" : ""}">${
      item.tel
    }</div>
        </div>
      </div>`;
  }).join("");

  document.getElementById("Spot-board").innerHTML = SpotHTML;
};

const mapCenter = (a, b) => {
  latlng = new kakao.maps.LatLng(a, b);
  return map.setCenter(latlng);
};

const errorRender = (errorMessage) => {
  pageInput.value = "";
  const errorHTML = `<div class="alert alert-danger" role="alert">
  ${errorMessage}
</div>`;
  document.getElementById("Spot-board").innerHTML = errorHTML;
};

const paginationRender = () => {
  totalPages = Math.ceil(totalCount / pageSize);
  const pageGroup = Math.ceil(page / groupSize);
  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPages) {
    lastPage = totalPages;
  }
  let firstPage =
    lastPage - (groupSize - 1) < 1 ? 1 : lastPage - (groupSize - 1);

  let pageHTML = "";

  if (totalPages > 5) {
    pageHTML += `<li class="page-item"><a class="page-link ${
      page <= 1 ? "disabled" : ""
    }"" aria-label="Previous" onclick="moveToPage(1)"><span aria-hidden="true">&lt;&lt;</span></a></li><li class="page-item"><a class="page-link ${
      page <= 1 ? "disabled" : ""
    }" aria-label="Previous" onclick="moveToPage(${
      page - 1
    })"><span aria-hidden="true">&lt;</span></a></li>`;
  }

  for (i = firstPage; i <= lastPage; i++) {
    pageHTML += `<li class="page-item"><a class="page-link page-item ${
      i === page ? "active" : ""
    }" onclick="moveToPage(${i})">${i}</a></li>`;
  }

  if (lastPage < totalPages) {
    pageHTML += `<li class="page-item">
      <a class="page-link ${
        page == totalPages ? "disabled" : ""
      }" aria-label="Next" onclick="moveToPage(${page + 1})">
        <span aria-hidden="true">&gt;</span>
      </a></li><li class="page-item"><a class="page-link ${
        page == totalPages ? "disabled" : ""
      }" aria-label="Next" onclick="moveToPage(${totalPages})">
        <span aria-hidden="true">&gt;&gt;</span>
      </a>
    </li>`;
  }

  document.querySelector(".pagination").innerHTML = pageHTML;
  document.querySelector(".total-count").innerHTML = `<strong>${totalCount}</strong>개의 결과가 있습니다.`
};

pageGoButton.addEventListener("click", () => {
  pageInput = document.getElementById("pageInput");
  totalPages = Math.ceil(totalCount / pageSize);
  if ((pageInput.valueAsNumber > 0) & (pageInput.valueAsNumber <= totalPages)) {
    moveToPage(pageInput.valueAsNumber);
    console.log(page);
  } else {
    alert("페이지를 확인해주세요.");
  }
});

const moveToPage = (pageNum) => {
  page = pageNum;
  console.log("페이지넘기자", page);
  getTripSpot();
};

const mapRender = () => {
  markers.forEach((marker) => marker.setMap(null));
  positionList = SpotList.map((item) => {
    return {
      title: `${item.title}`,
      latlng: new kakao.maps.LatLng(`${item.mapy}`, `${item.mapx}`),
    };
  });
  console.log("좌표들", positionList);

  positionList.map((p) => {
    marker = new kakao.maps.Marker({
      map: map,
      position: p.latlng,
      title: p.title,
    });
    let infowindow = new kakao.maps.InfoWindow({
      content: p.title, // 인포윈도우에 표시할 내용
    });
    kakao.maps.event.addListener(
      marker,
      "mouseover",
      makeOverListener(map, marker, infowindow)
    );
    kakao.maps.event.addListener(
      marker,
      "mouseout",
      makeOutListener(infowindow)
    );
    return markers.push(marker);
  });
  map.setCenter(positionList[0].latlng);
};

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
function makeOverListener(map, marker, infowindow) {
  return function () {
    infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}
