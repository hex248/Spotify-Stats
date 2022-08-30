import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";

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
                    <button onClick={changeCategory} className="selection transition-0-3ms">
                        Tracks
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3ms">
                        Artists
                    </button>
                </div>
                <div className="buttonContainer">
                    <button onClick={changeCategory} className="selection transition-0-3ms">
                        Last month
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3ms">
                        Last 6 months
                    </button>
                    <button onClick={changeCategory} className="selection transition-0-3ms">
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
                                <div className="artist transition-0-3ms" key={i + artist.name}>
                                    <img src={artist.images[1].url} className="artistImg transition-0-3ms" alt={""} />
                                    <a href={artist.external_urls.spotify} className="link transition-0-3ms" target="_blank" rel="noreferrer">
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
                                <div className="track transition-0-3ms" key={i + track.name + " - " + track.artists[0].name}>
                                    <img src={track.album.images[1].url} className="trackImg transition-0-3ms" alt={""} />

                                    <a href={track.external_urls.spotify} className="link transition-0-3ms" target="_blank" rel="noreferrer">
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

    useEffect(() => {
        if (shortTermTracks.length > 0) {
            // GenerateImage();
        }
    }, [shortTermTracks]);

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

    const GenerateImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.canvas.width = 1500;
        ctx.canvas.height = 2350;

        ctx.fillStyle = "#C3B1E1";
        ctx.roundRect(0, 0, canvas.width, canvas.height, 30).fill();
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        let imageSize = 200;
        let maxTextWidth = 1070;

        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = "#042230";
            ctx.roundRect(135, i * imageSize + 20 * (i + 1) - 5, imageSize + 10, imageSize + 10, 5).fill();

            let img = images.find((image) => image.id === i);
            ctx.drawImage(img.img, 140, i * imageSize + 20 * (i + 1), imageSize, imageSize);

            ctx.fillStyle = "#000000";

            ctx.drawImage(icons[0], 355, i * imageSize + 20 * (i + 1) + imageSize / 2 + -87, 45, 45);
            ctx.drawImage(icons[1], 358, i * imageSize + 20 * (i + 1) + imageSize / 2 + -25, 45, 45);
            ctx.drawImage(icons[2], 358, i * imageSize + 20 * (i + 1) + imageSize / 2 + 37, 45, 45);

            // number
            ctx.font = "normal normal 600 80px Montserrat";
            let x = 45;
            if (i === 0 || i === 9) {
                if (i === 0) x += 10;
                else if (i === 9) x -= 15;
                ctx.fillText(`${i + 1}`, x, i * imageSize + 20 * (i + 1) + imageSize / 2 + 30);
            } else {
                ctx.fillText(`${i + 1}`, x, i * imageSize + 20 * (i + 1) + imageSize / 2 + 30);
            }

            // song name
            ctx.font = "normal normal 500 45px Montserrat";
            let text = `${shortTermTracks[i].name}`;
            let textWidth = ctx.measureText(text).width;
            while (textWidth > maxTextWidth) {
                let textArr = text.split(" ");
                text = textArr.slice(0, textArr.length - 1).join(" ");
                textWidth = ctx.measureText(text).width;
            }

            ctx.fillText(text, 420, i * imageSize + 20 * (i + 1) + imageSize / 2 + -50);

            // artist name
            ctx.font = "normal normal 600 45px Montserrat";
            text = `${shortTermTracks[i].artists[0].name}`;
            textWidth = ctx.measureText(text).width;
            while (textWidth > maxTextWidth) {
                let textArr = text.split(" ");
                text = textArr.slice(0, textArr.length - 1).join(" ");
                textWidth = ctx.measureText(text).width;
            }
            ctx.fillText(text, 420, i * imageSize + 20 * (i + 1) + imageSize / 2 + 12);

            // album name
            ctx.font = "normal normal 800 45px Montserrat"; // set font
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

        ctx.font = "normal normal 800 80px Montserrat"; // set font
        let txt = "oliverbryan.com :)";
        ctx.fillText(txt, ctx.canvas.width / 2 - ctx.measureText(txt).width / 2, 2305);

        var link = document.createElement("a");
        link.download = "month.png";
        link.href = canvas.toDataURL();
        // link.click();

        setShowCanvas(true);
        document.getElementById("canvasDisplay").src = canvas.toDataURL();
    };

    const [showCanvas, setShowCanvas] = useState(null);

    const HideImage = () => {
        setShowCanvas(false);
        document.getElementById("canvasDisplay").src = "";
    };

    return (
        <div className="App">
            <header className="App-header noselect">
                <h1>Spotify Stats</h1>
            </header>
            {imagesReady && !showCanvas ? (
                <button className="generateButton transition-0-1ms" onClick={GenerateImage}>
                    Show Image
                </button>
            ) : null}

            {imagesReady && showCanvas ? (
                <button className="hideButton transition-0-1ms" onClick={HideImage}>
                    Hide Image
                </button>
            ) : null}
            <br />
            <br />
            <div className="imageContainer">
                <canvas ref={canvasRef} id={"canvas"} />
                <img id="canvasDisplay" src="" />
            </div>
            <div className="Main">
                {!localStorage.getItem("access_token") ? (
                    <button className="loginButton transition-0-1ms" onClick={handleLogin}>
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
