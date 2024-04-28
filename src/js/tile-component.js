// Call the function to populate the tile component and set focus afterward
populateTileComponent().then(() => {
    // Set focus to the first tile container when the page loads
    const tileContainers = document.querySelectorAll('.tile-container');
    if (tileContainers.length > 0) {
        tileContainers[0].focus();
        tileContainers[0].classList.add('active');
        setTimeout(loadDisneyReferenceBasedObjects, 2500);

        setTimeout((document.getElementById('disney-loader').style.display = 'none'), 5000)

    }
});


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

                let imgElement = document.createElement('img');
                imgElement.classList.add("tile-image");

                try {
                    imgElement = await loadImage(tileData.image.tile["1.78"].series.default.url);
                    imgElement.alt = tileData.text.title.full.series.default.content;
                } catch (err) {
                    try {
                        imgElement = await loadImage(tileData.image.tile["1.78"].program.default.url);
                        imgElement.alt = tileData.text.title.full.program.default.content;
                    } catch (e) {
                        try {
                            imgElement = await loadImage(tileData.image.tile["1.78"].default.default.url);
                            imgElement.alt = tileData.text.title.full.default.default.content;
                        } catch (ex) {
                            try {
                                imgElement = await loadImage(tileData.image.tile["1.78"].default.default.url)
                                imgElement.alt = tileData.text.title.full.collection.default.content;
                            } catch (er) {
                                console.log(er);
                            }
                        }
                    }
                }



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
                                //videoElement.style.display = 'none';
                                videoElement.pause();
                            });
                        }
                    }
                } catch (er) {
                    console.log(er);
                }

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

        setTimeout(() => {
            try {
                nextTile.querySelector('.tile-video').style.display = 'block';
                nextTile.querySelector('.tile-video').play();
                try {
                    nextTile.querySelector('.tile-image').style.display = 'none';
                } catch (err) { }
            } catch (err) { }
        }, "1000");
    }
});





// Function to open popup
function openPopupUp() {
    alert('open popup');
}

// Function to close popup
function closePopup() {
    alert('close');
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


                    titleContainer.tabIndex = 0; // Make tile focusable

                    let imgElement = document.createElement('img');
                    imgElement.classList.add("tile-image");

                    try {
                        imgElement = await loadImage(tileData.image.tile["1.78"].series.default.url);
                        imgElement.alt = tileData.text.title.full.series.default.content;
                    } catch (err) {
                        try {
                            imgElement = await loadImage(tileData.image.tile["1.78"].program.default.url);
                            imgElement.alt = tileData.text.title.full.program.default.content;
                        } catch (e) {
                            try {
                                imgElement = await loadImage(tileData.image.tile["1.78"].default.default.url);
                                imgElement.alt = tileData.text.title.full.default.default.content;
                            } catch (ex) {
                                try {
                                    imgElement = await loadImage(tileData.image.tile["1.78"].default.default.url)
                                    imgElement.alt = tileData.text.title.full.collection.default.content;
                                } catch (er) {
                                    console.log(er);
                                }
                            }
                        }
                    }



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
                                    //videoElement.style.display = 'none';
                                    videoElement.pause();
                                });
                            }
                        }
                    } catch (er) {
                        console.log(er);
                    }

                    titleContainer.appendChild(imgElement);
                    titlesBox.appendChild(titleContainer);
                }));
            } catch (err) { }
        }
    }

}

