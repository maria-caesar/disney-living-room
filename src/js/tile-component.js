// Call the function to populate the tile component and set focus afterward
populateTileComponent().then(() => {
    setTimeout(hideDisneyLoader, 3050);
    // Set focus to the first tile container when the page loads
    const tileContainers = document.querySelectorAll('.tile-container');
    if (tileContainers.length > 0) {
        tileContainers[0].focus();
        tileContainers[0].classList.add('active');
        setTimeout(loadDisneyReferenceBasedObjects, 2500);
    }
});

function hideDisneyLoader() {
    document.getElementById('disney-loader').style.display = 'none';
}

async function createImageElement(tileData) {
    let imgElement = document.createElement('img');
    imgElement.classList.add("tile-image");

    const sizes = Object.keys(tileData.image.tile);
    let srcSet = '', imgSizes = '';
    for (let size of sizes) {
        if (tileData.image.tile[size]) {
            const width = tileData.image.tile[size].series?.default?.masterWidth
                || tileData.image.tile[size].program?.default?.masterWidth
                || tileData.image.tile[size].default?.default?.masterWidth;
            const imageUrl = tileData.image.tile[size].series?.default?.url
                || tileData.image.tile[size].program?.default?.url
                || tileData.image.tile[size].default?.default?.url;
            const defaultImageURL = tileData.image.tile["1.78"].series?.default?.url
                || tileData.image.tile["1.78"].program?.default?.url
                || tileData.image.tile["1.78"].default?.default?.url;
            if (defaultImageURL) {
                imgElement = await loadImage(defaultImageURL);
                if (imageUrl) {
                    imgElement.alt = tileData.text.title.full.series?.default?.content
                        || tileData.text.title.full.program?.default?.url
                        || tileData.text.title.full.default?.default?.url
                        || tileData.text.title.full.collection?.default?.content;
                    imgElement.title = imgElement.alt;
                    const ImgWidth = Math.round(width * parseFloat(size));
                    srcSet += `${imageUrl} ${ImgWidth}w, `;
                    imgSizes += `${width}px, `;
                }
            }

        }
    }
    // Remove trailing comma and space
    srcSet = srcSet.slice(0, -2);
    imgSizes = imgSizes.slice(0, -2);
    try {
        imgElement.setAttribute('srcset', srcSet);
    } catch (err) { }
    try { imgElement.setAttribute('sizes', imgSizes); } catch (err) { }

    return imgElement;
}

async function createPictureElement(tileData) {
    // Create <picture> element
    const pictureElement = document.createElement('picture');

    // Create <source> elements
    const sizes = Object.keys(tileData.image.tile);
    let srcSet = '';
    for (let size of sizes) {
        if (tileData.image.tile[size]) {
            const width = tileData.image.tile[size].series?.default?.masterWidth
                || tileData.image.tile[size].program?.default?.masterWidth
                || tileData.image.tile[size].default?.default?.masterWidth;
            const imageUrl = tileData.image.tile[size].series?.default?.url
                || tileData.image.tile[size].program?.default?.url
                || tileData.image.tile[size].default?.default?.url;
            if (imageUrl) {
                const sourceElement = document.createElement('source');
                sourceElement.setAttribute('media', `(min-width: ${width}px)`);
                sourceElement.setAttribute('srcset', imageUrl);
                pictureElement.appendChild(sourceElement);

                srcSet += `${imageUrl} ${width}w, `;
            }
        }
    }

    const defaultImageURL = tileData.image.tile["1.78"].series?.default?.url
        || tileData.image.tile["1.78"].program?.default?.url
        || tileData.image.tile["1.78"].default?.default?.url;

    // Create <img> element
    const imgElement = await createImageElement(defaultImageURL);
    pictureElement.appendChild(imgElement);

    // Remove trailing comma and space
    srcSet = srcSet.slice(0, -2);

    // Set srcset attribute for <img> element
    imgElement.setAttribute('srcset', srcSet);

    return pictureElement;
}



async function createVideoElement(tileData, titleContainer) {
    try {
        if (tileData.videoArt.length > 0) {
            let videoElement = document.createElement('video');
            videoElement.classList.add("tile-video");
            if (tileData.videoArt[0].mediaMetadata.urls.length > 0) {
                videoElement.src = tileData.videoArt[0].mediaMetadata.urls[0].url;
                titleContainer.appendChild(videoElement);
                // Add an event listener to the video
                videoElement.addEventListener("ended", function () {
                    // Hide the video element and pause
                    videoElement.style.display = 'none';
                    videoElement.nextElementSibling.style.display = 'block';
                    videoElement.pause();
                });
            }
        }
    } catch (er) {
        console.log(er);
    }

}

