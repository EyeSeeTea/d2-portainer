import { Res } from "./types";
import { SnackbarState } from "d2-ui-components";

export function showFeedback<Value, Output>(
    snackbar: SnackbarState,
    options: {
        message?: string;
        action?: (value: Value) => Output;
        messageError?: string;
        actionError?: (error: string) => Output;
    }
) {
    return (response: Res<Value>): Output | undefined => {
        return response.match({
            success: value => {
                if (options.message) snackbar.success(options.message);
                if (options.action) return options.action(value);
            },
            error: error => {
                snackbar.error(options.messageError || error);
                if (options.actionError) return options.actionError(error);
            },
        });
    };
}
