import { CompositionRoot } from "./../CompositionRoot";
import { Res } from "./types";
import { SnackbarState } from "d2-ui-components";

export function showSnackbar<Value, Output>(
    compositionRoot: CompositionRoot,
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
                if (error.includes("Invalid JWT token")) {
                    compositionRoot.dataSource.logout();
                    window.location.reload();
                } else {
                    snackbar.error(options.messageError || error);
                    if (options.actionError) return options.actionError(error);
                }
            },
        });
    };
}
