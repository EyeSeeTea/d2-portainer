import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const portainerUrl = process.env.REACT_APP_PORTAINER_URL || "http://localhost:9000";
ReactDOM.render(<App portainerUrl={portainerUrl} />, document.getElementById("root"));
