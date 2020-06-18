import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const portainerUrl = process.env.REACT_APP_PORTAINER_URL2 || "/portainer";
ReactDOM.render(<App portainerUrl={portainerUrl} />, document.getElementById("root"));
