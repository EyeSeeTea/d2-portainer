import React from "react";
import { i18n } from "../../../i18n";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import PageHeader from "../../page-header/PageHeader";
import { StackForm } from "../../stack-form/StackForm";
import { useAppContext } from "../../AppContext";
import { CircularProgress } from "@material-ui/core";
import { D2EditStack } from "../../../domain/entities/D2EditStack";
import { D2NewStack } from "../../../domain/entities/D2NewStack";

interface EditStackPageProps {
    id: string;
}

const disabledFields: Array<keyof D2NewStack> = [
    "dataImage" as const,
    "coreImage" as const,
    "port" as const,
];

export const EditStackPage: React.FC<EditStackPageProps> = React.memo(props => {
    const history = useHistory();
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [isCloseDialogOpen, setCloseDialogOpen] = React.useState(false);
    const goToList = React.useCallback(() => history.push("/"), [history]);
    const [stack, setStack] = React.useState<D2EditStack | undefined>();
    const [formChanged, setFormChanged] = React.useState(false);

    const requestGoToList = React.useCallback(() => {
        formChanged ? setCloseDialogOpen(true) : goToList();
    }, [formChanged, setCloseDialogOpen, goToList]);

    React.useEffect(() => {
        compositionRoot.stacks.getEdit(props.id).then(res =>
            res.match({
                success: setStack,
                error: msg => {
                    // TODO: create a hook that joins goTo with snackbar
                    snackbar.error(msg);
                    goToList();
                },
            })
        );
    }, [compositionRoot, snackbar, goToList, props.id]);

    const update = React.useCallback(
        (stack: D2EditStack) => {
            return compositionRoot.stacks.update(stack).then(res =>
                res.match({
                    success: () => {
                        snackbar.success(i18n.t("D2Docker stack updated"));
                        goToList();
                    },
                    error: snackbar.error,
                })
            );
        },
        [compositionRoot, snackbar, goToList]
    );

    const title = i18n.t("Edit stack:") + (stack ? ` ${stack.dataImage}` : "");

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isCloseDialogOpen}
                onSave={goToList}
                onCancel={() => setCloseDialogOpen(false)}
                title={title}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={title} onBackClick={requestGoToList} helpText={undefined} />

            {stack ? (
                <StackForm<D2EditStack>
                    saveButtonLabel={i18n.t("Save")}
                    onSave={update}
                    disabledFields={disabledFields}
                    onCancelRequest={requestGoToList}
                    initialStack={stack}
                    onChange={() => setFormChanged(true)}
                />
            ) : (
                <CircularProgress />
            )}
        </React.Fragment>
    );
});