let disneyGlobalSet;
// Function to populate the tile component
async function populateTileComponent() {
    // Fetch data from API or use provided data
    const response = await fetch('https://cd-static.bamgrid.com/dp-117731241344/home.json');
    const disneySet = await response.json();
    // Select the container to populate
    const container = document.querySelector('.tile-component');
    disneyGlobalSet = disneySet.data;
    // Update title
    await Promise.all(disneySet.data.StandardCollection.containers.map(async function (obj) {
        const titlesContainer = document.createElement('div');
        titlesContainer.classList.add('tiles-container');
        titlesContainer.setAttribute("data-nav-type", "list");
        if (obj.set.refId)
            titlesContainer.setAttribute("ref-id", obj.set.refId);

        const headingEle = document.createElement("h3");
        headingEle.classList.add("tile-header");
        headingEle.textContent = obj.set.text.title.full.set.default.content;

        const titlesBox = document.createElement('div');
        titlesBox.classList.add('tiles-box');

        titlesContainer.appendChild(headingEle);
        titlesContainer.appendChild(titlesBox);

        try {
            await Promise.all(obj.set.items.map(async tileData => {
                const titleContainer = document.createElement('div');
                titleContainer.classList.add('tile-container');
                titleContainer.setAttribute("data-nav-type", "tile");

                if (tileData.contentId)
                    titleContainer.setAttribute("contentId", tileData.contentId);
                else
                    titleContainer.setAttribute("collectionId", tileData.collectionId);


                titleContainer.tabIndex = 0; // Make tile focusable


                let imgElement = (await createImageElement(tileData));

                await createVideoElement(tileData, titleContainer);


                titleContainer.appendChild(imgElement);
                titlesBox.appendChild(titleContainer);
            }));
        } catch (err) { }


        container.prepend(titlesContainer);
    }));


}

// Function to load image
function loadImage(url) {
    return new Promise(function (resolve, reject) {
        var img = document.createElement('img');
        img.classList.add("tile-image");
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function () {
            reject(new Error("Image failed to load: " + url));
        };
        img.src = url;
    });
}

// Enable keyboard navigation between tiles
document.addEventListener('keydown', function (event) {
    closePopup();
    try {
        document.querySelector('.tile-video').pause();
        document.querySelector('.tile-video').style.display = 'none';
        document.querySelector('.tile-image').style.display = 'block';
    } catch (er) { }
    const activeTile = document.activeElement;
    if (!activeTile.classList.contains('tile-container')) return;
    let imageElement = activeTile.querySelector('.tile-image');
    let videoElement = activeTile.querySelector('.tile-video');
    let nextTile;
    switch (event.key) {
        case 'ArrowRight':
            nextTile = activeTile.nextElementSibling;
            try { imageElement.style.display = 'block'; } catch (er) { }
            try {
                videoElement.style.display = 'none';
                videoElement.pause();
            } catch (err) { }
            break;
        case 'ArrowLeft':
            nextTile = activeTile.previousElementSibling;
            try { imageElement.style.display = 'block'; } catch (er) { }
            try {
                videoElement.style.display = 'none';
                videoElement.pause();
            } catch (err) { }
            break;
        case 'ArrowDown':
            nextTile = activeTile.parentElement.parentElement.nextElementSibling.querySelector('.tile-container');
            try { imageElement.style.display = 'block'; } catch (er) { }
            try {
                videoElement.style.display = 'none';
                videoElement.pause();
            } catch (err) { }
            break;
        case 'ArrowUp':
            nextTile = activeTile.parentElement.parentElement.previousElementSibling.querySelector('.tile-container');
            try { imageElement.style.display = 'block'; } catch (er) { }
            try {
                videoElement.style.display = 'none';
                videoElement.pause();
            } catch (err) { }
            break;
        case 'Enter':
            openPopupUp();
            break;
        case 'Escape':
        case 'Backspace':
        case 'Back':
            closePopup();
            break;
        default:
            return; // Exit if key is not supported
    }

    if (nextTile) {
        activeTile.classList.remove('active');
        nextTile.focus(); // Move focus to the next tile
        // Scroll into view if necessary
        nextTile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        nextTile.classList.add('active');

        try {
            nextTile.querySelector('.tile-video').style.display = 'block';
            nextTile.querySelector('.tile-video').play();
            try {
                nextTile.querySelector('.tile-image').style.display = 'none';
            } catch (err) { }
        } catch (err) { }
    }
});


