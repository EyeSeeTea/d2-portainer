import React from "react";
import { i18n } from "../../../i18n";
import { useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { D2Stack } from "../../../domain/entities/D2Stack";
import { D2NewStack } from "../../../domain/entities/D2NewStack";
import { StackFormWrapper } from "../../stack-form/StackFormWrapper";
import { showSnackbar } from "../../../utils/react-feedback";

interface EditStackPageProps {
    id: string;
}

const disabledFields: Array<keyof D2NewStack> = [
    "dataImage" as const,
    "coreImage" as const,
    "url" as const,
];

export const EditStackPage: React.FC<EditStackPageProps> = React.memo(props => {
    const history = useHistory();
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();
    const goToList = React.useCallback(() => history.push("/"), [history]);
    const [stack, setStack] = React.useState<D2Stack | undefined>();

    React.useEffect(() => {
        compositionRoot.stacks
            .getById(props.id, config)
            .then(showSnackbar(compositionRoot, snackbar, { action: setStack }));
    }, [compositionRoot, snackbar, goToList, props.id, config]);

    const update = React.useCallback(
        (stack: D2Stack) => {
            return compositionRoot.stacks.update(stack).then(
                showSnackbar(compositionRoot, snackbar, {
                    message: i18n.t("Stack updated"),
                    action: () => {
                        goToList();
                        return true;
                    },
                    actionError: () => false,
                })
            );
        },
        [compositionRoot, snackbar, goToList]
    );

    const title = i18n.t("Edit stack:") + (stack ? ` ${stack.dataImage}` : "");

    return (
        <StackFormWrapper
            title={title}
            saveLabel={i18n.t("Save")}
            save={update}
            disabledFields={disabledFields}
            stack={stack}
        />
    );
});
