import React, { ReactNode } from "react";
import _ from "lodash";
import {
    ObjectsTable,
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    TableState,
    TableSelection,
    useSnackbar,
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
import { showSnackbar } from "../../utils/react-feedback";
import { LinearProgress, makeStyles } from "@material-ui/core";

// const refreshRate = 10;

interface StacksListProps {}

export const StacksList: React.FC<StacksListProps> = React.memo(props => {
    const { compositionRoot } = useLoggedAppContext();
    const [stacks, setStacks] = React.useState<D2Stack[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [stackStats, setStackStats] = React.useState<D2Stack | undefined>();
    const [selection, setSelection] = React.useState<TableSelection[]>([]);
    const [actionActive, setActionActive] = React.useState(false);
    const history = useHistory();
    const snackbar = useSnackbar();
    const classes = useStyles();

    function withProgress<Args extends any[], Res>(fn: (...args: Args) => Promise<Res>) {
        return (...args: Args) => {
            setActionActive(true);
            fn(...args).finally(() => {
                setActionActive(false);
                getStacks();
            });
        };
    }

    const getStacks = React.useCallback(() => {
        compositionRoot.stacks
            .get()
            .then(showSnackbar(snackbar, { message: "", action: setStacks }));
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
        withProgress((ids: string[]) => {
            const stacksToStop = D2StackMethods.getById(stacks, ids);
            return compositionRoot.stacks
                .stop(stacksToStop)
                .then(showSnackbar(snackbar, { message: i18n.t("Stack(s) stopped") }));
        }),
        [compositionRoot, stacks, snackbar]
    );

    const start = React.useCallback(
        withProgress((ids: string[]) => {
            const stacksToStart = D2StackMethods.getById(stacks, ids);
            return compositionRoot.stacks
                .start(stacksToStart)
                .then(showSnackbar(snackbar, { message: i18n.t("Stack(s) started") }));
        }),
        [compositionRoot, stacks, snackbar]
    );

    const delete_ = React.useCallback(
        withProgress((ids: string[]) => {
            return compositionRoot.stacks
                .delete(ids)
                .then(showSnackbar(snackbar, { message: i18n.t("Stack(s) deleted") }));
        }),
        [compositionRoot, snackbar]
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
                onClick: delete_,
                icon: <DeleteIcon />,
            },
        ],
        [stop, setStackStats, stacks, start, editPermissions, delete_]
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
        <div className={classes.table}>
            {stackStats && <StackStats stack={stackStats} onClose={closeStats} />}
            {actionActive && <LinearProgress className={classes.linearProgress} />}

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
        </div>
    );
});

const columns: TableColumn<D2Stack>[] = [
    { name: "dataImage" as const, text: i18n.t("Name"), sortable: true },
    { name: "state" as const, text: i18n.t("State"), sortable: true },
    {
        name: "port" as const,
        text: i18n.t("Port"),
        sortable: true,
        getValue: stack => (stack.port ? stack.port.toString() : "-"),
    },
    { name: "status" as const, text: i18n.t("Status"), sortable: false },
];

const otherDetails: ObjectsTableDetailField<D2Stack>[] = [
    {
        name: "access",
        text: i18n.t("Permissions"),
        getValue: stack => getAccess(stack),
    },
];

const details: ObjectsTableDetailField<D2Stack>[] = columns
    .map(column => ({ name: column.name, text: column.text }))
    .concat(otherDetails);

function getAccess(stack: D2Stack): ReactNode {
    switch (stack.access) {
        case "admin":
            return i18n.t("Administrators Only");
        case "restricted":
            return i18n.t("Restricted");
    }
}

const useStyles = makeStyles(theme => ({
    table: {
        margin: 10,
    },
    linearProgress: {
        position: "absolute",
        width: "50vw",
        height: 10,
        top: 10,
        left: 10,
    },
}));
