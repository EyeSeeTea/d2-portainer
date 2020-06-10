import React from "react";
import _ from "lodash";
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
import { D2NewContainer } from "../../domain/entities/D2NewContainer";
import { Team } from "../../domain/entities/Team";

interface ContainerFormProps {
    onSave(data: D2NewContainer): Promise<void>;
    onCancelRequest(): void;
}

const initialData: D2NewContainer = {
    endpointId: 1,
    dataInstance: "eyeseetea/dhis2-data:2.32-samaritans",
    coreInstance: "eyeseetea/dhis2-core:2.32",
    port: 8090,
    teamIds: [1],
};

const urlMappings: Record<string, number> = {
    "http://localhost:8090": 8090,
    "http://localhost:8091": 8091,
    "http://localhost:8092": 8092,
};

const useStyles = makeStyles(theme => ({
    formContainer: {
        paddingRight: 70,
        paddingLeft: 70,
        paddingBottom: 30,
    },
    buttonContainer: {
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

export const ContainerForm: React.FC<ContainerFormProps> = React.memo(props => {
    const { onSave, onCancelRequest } = props;
    const classes = useStyles();
    const [data, setData] = React.useState(initialData);
    const [isSaving, setIsSaving] = React.useState(false);
    const [teams, setTeams] = React.useState<Team[] | undefined>();

    const create = React.useCallback(() => {
        setIsSaving(true);
        onSave(data).finally(() => setIsSaving(false));
    }, [data]);

    return (
        <Card>
            <CardContent className={classes.formContainer}>
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
                    <FormControl className={classes.formControl}>
                        <FormHelperText>{i18n.t("URL")}</FormHelperText>

                        <Select
                            value={data.port}
                            onChange={ev => {
                                setData({ ...data, port: parseInt(ev.target.value as string) });
                            }}
                        >
                            {_.map(urlMappings, (port, url) => (
                                <MenuItem key={url} value={port}>
                                    {url}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                {teams && (
                    <div>
                        <FormControl className={classes.formControl}>
                            <FormHelperText>{i18n.t("Teams with access")}</FormHelperText>

                            <Select
                                value={data.port}
                                onChange={ev => {
                                    setData({ ...data, port: parseInt(ev.target.value as string) });
                                }}
                            >
                                {_.map(urlMappings, (port, url) => (
                                    <MenuItem key={url} value={port}>
                                        {url}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                )}

                <div className={classes.buttonContainer}>
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
