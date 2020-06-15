import React from "react";
import { Select, MenuItem, FormControl, FormHelperText, makeStyles } from "@material-ui/core";

type Value = string;

export type Option = { value: string; label: string };

interface FormSelectFieldProps {
    label: string;
    value: Value | undefined;
    options: Option[];
    onChange(value: Value): void;
    disabled?: boolean;
}

export const FormSelectField: React.FC<FormSelectFieldProps> = React.memo(props => {
    const { label, value, options, onChange, disabled = false } = props;
    const classes = useStyles();

    return (
        <div>
            <FormControl className={classes.formControl} fullWidth disabled={disabled}>
                <FormHelperText>{label}</FormHelperText>

                <Select value={value} onChange={ev => onChange(ev.target.value as Value)}>
                    {options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
});

const useStyles = makeStyles(theme => ({
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: 120,
    },
}));
