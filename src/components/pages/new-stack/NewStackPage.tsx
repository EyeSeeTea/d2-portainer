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
    const { compositionRoot, isDev } = useAppContext();
    const snackbar = useSnackbar();
    const [isCloseDialogOpen, setCloseDialogOpen] = React.useState(false);
    const title = i18n.t("Create stack");
    const goToList = React.useCallback(() => history.push("/"), [history]);
    const [formChanged, setFormChanged] = React.useState(false);

    const requestGoToList = React.useCallback(() => {
        formChanged ? setCloseDialogOpen(true) : goToList();
    }, [formChanged, setCloseDialogOpen, goToList]);

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

    const initialStack = isDev ? debugInitialStack : defaultInitialStack;

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

            <StackForm<D2NewStack>
                initialStack={initialStack}
                saveButtonLabel={i18n.t("Create")}
                onSave={save}
                onCancelRequest={requestGoToList}
                onChange={() => setFormChanged(true)}
            />
        </React.Fragment>
    );
});

const defaultInitialStack: D2NewStack = {
    dataImage: "",
    coreImage: "",
    port: 8080,
    access: "restricted",
    teamIds: [],
    userIds: [],
};

const debugInitialStack: D2NewStack = {
    dataImage: "eyeseetea/dhis2-data:2.32-empty1",
    coreImage: "eyeseetea/dhis2-core:2.32",
    port: 8081,
    access: "restricted",
    teamIds: [],
    userIds: [],
};
