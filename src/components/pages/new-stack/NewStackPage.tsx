import React from "react";
import { i18n } from "../../../i18n";
import { useSnackbar } from "d2-ui-components";
import { useHistory } from "react-router-dom";
import { D2NewStack } from "../../../domain/entities/D2NewStack";
import { useAppContext } from "../../AppContext";
import { StackFormWrapper } from "../../stack-form/StackFormWrapper";
import { showSnackbar } from "../../../utils/react-feedback";

interface NewStackPageProps {}

export const NewStackPage: React.FC<NewStackPageProps> = React.memo(() => {
    const history = useHistory();
    const { compositionRoot, isDev, config } = useAppContext();
    const snackbar = useSnackbar();
    const goToList = React.useCallback(() => history.push("/"), [history]);

    const save = React.useCallback(
        (stack: D2NewStack) => {
            return compositionRoot.stacks.create(stack, config).then(
                showSnackbar(compositionRoot, snackbar, {
                    message: i18n.t(`Stack created: ${stack.dataImage}`),
                    action: res => {
                        if (res.warnings) {
                            snackbar.warning(res.warnings.join("\n"));
                        }
                        goToList();
                        return true;
                    },
                    actionError: () => false,
                })
            );
        },
        [compositionRoot, snackbar, goToList, config]
    );

    const stack = isDev ? debugInitialStack : defaultInitialStack;

    return (
        <StackFormWrapper
            title={i18n.t("Create stack")}
            saveLabel={i18n.t("Create")}
            save={save}
            stack={stack}
        />
    );
});

const defaultInitialStack: D2NewStack = {
    dataImage: "",
    coreImage: "",
    url: undefined,
    access: "restricted",
    teamIds: [],
    userIds: [],
};

const debugInitialStack: D2NewStack = {
    dataImage: "eyeseetea/dhis2-data:2.32-empty1",
    coreImage: "eyeseetea/dhis2-core:2.32",
    url: "http://localhost:8080/dhis2",
    access: "restricted",
    teamIds: [],
    userIds: [],
};
