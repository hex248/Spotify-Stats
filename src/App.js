import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";

const CLIENT_ID = "b6183ff3b0984b71afeade1c61ce9b9f";
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-recently-played", "user-read-playback-state", "user-top-read", "user-read-currently-playing"];
const SCOPES_URI_PARAM = SCOPES.join("%20"); // connect scopes with spaces for use in url params

const getParams = (hash) => {
    const paramsStr = hash.substring(1).split("&");
    const params = paramsStr.reduce((accumulator, currentValue) => {
        console.log(currentValue);
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
                        if (key == "artists") {
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
                            }
                        } else if (key == "tracks") {
                            switch (childKey) {
                                case "short_term":
                                    setShortTermTracks(res.data.items);
                                    break;
                                case "medium_term":
                                    setMediumTermTracks(res.data.items);
                                    break;
                                case "long_term":
                                    setLongTermTracks(res.data.items);
                                    break;
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        if (err.code == "ERR_BAD_REQUEST") {
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
    }, []);

    const changeCategory = (eventData) => {
        const request = eventData.target.innerHTML.toLowerCase();
        if (["artists", "tracks"].includes(request)) {
            if (request != category) {
                setCategory(request);
                setTimeRange("short_term");
            }
        } else if (request == "last month") {
            setTimeRange("short_term");
        } else if (request == "last 6 months") {
            setTimeRange("medium_term");
        } else if (request == "all time") {
            setTimeRange("long_term");
        }
    };

    const CategorySelection = () => {
        let displayStr = `Your top ${category} of`;
        if (timeRange == "short_term") {
            displayStr += " the last month";
        } else if (timeRange == "medium_term") {
            displayStr += " the last 6 months";
        } else if (timeRange == "long_term") {
            displayStr += " all time";
        }

        return (
            <div className="buttons">
                <div className="buttonContainer">
                    <button onClick={changeCategory} className="selection transition-1ms">
                        Tracks
                    </button>
                    <button onClick={changeCategory} className="selection transition-1ms">
                        Artists
                    </button>
                </div>
                <div className="buttonContainer">
                    <button onClick={changeCategory} className="selection transition-1ms">
                        Last month
                    </button>
                    <button onClick={changeCategory} className="selection transition-1ms">
                        Last 6 months
                    </button>
                    <button onClick={changeCategory} className="selection transition-1ms">
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
            if (category == "artists") {
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
                }
                return (
                    <>
                        <CategorySelection />
                        <div className="container">
                            {list.map((artist, i) => (
                                <div className="artist transition-1ms" key={i + artist.name}>
                                    <img src={artist.images[1].url} className="artistImg transition-1ms" />
                                    <a href={artist.external_urls.spotify} className="link transition-1ms" target="_blank">
                                        {i + 1}. {artist.name}
                                        <br />({artist.genres.join(", ")})
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                );
            } else if (category == "tracks") {
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
                }
                return (
                    <>
                        <CategorySelection />
                        <div className="container">
                            {list.map((track, i) => (
                                <div className="track transition-1ms" key={i + track.name + " - " + track.artists[0].name}>
                                    <img src={track.album.images[1].url} className="trackImg transition-1ms" />

                                    <a href={track.external_urls.spotify} className="link transition-1ms" target="_blank">
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

    return (
        <div className="App">
            <header className="App-header noselect">
                <h1>Spotify Stats</h1>
            </header>
            <div className="Main">
                {!localStorage.getItem("access_token") ? <button onClick={handleLogin}>Login</button> : null}
                <List />
            </div>
        </div>
    );
}

export default App;
