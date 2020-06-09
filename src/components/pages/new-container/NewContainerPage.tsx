import React from "react";
import { i18n } from "../../../i18n";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import PageHeader from "../../page-header/PageHeader";
import { ContainerForm } from "../../container-form/ContainerForm";
import { D2NewContainer } from "../../../domain/entities/D2NewContainer";
import { useAppContext } from "../../AppContext";

interface NewContainerPageProps {}

export const NewContainerPage: React.FC<NewContainerPageProps> = React.memo(() => {
    const history = useHistory();
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [isCloseDialogOpen, setCloseDialogOpen] = React.useState(false);
    const title = i18n.t("Create new D2-Docker container");
    const goToList = React.useCallback(() => history.push("/"), [history]);

    const save = React.useCallback((data: D2NewContainer) => {
        return compositionRoot.containers.create(data).then(res =>
            res.match({
                success: () => {
                    snackbar.success(i18n.t("D2Docker instance created"));
                    goToList();
                },
                error: snackbar.error,
            })
        );
    }, []);

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

            <ContainerForm onSave={save} onCancelRequest={() => setCloseDialogOpen(true)} />
        </React.Fragment>
    );
});
