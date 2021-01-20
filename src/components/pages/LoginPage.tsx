import React from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import MuiContainer from "@material-ui/core/Container";

import { useAppContext } from "../AppContext";
import { UserSession } from "../../domain/entities/UserSession";
import { i18n } from "../../i18n";
import { Grow } from "@material-ui/core";
import logoImage from "../../images/D2-Docker-Logo.png";
import baseConfig from "../../config";

/* From https://react.school/material-ui/templates */

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    feedback: {
        textAlign: "center",
        backgroundColor: "#F88",
        padding: 5,
    },
}));

interface LoginPageProps {
    setUserSession: (user: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = React.memo(props => {
    const { setUserSession } = props;
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const fieldsFilled = username.trim() && password.trim();
    const portainerUrl = React.useMemo(() => compositionRoot.dataSource.info().url, [
        compositionRoot,
    ]);

    const login = React.useCallback(async () => {
        if (fieldsFilled) {
            setError("");
            const login = await compositionRoot.dataSource.login(
                username.trim(),
                password.trim(),
                baseConfig.endpointName
            );
            login.match({ success: setUserSession, error: setError });
        }
    }, [compositionRoot, username, password, setUserSession, fieldsFilled]);

    const loginIfEnter = React.useCallback(
        (ev: React.KeyboardEvent<HTMLDivElement>) => {
            if (ev.key === "Enter" && fieldsFilled) login();
        },
        [login, fieldsFilled]
    );

    return (
        <MuiContainer component="main" maxWidth="xs">
            <CssBaseline />

            <div className={classes.paper}>
                <img src={logoImage} alt="Logo" width="100" height="100" />

                <Typography component="h1" variant="h5">
                    {baseConfig.appName} - {i18n.t("Sign in")}
                </Typography>
                <div className={classes.form}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label={i18n.t("Username")}
                        name="username"
                        autoFocus
                        onChange={ev => setUsername(ev.currentTarget.value)}
                        value={username}
                        onKeyPress={loginIfEnter}
                    />

                    <TextField
                        type="password"
                        autoComplete="current-password"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={i18n.t("Password")}
                        value={password}
                        onChange={ev => setPassword(ev.currentTarget.value)}
                        onKeyPress={loginIfEnter}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={login}
                    >
                        {i18n.t("Sign In")}
                    </Button>

                    <a
                        style={{ textAlign: "center", textDecoration: "none", display: "block" }}
                        href={portainerUrl}
                    >
                        {i18n.t("Portainer access")}
                    </a>

                    <Grow in={!!error}>
                        <div className={classes.feedback}>{error}</div>
                    </Grow>
                </div>
            </div>
        </MuiContainer>
    );
});
