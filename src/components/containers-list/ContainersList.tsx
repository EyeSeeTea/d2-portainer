import React from "react";
import {
    ObjectsTable,
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    TableState,
    TableSelection,
    useSnackbar,
    SnackbarState,
    TableGlobalAction,
} from "d2-ui-components";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import SyncIcon from "@material-ui/icons/Sync";
import { D2Container, D2ContainerMethods } from "../../domain/entities/D2Container";

import { i18n } from "../../i18n";
import { useHistory } from "react-router-dom";
import { useAppContext, useLoggedAppContext } from "../AppContext";
import { ContainersStats } from "../containers-stats/ContainersStats";
import { StringEither } from "../../utils/Either";

interface ContainersListProps {
    containers: D2Container[];
    onRefresh: () => void;
}

export const ContainersList: React.FC<ContainersListProps> = React.memo(props => {
    const { containers, onRefresh } = props;

    const { compositionRoot } = useLoggedAppContext();
    const [rows, setRows] = React.useState<D2Container[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [stats, setStats] = React.useState<D2Container | undefined>();
    const [selection, setSelection] = React.useState<TableSelection[]>([]);
    const history = useHistory();
    const snackbar = useSnackbar();

    /*
    React.useEffect(() => {
        containers.length && setStats(containers[0]);
    }, [containers]);
    */

    React.useEffect(() => {
        setRows(D2ContainerMethods.filterContainers(containers, search));
    }, [search, containers]);

    const stop = React.useCallback(
        (ids: string[]) => {
            const d2Containers = D2ContainerMethods.getById(containers, ids);
            showFeedback(
                compositionRoot.containers.stop(d2Containers),
                snackbar,
                i18n.t("Containers stopped")
            );
        },
        [compositionRoot, containers]
    );

    const start = React.useCallback(
        (ids: string[]) => {
            const d2Containers = D2ContainerMethods.getById(containers, ids);
            showFeedback(
                compositionRoot.containers.start(d2Containers),
                snackbar,
                i18n.t("Containers started")
            );
        },
        [compositionRoot, containers]
    );

    const globalActions: TableGlobalAction[] = React.useMemo(
        () => [
            { name: "refresh", text: i18n.t("Refresh"), icon: <SyncIcon />, onClick: onRefresh },
        ],
        []
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
                name: "stats",
                text: i18n.t("Stats"),
                multiple: false,
                onClick: ids => setStats(D2ContainerMethods.getById(containers, ids)[0]),
                icon: <EqualizerIcon />,
                isActive: D2ContainerMethods.isRunning,
            },
            {
                name: "start",
                text: i18n.t("Start"),
                multiple: true,
                onClick: start,
                icon: <PlayArrowIcon />,
                isActive: D2ContainerMethods.isStopped,
            },
            {
                name: "stop",
                text: i18n.t("Stop"),
                multiple: true,
                onClick: stop,
                icon: <StopIcon />,
                isActive: D2ContainerMethods.isRunning,
            },
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                onClick: console.log,
                icon: <EditIcon />,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: console.log,
                icon: <DeleteIcon />,
            },
        ],
        [stop, setStats]
    );

    const updateTable = React.useCallback(
        (state: TableState<D2Container>) => setSelection(state.selection),
        [setSelection]
    );

    const createInstance = React.useCallback(() => {
        history.push("/new");
    }, []);

    const closeStats = React.useCallback(() => {
        setStats(undefined);
    }, [setStats]);

    return (
        <React.Fragment>
            {stats && <ContainersStats d2Container={stats} onClose={closeStats} />}

            <ObjectsTable<D2Container>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                globalActions={globalActions}
                onActionButtonClick={createInstance}
                onChangeSearch={setSearch}
                selection={selection}
                onChange={updateTable}
            />
        </React.Fragment>
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

function showFeedback<T>(
    value: Promise<StringEither<T>>,
    snackbar: SnackbarState,
    successMsg: string
) {
    return value.then(res =>
        res.match({
            success: () => snackbar.success(successMsg),
            error: errorMsg => snackbar.error(errorMsg),
        })
    );
}
