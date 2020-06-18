import React from "react";
import { Card, CardContent, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "d2-ui-components";

import { i18n } from "../../i18n";
import { FormButton } from "./FormButton";
import { D2NewStack, setCoreImageFromData } from "../../domain/entities/D2NewStack";
import config from "../../config";
import { FormTextField } from "./FormTextField";
import { FormSelectField, Option } from "./FormSelectField";
import { FormMultipleSelectField } from "./FormMultipleSelectField";
import { useLoggedAppContext } from "../AppContext";
import { showSnackbar } from "../../utils/react-feedback";

interface StackFormProps<T extends D2NewStack> {
    initialStack: T;
    disabledFields?: Array<keyof T>;
    saveButtonLabel: string;
    onSave(stack: T): Promise<boolean | undefined>;
    onCancelRequest(): void;
    onChange(stack: T): void;
}

interface Options {
    users: Option[];
    teams: Option[];
}

type Access = D2NewStack["access"];

export function StackForm<T extends D2NewStack>(props: StackFormProps<T>) {
    const { onChange, onSave, onCancelRequest } = props;
    const { saveButtonLabel, initialStack, disabledFields = [] } = props;
    const classes = useStyles();
    const { compositionRoot } = useLoggedAppContext();
    const [stack, setStack] = React.useState(initialStack);
    const [isSaving, setIsSaving] = React.useState(false);
    const snackbar = useSnackbar();
    const [options, setOptions] = React.useState<Options>({ users: [], teams: [] });
    const [isCoreImageModified, setCoreImageModified] = React.useState(!!initialStack.coreImage);

    React.useEffect(() => {
        if (stack !== initialStack) {
            onChange(stack);
        }
    }, [stack, initialStack, onChange]);

    React.useEffect(() => {
        compositionRoot.memberships.get().then(
            showSnackbar(compositionRoot, snackbar, {
                action: ({ teams, users }) => {
                    setOptions({ teams: getOptions(teams), users: getOptions(users) });
                },
            })
        );
    }, [compositionRoot, snackbar]);

    const setDataImage = React.useCallback(
        value => {
            setStack(data =>
                !isCoreImageModified
                    ? setCoreImageFromData(data, value)
                    : { ...data, dataImage: value }
            );
        },
        [setStack, isCoreImageModified]
    );

    const setCoreImage = React.useCallback(
        value => {
            setStack(data => ({ ...data, coreImage: value }));
            setCoreImageModified(true);
        },
        [setStack]
    );

    const save = React.useCallback(() => {
        setIsSaving(true);
        onSave(stack).then(successfulSave => {
            if (!successfulSave) setIsSaving(false);
        });
    }, [stack, onSave]);

    const isFormValid = stack.dataImage && stack.coreImage && stack.url;

    return (
        <Card>
            <CardContent className={classes.form}>
                <FormTextField
                    label={i18n.t("Data instance")}
                    onChange={setDataImage}
                    value={stack.dataImage}
                    autoFocus={true}
                    disabled={disabledFields.includes("dataImage")}
                />

                <FormTextField
                    label={i18n.t("Core instance")}
                    onChange={setCoreImage}
                    value={stack.coreImage}
                    disabled={disabledFields.includes("coreImage")}
                />

                <FormSelectField
                    label={i18n.t("URL")}
                    onChange={url => setStack({ ...stack, url })}
                    options={urlMappingOptions}
                    value={stack.url || ""}
                    disabled={disabledFields.includes("url")}
                />

                <FormSelectField
                    label={i18n.t("Access")}
                    onChange={(access: Access) => setStack({ ...stack, access })}
                    options={accessOptions}
                    value={stack.access as string}
                />

                {stack.access === "restricted" && (
                    <React.Fragment>
                        <FormMultipleSelectField
                            label={i18n.t("Users with access")}
                            onChange={userIds =>
                                setStack({ ...stack, userIds: userIds.map(s => parseInt(s)) })
                            }
                            options={options.users}
                            values={stack.userIds.map(id => id.toString())}
                        />

                        <FormMultipleSelectField
                            label={i18n.t("Teams with access")}
                            onChange={teamIds =>
                                setStack({ ...stack, teamIds: teamIds.map(s => parseInt(s)) })
                            }
                            options={options.teams}
                            values={stack.teamIds.map(id => id.toString())}
                        />
                    </React.Fragment>
                )}

                <div className={classes.button}>
                    <div>
                        <FormButton
                            label={saveButtonLabel}
                            onClick={save}
                            isDisabled={!isFormValid || isSaving}
                        />
                        <FormButton label={i18n.t("Cancel")} onClick={onCancelRequest} />
                        {isSaving && <CircularProgress size={30} />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const useStyles = makeStyles(theme => ({
    form: {
        paddingRight: 70,
        paddingLeft: 70,
        paddingBottom: 30,
    },
    button: {
        display: "flex",
        justifyContent: "space-between",
        paddingTop: 30,
    },
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: 120,
    },
}));

const accessOptions: Array<{ value: Access; label: string }> = [
    { value: "restricted", label: i18n.t("Restricted") },
    { value: "admin", label: i18n.t("Administrators") },
];

const urlMappingOptions = config.urlMappings.map(mapping => ({
    value: mapping.url,
    label: mapping.url,
}));

function getOptions<T extends { id: number; name: string }>(objs: T[]): Option[] {
    return objs.map(obj => ({ value: obj.id.toString(), label: obj.name }));
}
