import React from "react";
import {
    ObjectsTable,
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    TableState,
    TableSelection,
    useSnackbar,
} from "d2-ui-components";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Stop from "@material-ui/icons/Stop";
import { D2Container, filterContainers } from "../../domain/entities/D2Container";

import { i18n } from "../../i18n";
import { useHistory } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { CompositionRoot } from "../../CompositionRoot";
import { Snackbar } from "@material-ui/core";

interface ContainersListProps {
    containers: D2Container[];
}

export const ContainersList: React.FC<ContainersListProps> = React.memo(props => {
    const { containers } = props;

    const [rows, setRows] = React.useState<D2Container[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [selection, setSelection] = React.useState<TableSelection[]>([]);
    const history = useHistory();
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        setRows(filterContainers(containers, search));
    }, [search, containers]);

    const stop = React.useCallback(
        (ids: string[]) => {
            const d2Containers = containers.filter(container => ids.includes(container.id));
            compositionRoot.containers.stop(d2Containers).then(res =>
                res.match({
                    success: () => snackbar.success(i18n.t("Containers stopped")),
                    error: snackbar.error,
                })
            );
        },
        [compositionRoot, containers]
    );

    const start = React.useCallback(
        (ids: string[]) => {
            const d2Containers = containers.filter(container => ids.includes(container.id));
            compositionRoot.containers.start(d2Containers).then(res =>
                res.match({
                    success: () => snackbar.success(i18n.t("Containers started")),
                    error: snackbar.error,
                })
            );
        },
        [compositionRoot, containers]
    );

    const actions: TableAction<D2Container>[] = React.useMemo(
        () => [
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
                primary: true,
            },
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                onClick: console.log,
                icon: <EditIcon />,
            },
            {
                name: "start",
                text: i18n.t("Start"),
                multiple: true,
                onClick: start,
                icon: <PlayArrow />,
            },
            {
                name: "stop",
                text: i18n.t("Stop"),
                multiple: true,
                onClick: stop,
                icon: <Stop />,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: stop,
                icon: <DeleteIcon />,
            },
        ],
        [stop]
    );

    const updateTable = React.useCallback(
        (state: TableState<D2Container>) => setSelection(state.selection),
        [setSelection]
    );

    const createInstance = React.useCallback(() => {
        history.push("/new");
    }, []);

    return (
        <ObjectsTable<D2Container>
            rows={rows}
            columns={columns}
            details={details}
            actions={actions}
            onActionButtonClick={createInstance}
            onChangeSearch={setSearch}
            selection={selection}
            onChange={updateTable}
        />
    );
});

const columns: TableColumn<D2Container>[] = [
    { name: "name" as const, text: i18n.t("Name"), sortable: true },
    { name: "state" as const, text: i18n.t("State"), sortable: true },
    {
        name: "port" as const,
        text: i18n.t("Port"),
        sortable: true,
        getValue: c => (c.port ? c.port.toString() : "-"),
    },
    { name: "status" as const, text: i18n.t("Status"), sortable: false },
];

const details: ObjectsTableDetailField<D2Container>[] = columns.map(column => ({
    name: column.name,
    text: column.text,
}));
