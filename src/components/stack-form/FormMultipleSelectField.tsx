import React from "react";
import { Select, MenuItem, FormControl, FormHelperText, makeStyles } from "@material-ui/core";

type Value = string;

interface FormMultipleSelectFieldProps {
    label: string;
    values: Value[];
    options: Array<{ value: Value; label: string }>;
    onChange(values: Value[]): void;
}

export const FormMultipleSelectField: React.FC<FormMultipleSelectFieldProps> = React.memo(props => {
    const { label, values, options, onChange } = props;
    const classes = useStyles();

    return (
        <div>
            <FormControl className={classes.formControl} fullWidth>
                <FormHelperText>{label}</FormHelperText>

                <Select
                    multiple={true}
                    value={values}
                    onChange={ev => onChange(ev.target.value as Value[])}
                >
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
