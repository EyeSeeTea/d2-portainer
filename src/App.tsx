import React from "react";
import { AppContextProvider } from "./components/AppContext";
import { LoginPage } from "./components/pages/LoginPage";
import { User } from "./domain/entities/User";
import { RootPage } from "./components/pages/RootPage";
import { SnackbarProvider } from "d2-ui-components";

interface AppProps {
    portainerUrl: string;
}

const App: React.FC<AppProps> = React.memo(props => {
    const { portainerUrl } = props;
    const [currentUser, setCurrentUser] = React.useState<User | undefined>(getUserFromCookie);
    const value = { portainerUrl, currentUser };
    const setCurrentUserAndPersist = React.useCallback(
        user => {
            setCurrentUser(user);
            setUserCookie(user);
        },
        [setCurrentUser]
    );

    const logout = React.useCallback(() => {
        setCurrentUser(undefined);
        setUserCookie(undefined);
    }, [setCurrentUser]);

    return (
        <AppContextProvider value={value}>
            <SnackbarProvider>
                {currentUser ? (
                    <RootPage logout={logout} />
                ) : (
                    <LoginPage setCurrentUser={setCurrentUserAndPersist} />
                )}
            </SnackbarProvider>
        </AppContextProvider>
    );
});

const storageUserKey = "user";

function setUserCookie(user: User | undefined) {
    if (user) {
        const userJson = JSON.stringify(user);
        sessionStorage.setItem(storageUserKey, userJson);
    } else {
        sessionStorage.removeItem(storageUserKey);
    }
}

function getUserFromCookie(): User | undefined {
    const userJson = sessionStorage.getItem(storageUserKey);
    if (!userJson) return;
    try {
        return JSON.parse(userJson);
    } catch (e) {
        return;
    }
}

export default React.memo(App);
