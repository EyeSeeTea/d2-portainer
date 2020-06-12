import React from "react";
import _ from "lodash";
import { Card, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../i18n";
import { FormButton } from "./FormButton";
import { D2NewStack, D2NewStackMethods } from "../../domain/entities/D2NewStack";
import { Team } from "../../domain/entities/Team";
import config from "../../config";
import { FormTextField } from "./FormTextField";
import { FormSelectField, Option } from "./FormSelectField";
import { FormMultipleSelectField } from "./FormMultipleSelectField";
import { useLoggedAppContext } from "../AppContext";
import { useSnackbar } from "d2-ui-components";

interface StackFormProps {
    onSave(data: D2NewStack): Promise<void>;
    onCancelRequest(): void;
}

export const StackForm: React.FC<StackFormProps> = React.memo(props => {
    const { onSave, onCancelRequest } = props;
    const classes = useStyles();
    const { compositionRoot, isDev } = useLoggedAppContext();
    const [data, setData] = React.useState(isDev ? initialStackDebug : initialStack);
    const [isSaving, setIsSaving] = React.useState(false);
    const snackbar = useSnackbar();
    const [teams, setTeams] = React.useState<Option[]>([]);
    const [isCoreImageModified, setCoreImageModified] = React.useState(false);

    React.useEffect(() => {
        compositionRoot.teams.get().then(res => {
            res.match({
                success: (teams: Team[]) =>
                    setTeams(teams.map(t => ({ value: t.id.toString(), label: t.name }))),
                error: snackbar.error,
            });
        });
    }, [compositionRoot, snackbar]);

    const setDataImage = React.useCallback(
        value => {
            setData(data =>
                !isCoreImageModified
                    ? new D2NewStackMethods(data).setCoreImageFromData(value)
                    : { ...data, dataImage: value }
            );
        },
        [setData, isCoreImageModified]
    );

    const setCoreImage = React.useCallback(
        value => {
            setData(data => ({ ...data, coreInstance: value }));
            setCoreImageModified(true);
        },
        [setData]
    );

    const create = React.useCallback(() => {
        setIsSaving(true);
        onSave(data).finally(() => setIsSaving(false));
    }, [data, onSave]);

    return (
        <Card>
            <CardContent className={classes.form}>
                <FormTextField
                    label={i18n.t("Data instance")}
                    onChange={setDataImage}
                    value={data.dataImage}
                    autoFocus={true}
                />

                <FormTextField
                    label={i18n.t("Core instance")}
                    onChange={setCoreImage}
                    value={data.coreInstance}
                />

                <FormSelectField
                    label={i18n.t("URL")}
                    onChange={port =>
                        setData({ ...data, port: parseInt(port), branch: branchFromPort[port] })
                    }
                    options={urlMappingOptions}
                    value={data.port.toString()}
                />

                <FormSelectField
                    label={i18n.t("Access")}
                    onChange={(access: D2NewStack["access"]) => setData({ ...data, access })}
                    options={accesses}
                    value={data.access as string}
                />

                {data.access === "restricted" && (
                    <FormMultipleSelectField
                        label={i18n.t("Teams with access")}
                        onChange={teamIds =>
                            setData({ ...data, teamIds: teamIds.map(s => parseInt(s)) })
                        }
                        options={teams}
                        values={data.teamIds.map(id => id.toString())}
                    />
                )}

                <div className={classes.button}>
                    <div>
                        <FormButton
                            label={i18n.t("Create")}
                            onClick={create}
                            isDisabled={isSaving}
                        />
                        <FormButton label={i18n.t("Cancel")} onClick={onCancelRequest} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

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

const initialStack: D2NewStack = {
    branch: "master",
    dataImage: "",
    coreInstance: "",
    port: 8080,
    access: "restricted",
    teamIds: [],
};

const initialStackDebug: D2NewStack = {
    branch: "master",
    dataImage: "eyeseetea/dhis2-data:2.32-empty1",
    coreInstance: "eyeseetea/dhis2-core:2.32",
    port: 8081,
    access: "restricted",
    teamIds: [],
};

const accesses = [
    { value: "restricted", label: i18n.t("Restricted") },
    { value: "admins", label: i18n.t("Administrators") },
];

const urlMappingOptions = config.urlMappings.map(mapping => ({
    value: mapping.port.toString(),
    label: mapping.url,
}));

const branchFromPort = _(config.urlMappings)
    .map(mapping => [mapping.port, mapping.name])
    .fromPairs()
    .value();
