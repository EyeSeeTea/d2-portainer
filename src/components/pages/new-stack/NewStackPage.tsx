import React from "react";
import { i18n } from "../../../i18n";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import PageHeader from "../../page-header/PageHeader";
import { StackForm } from "../../stack-form/StackForm";
import { D2NewStack } from "../../../domain/entities/D2NewStack";
import { useAppContext } from "../../AppContext";

interface NewStackPageProps {}

export const NewStackPage: React.FC<NewStackPageProps> = React.memo(() => {
    const history = useHistory();
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [isCloseDialogOpen, setCloseDialogOpen] = React.useState(false);
    const title = i18n.t("Create new D2-Docker stack");
    const goToList = React.useCallback(() => history.push("/"), [history]);

    const save = React.useCallback(
        (data: D2NewStack) => {
            return compositionRoot.stacks.create(data).then(res =>
                res.match({
                    success: () => {
                        snackbar.success(i18n.t("D2Docker instance created"));
                        goToList();
                    },
                    error: snackbar.error,
                })
            );
        },
        [compositionRoot, snackbar, goToList]
    );

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

            <PageHeader
                title={title}
                onBackClick={() => setCloseDialogOpen(true)}
                helpText={undefined}
            />

            <StackForm onSave={save} onCancelRequest={() => setCloseDialogOpen(true)} />
        </React.Fragment>
    );
});
