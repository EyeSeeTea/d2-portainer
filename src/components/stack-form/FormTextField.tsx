import React from "react";
import { TextField } from "@material-ui/core";

interface FormTextFieldProps {
    label: string;
    value: string;
    onChange(value: string): void;
    autoFocus?: boolean;
    disabled?: boolean;
}

export const FormTextField: React.FC<FormTextFieldProps> = React.memo(props => {
    const { label, value, onChange, autoFocus = false, disabled = false } = props;

    return (
        <TextField
            margin="normal"
            autoFocus={autoFocus}
            required
            fullWidth
            disabled={disabled}
            label={label}
            onChange={ev => onChange(ev.currentTarget.value as string)}
            value={value}
        />
    );
});
