import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../i18n";

const useStyles = makeStyles(() => ({
    button: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
        height: 36,
        width: 140,
        borderRadius: 0,
        marginRight: 20,
        marginLeft: 0,
    },
}));

interface FormButtonProps {
    label: string;
    onClick(): void;
    isDisabled?: boolean;
}

export const FormButton: React.FC<FormButtonProps> = React.memo(props => {
    const classes = useStyles();
    const { label, isDisabled = false, onClick } = props;

    return (
        <Button
            onClick={onClick}
            variant="contained"
            disabled={isDisabled}
            className={classes.button}
        >
            {label}
        </Button>
    );
});
