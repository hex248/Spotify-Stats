import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const CLIENT_ID = "4bbbacdfdbd84049b16cdc4a4ad94260";
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

    useEffect(() => {
        if (window.location.hash) {
            const { access_token, expires_in, token_type } = getParams(window.location.hash);
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("expires_in", expires_in);
            localStorage.setItem("token_type", token_type);
            window.location = "/";
        }
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (localStorage.getItem("access_token") && !user) {
            axios
                .get("https://api.spotify.com/v1/me/", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("access_token"),
                    },
                })
                .then((res) => {
                    setUser(res.data);
                    console.log(user);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });

    return (
        <div className="App">
            <header className="App-header">
                <h1>spotify stats</h1>
            </header>
            {!localStorage.getItem("access_token") ? <button onClick={handleLogin}>login to spotify</button> : null}
            {user ? (
                <>
                    <h1>user: {user.display_name}</h1>
                </>
            ) : null}
        </div>
    );
}

export default App;
