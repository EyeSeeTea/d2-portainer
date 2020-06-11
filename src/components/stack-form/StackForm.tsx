import React from "react";
import _ from "lodash";
import { Card, CardContent, FormControl, FormHelperText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../i18n";
import { FormButton } from "./FormButton";
import { D2NewStack } from "../../domain/entities/D2NewStack";
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

const initialData: D2NewStack = {
    branch: "",
    dataInstance: "eyeseetea/dhis2-data:2.32-samaritans",
    coreInstance: "eyeseetea/dhis2-core:2.32",
    port: 8090,
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

export const StackForm: React.FC<StackFormProps> = React.memo(props => {
    const { onSave, onCancelRequest } = props;
    const classes = useStyles();
    const { compositionRoot } = useLoggedAppContext();
    const [data, setData] = React.useState(initialData);
    const [isSaving, setIsSaving] = React.useState(false);
    const snackbar = useSnackbar();
    const [teams, setTeams] = React.useState<Option[]>([]);

    React.useEffect(() => {
        compositionRoot.teams.get().then(res => {
            res.match({
                success: (teams: Team[]) =>
                    setTeams(teams.map(t => ({ value: t.id.toString(), label: t.name }))),
                error: snackbar.error,
            });
        });
    }, [snackbar]);

    const create = React.useCallback(() => {
        setIsSaving(true);
        onSave(data).finally(() => setIsSaving(false));
    }, [data, onSave]);

    return (
        <Card>
            <CardContent className={classes.form}>
                <FormTextField
                    label={i18n.t("Data instance")}
                    onChange={value => setData({ ...data, dataInstance: value })}
                    value={data.dataInstance}
                />

                <FormTextField
                    label={i18n.t("Core instance")}
                    onChange={value => setData({ ...data, coreInstance: value })}
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
