import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { useAppContext } from "../AppContext";
import { User } from "../../domain/entities/User";
import { i18n } from "../../i18n";
import { Grow } from "@material-ui/core";

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
    setCurrentUser: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = React.memo(props => {
    const { setCurrentUser } = props;
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const login = React.useCallback(async () => {
        setError("");
        const login = await compositionRoot.users.login(username, password);
        login.match({ success: setCurrentUser, error: setError });
    }, [compositionRoot, username, password, setCurrentUser]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>

                <Typography component="h1" variant="h5">
                    {i18n.t("Sign in")}
                </Typography>

                <form className={classes.form} noValidate>
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
                    />

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={i18n.t("Password")}
                        onChange={ev => setPassword(ev.currentTarget.value)}
                        type="password"
                        autoComplete="current-password"
                        value={password}
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

                    <Grow in={!!error}>
                        <div className={classes.feedback}>{error}</div>
                    </Grow>
                </form>
            </div>
        </Container>
    );
});
