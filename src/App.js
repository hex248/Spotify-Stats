import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

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

    const [shortTermTracks, setShortTermTracks] = useState([]);

    const getTracks = () => {
        //https://api.spotify.com/v1/tracks?limit=50&time_range=short_term
        axios
            .get("https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token"),
                },
            })
            .then((res) => {
                setShortTermTracks(res.data.items);
                console.log(shortTermTracks);
            })
            .catch((err) => {
                console.log(err);
            });
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
            if (localStorage.getItem("access_token") && shortTermTracks.length < 1) {
                getTracks();
            }
        }
    });

    return (
        <div className="App">
            <header className="App-header noselect">
                <h1>spotify stats</h1>
            </header>
            {!localStorage.getItem("access_token") ? <button onClick={handleLogin}>login to spotify</button> : null}
            {shortTermTracks.length < 1 ? null : (
                <div className="tracksContainer">
                    {shortTermTracks.map((track, i) => (
                        <div className="track" key={i + track.name + " - " + track.artists[0].name}>
                            <img src={track.album.images[0].url} />
                            <a href={track.external_urls.spotify} target="_blank">
                                {i + 1}. {track.name} - {track.artists[0].name}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
