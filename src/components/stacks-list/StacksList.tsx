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
    ConfirmationDialog,
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

const refreshRate = 10;

interface StacksListProps {}

export const StacksList: React.FC<StacksListProps> = React.memo(() => {
    const { compositionRoot } = useLoggedAppContext();
    const [stacks, setStacks] = React.useState<D2Stack[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [stackStats, setStackStats] = React.useState<D2Stack | undefined>();
    const [selection, setSelection] = React.useState<TableSelection[]>([]);
    const [actionActive, setActionActive] = React.useState(false);
    const [stacksToDelete, setStacksToDelete] = React.useState<D2Stack[]>([]);
    const history = useHistory();
    const snackbar = useSnackbar();
    const classes = useStyles();

    const openDeleteConfirmation = React.useCallback(
        (ids: string[]) => {
            const stacksToDelete = D2StackMethods.getById(stacks, ids);
            setStacksToDelete(stacksToDelete);
        },
        [stacks, setStacksToDelete]
    );

    const closeConfirmation = React.useCallback(() => {
        setStacksToDelete([]);
    }, [setStacksToDelete]);

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
            .then(showSnackbar(compositionRoot, snackbar, { message: "", action: setStacks }));
    }, [compositionRoot, snackbar]);

    React.useEffect(() => {
        getStacks();
        const intervalId = setInterval(getStacks, refreshRate * 1000);
        return () => clearInterval(intervalId);
    }, [getStacks]);

    const stop = React.useCallback(
        withProgress((ids: string[]) => {
            const stacksToStop = D2StackMethods.getById(stacks, ids);
            return compositionRoot.stacks
                .stop(stacksToStop)
                .then(
                    showSnackbar(compositionRoot, snackbar, { message: i18n.t("Stack(s) stopped") })
                );
        }),
        [compositionRoot, stacks, snackbar]
    );

    const start = React.useCallback(
        withProgress((ids: string[]) => {
            const stacksToStart = D2StackMethods.getById(stacks, ids);
            return compositionRoot.stacks.start(stacksToStart).then(
                showSnackbar(compositionRoot, snackbar, {
                    message: i18n.t("Stack(s) started"),
                })
            );
        }),
        [compositionRoot, stacks, snackbar]
    );

    const delete_ = React.useCallback(
        withProgress(() => {
            return compositionRoot.stacks.delete(stacksToDelete.map(stack => stack.id)).then(
                showSnackbar(compositionRoot, snackbar, {
                    message: i18n.t("Stack(s) deleted"),
                    action: () => setStacksToDelete([]),
                })
            );
        }),
        [compositionRoot, snackbar, stacksToDelete]
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
                onClick: openDeleteConfirmation,
                icon: <DeleteIcon />,
            },
        ],
        [stop, setStackStats, stacks, start, editPermissions, openDeleteConfirmation]
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

    const filteredStacks = React.useMemo(() => D2StackMethods.filterStacks(stacks, search), [
        stacks,
        search,
    ]);

    return (
        <div className={classes.table}>
            {stackStats && <StackStats stack={stackStats} onClose={closeStats} />}
            {actionActive && <LinearProgress className={classes.linearProgress} />}

            <ObjectsTable<D2Stack>
                rows={filteredStacks}
                columns={columns}
                details={details}
                actions={actions}
                globalActions={globalActions}
                onActionButtonClick={createInstance}
                onChangeSearch={setSearch}
                selection={selection}
                onChange={updateTable}
            />

            {!_.isEmpty(stacksToDelete) && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={delete_}
                    onCancel={closeConfirmation}
                    title={i18n.t("Are you sure you want to delete those d2-docker instances?")}
                    disableSave={actionActive}
                    saveText={i18n.t("Proceed")}
                    cancelText={i18n.t("Cancel")}
                >
                    <ul>
                        {stacksToDelete.map(stack => (
                            <li key={stack.id}>{stack.dataImage}</li>
                        ))}
                    </ul>
                </ConfirmationDialog>
            )}
        </div>
    );
});

const columns: TableColumn<D2Stack>[] = [
    { name: "dataImage" as const, text: i18n.t("Name"), sortable: true },
    { name: "state" as const, text: i18n.t("State"), sortable: true },
    {
        name: "url" as const,
        text: i18n.t("URL"),
        sortable: true,
        getValue: (stack: D2Stack) => (stack.url ? link(stack.url, stack.url) : "-"),
    },
    { name: "status" as const, text: i18n.t("Status"), sortable: false },
];

function link(text: string, url: string): ReactNode {
    return (
        <a rel="noopener noreferrer" target="_blank" href={url}>
            {text}
        </a>
    );
}

const otherDetails: ObjectsTableDetailField<D2Stack>[] = [
    {
        name: "access",
        text: i18n.t("Permissions"),
        getValue: stack => getAccess(stack),
    },
];

const details: ObjectsTableDetailField<D2Stack>[] = columns.concat(otherDetails);

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
