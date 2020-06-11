import React from "react";
import { TextField } from "@material-ui/core";

interface FormTextFieldProps {
    label: string;
    value: string;
    onChange(value: string): void;
}

export const FormTextField: React.FC<FormTextFieldProps> = React.memo(props => {
    const { label, value, onChange } = props;

    return (
        <TextField
            margin="normal"
            required
            fullWidth
            autoFocus
            label={label}
            onChange={ev => ev.currentTarget.value as string}
            value={value}
        />
    );
});
