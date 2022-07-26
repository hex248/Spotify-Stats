import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import ColourPicker from "./ColourPicker";

const CLIENT_ID = "b6183ff3b0984b71afeade1c61ce9b9f";
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-recently-played", "user-read-playback-state", "user-top-read", "user-read-currently-playing"];
const SCOPES_URI_PARAM = SCOPES.join("%20"); // connect scopes with spaces for use in url params

const getParams = (hash) => {
    const paramsStr = hash.substring(1).split("&");
    const params = paramsStr.reduce((accumulator, currentValue) => {
        const [key, value] = currentValue.split("=");
        accumulator[key] = value;
        return accumulator;
    }, {});

    return params;
};

function App() {
    const handleLogin = () => {
        window.location = `${SPOTIFY_AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${window.location}&scope=${SCOPES_URI_PARAM}&response_type=token&show_dialog=true`;
    };

    const [category, setCategory] = useState("tracks");
    const [timeRange, setTimeRange] = useState("short_term");
    const [fetched, setFetched] = useState(null);

    const [shortTermArtists, setShortTermArtists] = useState([]);
    const [mediumTermArtists, setMediumTermArtists] = useState([]);
    const [longTermArtists, setLongTermArtists] = useState([]);
    const [shortTermTracks, setShortTermTracks] = useState([]);
    const [mediumTermTracks, setMediumTermTracks] = useState([]);
    const [longTermTracks, setLongTermTracks] = useState([]);

    const [images, setImages] = useState([]);
    const [icons, setIcons] = useState([]);
    const [imagesReady, setImagesReady] = useState(null);

    const [imageBG, setImageBG] = useState("#1b1b1b");
    const [imageFG, setImageFG] = useState("#ffffff");

    useEffect(() => {
        if (window.location.hash) {
            const { access_token, expires_in, token_type } = getParams(window.location.hash);
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("expires_in", expires_in);
            localStorage.setItem("token_type", token_type);

            // remove hash from url
            window.location = "/";
        } else {
            if (localStorage.getItem("access_token") && !fetched) {
                fetchData();
            }
        }
        if (localStorage.getItem("access_token")) {
            // check if user can be fetched using token

            axios
                .get(`https://api.spotify.com/v1/me/`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("access_token"),
                    },
                })
                .then((res) => {})
                .catch((err) => {
                    console.log(err);
                    if (err.code === "ERR_BAD_REQUEST") {
                        // ask to login again
                        if (!window.location.hash) {
                            localStorage.clear();
                            window.location = "/";
                        }
                    }
                });
        }
    });

    useEffect(() => {
        let song = new Image();
        song.src = "icons/song.png";
        let artist = new Image();
        artist.src = "icons/person.png";
        let album = new Image();
        album.src = "icons/disc.png";

        setIcons([song, artist, album]);

        setImagesReady(false);
    }, []);

    const fetchData = () => {
        let tempData = {
            artists: {
                short_term: [],
                medium_term: [],
                long_term: [],
            },
            tracks: {
                short_term: [],
                medium_term: [],
                long_term: [],
            },
        };

        for (let key of Object.keys(tempData)) {
            for (let childKey of Object.keys(tempData[key])) {
                axios
                    .get(`https://api.spotify.com/v1/me/top/${key}?limit=50&time_range=${childKey}`, {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("access_token"),
                        },
                    })
                    .then((res) => {
                        tempData[key][childKey] = res.data.items;
                        if (key === "artists") {
                            switch (childKey) {
                                case "short_term":
                                    setShortTermArtists(res.data.items);
                                    break;
                                case "medium_term":
                                    setMediumTermArtists(res.data.items);
                                    break;
                                case "long_term":
                                    setLongTermArtists(res.data.items);
                                    break;
                                default:
                                    break;
                            }
                        } else if (key === "tracks") {
                            switch (childKey) {
                                case "short_term":
                                    setShortTermTracks(res.data.items);
                                    for (var index = 0; index < 10; index++) {
                                        let individualNum = `${index}`;
                                        fetch(res.data.items[index].album.images[1].url)
                                            .then((res) => res.blob())
                                            .then((blob) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    let img = new Image();
                                                    img.src = reader.result;
                                                    let tempImgs = images;
                                                    tempImgs.push({ img: img, id: parseInt(individualNum) });
                                                    setImages(tempImgs);
                                                    if (images.length >= 10) setImagesReady(true);
                                                };
                                                reader.readAsDataURL(blob);
                                            });
                                    }
                                    break;
                                case "medium_term":
                                    setMediumTermTracks(res.data.items);
                                    break;
                                case "long_term":
                                    setLongTermTracks(res.data.items);
                                    break;
                                default:
                                    break;
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        if (err.code === "ERR_BAD_REQUEST") {
                            // ask to login again
                            localStorage.clear();
                        }
                    });
            }
        }

        let allData = [tempData.artists.short_term, tempData.artists.medium_term, tempData.artists.long_term, tempData.tracks.short_term, tempData.tracks.medium_term, tempData.tracks.long_term];
        while (allData.includes([])) {
            allData = [tempData.artists.short_term, tempData.artists.medium_term, tempData.artists.long_term, tempData.tracks.short_term, tempData.tracks.medium_term, tempData.tracks.long_term];
        }
        setFetched(true);
    };

    const changeCategory = (eventData) => {
        const request = eventData.target.innerHTML.toLowerCase();
        if (["artists", "tracks"].includes(request)) {
            if (request !== category) {
                setCategory(request);
                setTimeRange("short_term");
            }
        } else if (request === "last month") {
            setTimeRange("short_term");
        } else if (request === "last 6 months") {
            setTimeRange("medium_term");
        } else if (request === "all time") {
            setTimeRange("long_term");
        }
    };

    const CategorySelection = () => {
        let displayStr = `Your top ${category} of`;
        if (timeRange === "short_term") {
            displayStr += " the last month";
        } else if (timeRange === "medium_term") {
            displayStr += " the last 6 months";
        } else if (timeRange === "long_term") {
            displayStr += " all time";
        }

        return (
            <div className="buttons">
                <div className="buttonContainer">
                    <button onClick={changeCategory} className="selection transition-0-3s">
                        Tracks
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3s">
                        Artists
                    </button>
                </div>
                <div className="buttonContainer">
                    <button onClick={changeCategory} className="selection transition-0-3s">
                        Last month
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3s">
                        Last 6 months
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3s">
                        All time
                    </button>
                </div>
                <h1>{displayStr}</h1>
            </div>
        );
    };

    const List = () => {
        if (!fetched && localStorage.getItem("access_token")) {
            return <Loading />;
        } else if (fetched && localStorage.getItem("access_token")) {
            let list = [];
            if (category === "artists") {
                switch (timeRange) {
                    case "short_term":
                        list = shortTermArtists;
                        break;
                    case "medium_term":
                        list = mediumTermArtists;
                        break;
                    case "long_term":
                        list = longTermArtists;
                        break;
                    default:
                        list = shortTermArtists;
                        break;
                }
                return (
                    <>
                        <CategorySelection />
                        <div className="container">
                            {list.map((artist, i) => (
                                <div className="artist transition-0-3s" key={i + artist.name}>
                                    <img src={artist.images[1].url} className="artistImg transition-0-3s" alt={""} />
                                    <a href={artist.external_urls.spotify} className="link transition-0-3s" target="_blank" rel="noreferrer">
                                        {i + 1}. {artist.name}
                                        <br />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                );
            } else if (category === "tracks") {
                switch (timeRange) {
                    case "short_term":
                        list = shortTermTracks;
                        break;
                    case "medium_term":
                        list = mediumTermTracks;
                        break;
                    case "long_term":
                        list = longTermTracks;
                        break;
                    default:
                        list = shortTermTracks;
                        break;
                }
                return (
                    <>
                        <CategorySelection />
                        <div className="container">
                            {list.map((track, i) => (
                                <div className="track transition-0-3s" key={i + track.name + " - " + track.artists[0].name}>
                                    <img src={track.album.images[1].url} className="trackImg transition-0-3s" alt={""} />

                                    <a href={track.external_urls.spotify} className="link transition-0-3s" target="_blank" rel="noreferrer">
                                        {i + 1}. {track.name} - {track.artists[0].name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                );
            }
        } else {
            return <></>;
        }
    };

    const canvasRef = useRef(null);

    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };

    const onBGColourChange = (colour) => {
        setImageBG(colour);
        GenerateImage({ bgColour: colour });
    };
    const onFGColourChange = (colour) => {
        setImageFG(colour);
        GenerateImage({ fgColour: colour });
    };

    const hexToRGB = (hex) => {
        var long = parseInt(hex.replace(/^#/, ""), 16);
        return {
            R: (long >>> 16) & 0xff,
            G: (long >>> 8) & 0xff,
            B: long & 0xff,
        };
    };

    const GenerateImage = (options) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.canvas.width = 1500;
        ctx.canvas.height = 2220;

        ctx.fillStyle = typeof options.bgColour === "string" ? options.bgColour : imageBG;
        ctx.roundRect(0, 0, canvas.width, canvas.height, 30).fill();
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        let imageSize = 200;
        let maxTextWidth = 1070;
        let fontFamily = "Montserrat";

        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = typeof options.fgColour === "string" ? options.fgColour : imageFG;
            ctx.roundRect(135, i * imageSize + 20 * (i + 1) - 5, imageSize + 10, imageSize + 10, 5).fill();

            let img = images.find((image) => image.id === i);
            ctx.drawImage(img.img, 140, i * imageSize + 20 * (i + 1), imageSize, imageSize);

            ctx.fillStyle = typeof options.fgColour === "string" ? options.fgColour : imageFG;

            let offsets = [
                { x: 355, y: -87 },
                { x: 358, y: -25 },
                { x: 358, y: 37 },
            ];

            for (let z = 0; z < icons.length; z++) {
                let iconSize = 45;
                let iconCanvas = document.createElement("canvas");
                let iconCtx = iconCanvas.getContext("2d");
                iconCanvas.width = iconSize;
                iconCanvas.height = iconSize;

                iconCtx.drawImage(icons[z], 0, 0, iconSize, iconSize);
                let originalPixels = iconCtx.getImageData(0, 0, iconSize, iconSize);
                let newPixels = iconCtx.getImageData(0, 0, iconSize, iconSize);

                let hexCode = typeof options.fgColour === "string" ? options.fgColour : imageFG;
                let newColour = hexToRGB(typeof options.fgColour === "string" ? options.fgColour : imageFG);
                console.log(hexCode);
                console.log(newColour);

                for (let x = 0; x < originalPixels.data.length; x += 4) {
                    if (newPixels.data[x + 3] > 0) {
                        newPixels.data[x] = newColour.R;
                        newPixels.data[x + 1] = newColour.G;
                        newPixels.data[x + 2] = newColour.B;
                    }
                }
                console.log(originalPixels);
                iconCtx.putImageData(newPixels, 0, 0);

                ctx.drawImage(iconCanvas, offsets[z].x, i * imageSize + 20 * (i + 1) + imageSize / 2 + offsets[z].y, iconSize, iconSize);
            }

            // number
            ctx.font = `normal normal 500 80px ${fontFamily}`;
            let x = 45;
            if (i === 0 || i === 9) {
                if (i === 0) x += 10;
                else if (i === 9) x -= 15;
                ctx.fillText(`${i + 1}`, x, i * imageSize + 20 * (i + 1) + imageSize / 2 + 30);
            } else {
                ctx.fillText(`${i + 1}`, x, i * imageSize + 20 * (i + 1) + imageSize / 2 + 30);
            }

            // song name
            ctx.font = `normal normal 500 45px ${fontFamily}`;
            let text = `${shortTermTracks[i].name}`;
            let textWidth = ctx.measureText(text).width;
            while (textWidth > maxTextWidth) {
                let textArr = text.split(" ");
                text = textArr.slice(0, textArr.length - 1).join(" ");
                textWidth = ctx.measureText(text).width;
            }

            ctx.fillText(text, 420, i * imageSize + 20 * (i + 1) + imageSize / 2 + -50);

            // artist name
            ctx.font = `normal normal 600 45px ${fontFamily}`;
            text = `${shortTermTracks[i].artists[0].name}`;
            textWidth = ctx.measureText(text).width;
            while (textWidth > maxTextWidth) {
                let textArr = text.split(" ");
                text = textArr.slice(0, textArr.length - 1).join(" ");
                textWidth = ctx.measureText(text).width;
            }
            ctx.fillText(text, 420, i * imageSize + 20 * (i + 1) + imageSize / 2 + 12);

            // album name
            ctx.font = `normal normal 700 45px ${fontFamily}`; // set font
            text = `${shortTermTracks[i].album.name}`; // set text to be displayed
            textWidth = ctx.measureText(text).width; // measure text width
            while (textWidth > maxTextWidth) {
                // while the text is wider than the maximum width
                let textArr = text.split(" "); // split the text into an array of words
                text = textArr.slice(0, textArr.length - 1).join(" ");
                textWidth = ctx.measureText(text).width;
            }

            ctx.fillText(text, 420, i * imageSize + 20 * (i + 1) + imageSize / 2 + 75);
        }

        ctx.font = `normal normal 700 80px ${fontFamily}`; // set font
        let txt = "oliverbryan.com";
        ctx.fillText(txt, ctx.canvas.width / 2 - ctx.measureText(txt).width / 2, 2305);

        setShowCanvas(true);
        document.getElementById("canvasDisplay").src = canvas.toDataURL();

        document.getElementById("imageContainer").style.removeProperty("display");
        document.getElementById("imageContainer").style.setProperty("max-height", "1000px");
    };

    const [showCanvas, setShowCanvas] = useState(null);

    const HideImage = () => {
        setShowCanvas(false);

        // document.getElementById("imageContainer").style.setProperty("display", "none");
        document.getElementById("imageContainer").style.setProperty("max-height", "0px");
    };

    useEffect(() => {
        document.getElementById("imageContainer").style.setProperty("max-height", "0px");
        // document.getElementById("imageContainer").style.setProperty("display", "none");
    }, []);
    const DownloadImage = () => {
        const canvas = canvasRef.current;

        const a = document.createElement("a");
        a.download = "top10month.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    };

    return (
        <div className="App">
            <header className="App-header noselect">
                <h1>Spotify Stats</h1>
            </header>
            {imagesReady && !showCanvas ? (
                <button className="generateButton transition-0-1s" onClick={GenerateImage}>
                    Show Image
                </button>
            ) : null}

            {imagesReady && showCanvas ? (
                <button className="hideButton transition-0-1s" onClick={HideImage}>
                    Hide Image
                </button>
            ) : null}
            <br />
            <br />
            <canvas ref={canvasRef} id={"canvas"} />
            <div id="imageContainer">
                <img id="canvasDisplay" src="" alt="" />
                <div id="imageControls">
                    <div className="picker">
                        <h1>Background Colour</h1>
                        <ColourPicker onChange={onBGColourChange} defaultColour={imageBG} />
                    </div>
                    <div className="picker">
                        <h1>Foreground Colour</h1>
                        <ColourPicker onChange={onFGColourChange} defaultColour={imageFG} />
                    </div>
                    <button className="downloadButton transition-0-1s" onClick={DownloadImage}>
                        Download Image
                    </button>
                </div>
            </div>
            <div className="Main">
                {!localStorage.getItem("access_token") ? (
                    <button className="loginButton transition-0-1s" onClick={handleLogin}>
                        Login
                    </button>
                ) : null}
                <List />
            </div>
            <br />
            <br />
        </div>
    );
}

export default App;
