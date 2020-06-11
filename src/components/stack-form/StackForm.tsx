import React from "react";
import {
    Card,
    TextField,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    FormHelperText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../i18n";
import { FormButton } from "./FormButton";
import { D2NewStack } from "../../domain/entities/D2NewStack";
import { Team } from "../../domain/entities/Team";
import config from "../../config";

interface StackFormProps {
    onSave(data: D2NewStack): Promise<void>;
    onCancelRequest(): void;
}

const initialData: D2NewStack = {
    endpointId: 1,
    dataInstance: "eyeseetea/dhis2-data:2.32-samaritans",
    coreInstance: "eyeseetea/dhis2-core:2.32",
    port: 8090,
    teamIds: [],
};

export const StackForm: React.FC<StackFormProps> = React.memo(props => {
    const { onSave, onCancelRequest } = props;
    const classes = useStyles();
    const [data, setData] = React.useState(initialData);
    const [isSaving, setIsSaving] = React.useState(false);
    const teams: Team[] = [
        { id: 1, name: "samaritans" },
        { id: 2, name: "who" },
    ];

    const create = React.useCallback(() => {
        setIsSaving(true);
        onSave(data).finally(() => setIsSaving(false));
    }, [data, onSave]);

    return (
        <Card>
            <CardContent className={classes.form}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label={i18n.t("Data instance")}
                    autoFocus
                    onChange={ev => setData({ ...data, dataInstance: ev.currentTarget.value })}
                    value={data.dataInstance}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label={i18n.t("Core instance")}
                    autoFocus
                    onChange={ev => setData({ ...data, coreInstance: ev.currentTarget.value })}
                    value={data.coreInstance}
                />

                <div>
                    <FormControl className={classes.formControl} fullWidth>
                        <FormHelperText>{i18n.t("URL")}</FormHelperText>

                        <Select
                            value={data.port}
                            onChange={ev => {
                                setData({ ...data, port: parseInt(ev.target.value as string) });
                            }}
                        >
                            {config.urlMappings.map(urlMapping => (
                                <MenuItem key={urlMapping.port} value={urlMapping.port}>
                                    {urlMapping.url}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                {teams && (
                    <div>
                        <FormControl className={classes.formControl} fullWidth>
                            <FormHelperText>{i18n.t("Teams with access")}</FormHelperText>

                            <Select
                                value={data.teamIds}
                                multiple={true}
                                onChange={ev => {
                                    setData({
                                        ...data,
                                        teamIds: ev.target.value as number[],
                                    });
                                }}
                            >
                                {teams.map(team => (
                                    <MenuItem key={team.id} value={team.id}>
                                        {team.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
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
