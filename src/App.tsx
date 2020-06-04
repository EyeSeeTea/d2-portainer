import React from "react";
import { AppContextProvider } from "./components/AppContext";

interface AppProps {
    apiUrl: string;
}

const App: React.FC<AppProps> = props => {
    const { apiUrl } = props;

    return <AppContextProvider apiUrl={apiUrl}>Web app</AppContextProvider>;
};

export default React.memo(App);
