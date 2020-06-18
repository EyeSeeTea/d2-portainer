import React from "react";
import { i18n } from "../../i18n";
import { ConfirmationDialog } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import PageHeader from "../page-header/PageHeader";
import { StackForm } from "../stack-form/StackForm";
import { CircularProgress } from "@material-ui/core";
import { D2NewStack } from "../../domain/entities/D2NewStack";

interface StackFormWrapperProps {
    title: string;
    saveLabel: string;
    disabledFields?: Array<keyof D2NewStack>;
    stack: D2NewStack | undefined;
    save(stack: D2NewStack): Promise<boolean | undefined>;
}

export const StackFormWrapper: React.FC<StackFormWrapperProps> = React.memo(props => {
    const { stack, title } = props;
    const history = useHistory();
    const [isCloseDialogOpen, setCloseDialogOpen] = React.useState(false);
    const goToList = React.useCallback(() => history.push("/"), [history]);
    const [formChanged, setFormChanged] = React.useState(false);

    const requestGoToList = React.useCallback(() => {
        formChanged ? setCloseDialogOpen(true) : goToList();
    }, [formChanged, setCloseDialogOpen, goToList]);

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
                <StackForm
                    saveButtonLabel={props.saveLabel}
                    onSave={props.save}
                    disabledFields={props.disabledFields}
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
