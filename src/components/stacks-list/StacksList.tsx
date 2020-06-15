import React from "react";
import _ from "lodash";
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
import { D2Stack, D2StackMethods } from "../../domain/entities/D2Stack";

import { i18n } from "../../i18n";
import { useHistory } from "react-router-dom";
import { useLoggedAppContext } from "../AppContext";
import { StackStats } from "../stack-stats/StackStats";
import { PromiseRes } from "../../utils/types";

// const refreshRate = 10;

interface StacksListProps {}

export const StacksList: React.FC<StacksListProps> = React.memo(props => {
    const { compositionRoot } = useLoggedAppContext();
    const [stacks, setStacks] = React.useState<D2Stack[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [stackStats, setStackStats] = React.useState<D2Stack | undefined>();
    const [selection, setSelection] = React.useState<TableSelection[]>([]);
    const history = useHistory();
    const snackbar = useSnackbar();
    console.log({ stacks });

    const getStacks = React.useCallback(() => {
        compositionRoot.stacks.get().then(res => {
            res.match({
                success: setStacks,
                error: snackbar.error,
            });
        });
    }, [compositionRoot, snackbar]);

    React.useEffect(() => {
        getStacks();
        //const intervalId = setInterval(getStacks, refreshRate * 1000);
        //return () => clearInterval(intervalId);
    }, [getStacks]);

    React.useEffect(() => {
        setStacks(D2StackMethods.filterStacks(stacks, search));
    }, [search, stacks]);

    const stop = React.useCallback(
        (ids: string[]) => {
            const stacksToStop = D2StackMethods.getById(stacks, ids);
            showFeedback(
                compositionRoot.stacks.stop(stacksToStop),
                snackbar,
                i18n.t("Stack(s) stopped")
            );
        },
        [compositionRoot, stacks, snackbar]
    );

    const start = React.useCallback(
        (ids: string[]) => {
            const stacksToStart = D2StackMethods.getById(stacks, ids);
            showFeedback(
                compositionRoot.stacks.start(stacksToStart),
                snackbar,
                i18n.t("Stack(s) started")
            );
        },
        [compositionRoot, stacks, snackbar]
    );

    const editPermissions = React.useCallback(
        (ids: string[]) => {
            const stackToEdit = _.first(D2StackMethods.getById(stacks, ids));
            if (stackToEdit) history.push(`/edit/${stackToEdit.id}`);
        },
        [stacks, history]
    );

    const globalActions: TableGlobalAction[] = React.useMemo(
        () => [
            { name: "refresh", text: i18n.t("Refresh"), icon: <SyncIcon />, onClick: getStacks },
        ],
        [getStacks]
    );

    const actions: TableAction<D2Stack>[] = React.useMemo(
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
                onClick: ids => setStackStats(D2StackMethods.getById(stacks, ids)[0]),
                icon: <EqualizerIcon />,
                isActive: D2StackMethods.isRunning,
            },
            {
                name: "start",
                text: i18n.t("Start"),
                multiple: true,
                onClick: start,
                icon: <PlayArrowIcon />,
                isActive: D2StackMethods.isStopped,
            },
            {
                name: "stop",
                text: i18n.t("Stop"),
                multiple: true,
                onClick: stop,
                icon: <StopIcon />,
                isActive: D2StackMethods.isRunning,
            },
            {
                name: "edit-permissions",
                text: i18n.t("Edit Permissions"),
                multiple: false,
                onClick: editPermissions,
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
        [stop, setStackStats, stacks, start, editPermissions]
    );

    const updateTable = React.useCallback(
        (state: TableState<D2Stack>) => setSelection(state.selection),
        [setSelection]
    );

    const createInstance = React.useCallback(() => {
        history.push("/new");
    }, [history]);

    const closeStats = React.useCallback(() => {
        setStackStats(undefined);
    }, [setStackStats]);

    return (
        <React.Fragment>
            {stackStats && <StackStats stack={stackStats} onClose={closeStats} />}

            <ObjectsTable<D2Stack>
                rows={stacks}
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

const columns: TableColumn<D2Stack>[] = [
    { name: "dataImage" as const, text: i18n.t("Name"), sortable: true },
    { name: "state" as const, text: i18n.t("State"), sortable: true },
    {
        name: "port" as const,
        text: i18n.t("Port"),
        sortable: true,
        getValue: c => (c.port ? c.port.toString() : "-"),
    },
    { name: "status" as const, text: i18n.t("Status"), sortable: false },
];

const details: ObjectsTableDetailField<D2Stack>[] = columns.map(column => ({
    name: column.name,
    text: column.text,
}));

function showFeedback<T>(value: PromiseRes<T>, snackbar: SnackbarState, successMsg: string) {
    return value.then(res =>
        res.match({
            success: () => snackbar.success(successMsg),
            error: errorMsg => snackbar.error(errorMsg),
        })
    );
}