// Function to open popup
function openPopupUp() {
    $('#disney-no-details').hide();
    const activeTile = document.activeElement;
    let popupData;
    disneyGlobalSet.StandardCollection.containers.every(function (obj) {
        try {
            let contentId = activeTile.getAttribute('contentId');
            popupData = obj.set.items.find(item => item.contentId === contentId);
        } catch (err) {
            let collectionId = activeTile.getAttribute('collectionId');
            try {
                popupData = obj.set.items.find(item => item.collectionId === collectionId);
            } catch (ex) { }
        }
        if (popupData) return false;
    }
    );
    try {
        $('#cover-image')[0].src = (popupData.image.hero_collection["1.78"].series.default.url);
        $('#title-image')[0].src = (popupData.image.title_treatment["1.78"].series.default.url);
        $('#movie-name')[0].innerText = popupData.text.title.full.series.default.content;
    } catch (err) {
        try {
            $('#cover-image')[0].src = (popupData.image.hero_collection["1.78"].program.default.url);
            $('#title-image')[0].src = (popupData.image.title_treatment["1.78"].program.default.url);
            $('#movie-name')[0].innerText = popupData.text.title.full.program.default.content;
        } catch (e) {
            try {
                $('#cover-image')[0].src = (popupData.image.hero_collection["1.78"].default.default.url);
                $('#title-image')[0].src = (popupData.image.title_treatment["1.78"].default.default.url);
                $('#movie-name')[0].innerText = popupData.text.title.full.default.default.content;
            } catch (ex) {
                try {
                    $('#cover-image')[0].src = (popupData.image.hero_collection["1.78"].default.default.url)
                    $('#title-image')[0].src = (popupData.image.title_treatment["1.78"].default.default.url)
                    $('#movie-name')[0].innerText = popupData.text.title.full.collection.default.content;
                } catch (er) {
                    $('#cover-image')[0].src = ("https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081");
                }
            }
        }
    }
    try {
        $('#movie-rating')[0].innerText = popupData.ratings[0].value;
        $('#movie-language')[0].innerText = popupData.currentAvailability.region;
        $('#release-date')[0].innerText = popupData.releases[0].releaseDate;
        $('#disney-details').show();
    } catch (ex) {
        $('#disney-no-details').show();
     }

}

// Function to close popup
function closePopup() {
    $('#disney-details').hide();
    $('#cover-image')[0].src = "";
    $('#movie-name')[0].innerText = "";
    $('#movie-rating')[0].innerText = "";
    $('#movie-language')[0].innerText = "";
    $('#release-date')[0].innerText = "";
    $('#disney-no-details').hide();

}



async function loadDisneyReferenceBasedObjects() {
    var allTiles = document.querySelectorAll('.tiles-container');
    for (var i = 0; i < allTiles.length; i++) {
        if (allTiles[i].hasAttribute("ref-id")) {
            var refId = (allTiles[i].getAttribute("ref-id"));
            const response = await fetch('https://cd-static.bamgrid.com/dp-117731241344/sets/' + refId + '.json');
            const disneySet = await response.json();

            var obj = disneySet.data.PersonalizedCuratedSet ? disneySet.data.PersonalizedCuratedSet : disneySet.data.CuratedSet;
            obj = obj ? obj : disneySet.data.TrendingSet;

            const titlesContainer = allTiles[i];
            const titlesBox = allTiles[i].childNodes[1];
            try {
                await Promise.all(obj.items.map(async tileData => {
                    const titleContainer = document.createElement('div');
                    titleContainer.classList.add('tile-container');
                    titleContainer.setAttribute("data-nav-type", "tile");
                    if (tileData.contentId)
                        titleContainer.setAttribute("contentId", tileData.contentId);
                    else
                        titleContainer.setAttribute("collectionId", tileData.collectionId);


                    titleContainer.tabIndex = 0; // Make tile focusable

                    let imgElement = (await createImageElement(tileData));
                    await createVideoElement(tileData, titleContainer);

                    titleContainer.appendChild(imgElement);
                    titlesBox.appendChild(titleContainer);

                }));
            } catch (err) { }
        }
    }

}
