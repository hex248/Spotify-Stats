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
        }
    });

    const Tracks = () => {
        const tracks = [
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2739904ecb0b1148a128bdd5e36", width: 640 }],
                    name: "Bad Habit",
                    release_date: "2022-06-29",
                },
                artists: [
                    {
                        name: "Steve Lacy",
                    },
                ],
                duration_ms: 232114,
                name: "Bad Habit",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b2737ebcdf74ea335847adc33e8e", width: 640 }],
                    name: "love you more than me",
                    release_date: "2022-07-01",
                },
                artists: [
                    {
                        name: "Montell Fish",
                    },
                ],
                duration_ms: 141081,
                name: "love you more than me",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273c0a163b0674c9aa242baea9e", width: 640 }],
                    name: "What Kind of Love",
                    release_date: "2014-03-03",
                },
                artists: [
                    {
                        name: "Childish Gambino",
                    },
                ],
                duration_ms: 242973,
                name: "What Kind of Love",
            },
            {
                album: {
                    images: [{ height: 640, url: "https://i.scdn.co/image/ab67616d0000b273ac4ebd092fa2cf210e4c8023", width: 640 }],
                    name: "Atlanta Millionaires Club",
                    release_date: "2019-05-24",
                },
                artists: [
                    {
                        name: "Faye Webster",
                    },
                ],
                duration_ms: 202653,
                name: "Kingston",
            },
        ];
        if (1 > 10) {
            return (
                <>
                    <button onClick={getTracks}>get tracks</button>
                    <div className="tracksContainer">
                        {tracks.map((track, i) => (
                            <div className="track" key={i + track.name + " - " + track.artists[0].name}>
                                <img src={track.album.images[0].url} />
                                <h1>
                                    {i + 1}. {track.name} - {track.artists[0].name}
                                </h1>
                            </div>
                        ))}
                    </div>
                </>
            );
        } else if (localStorage.getItem("access_token")) {
            if (shortTermTracks.length > 0) {
                console.log(JSON.stringify(shortTermTracks[0]));
                console.log(shortTermTracks);
                return (
                    <div className="tracksContainer">
                        {shortTermTracks.map((track, i) => (
                            <div className="track" key={i + track.name + " - " + track.artists[0].name}>
                                <img src={track.album.images[0].url} />
                                <h1>
                                    {i + 1}. {track.name} - {track.artists[0].name}
                                </h1>
                            </div>
                        ))}
                    </div>
                );
            } else return <button onClick={getTracks}>get tracks</button>;
        } else return <></>;
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>spotify stats</h1>
            </header>
            {!localStorage.getItem("access_token") ? <button onClick={handleLogin}>login to spotify</button> : null}
            <Tracks />
        </div>
    );
}

export default App;
