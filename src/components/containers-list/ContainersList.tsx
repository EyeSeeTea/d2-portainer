import React from "react";
import {
    ObjectsTable,
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    TableState,
    TableSelection,
} from "d2-ui-components";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { D2Container } from "../../domain/entities/D2Container";

import { i18n } from "../../i18n";

interface ContainersListProps {
    containers: D2Container[];
}

export const ContainersList: React.FC<ContainersListProps> = React.memo(props => {
    const { containers } = props;

    const [rows, setRows] = React.useState<D2Container[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [selection, setSelection] = React.useState<TableSelection[]>([]);

    React.useEffect(() => {
        const searchLowerCase = search.trim().toLowerCase();
        const filteredContainers = searchLowerCase
            ? containers.filter(container => container.name.toLowerCase().includes(searchLowerCase))
            : containers;
        setRows(filteredContainers);
    }, [search, containers]);

    const updateTable = React.useCallback(
        (state: TableState<D2Container>) => {
            console.log(state);
            setSelection(state.selection);
        },
        [setSelection]
    );

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
    { name: "name" as const, text: i18n.t("Name"), sortable: true, getValue: x => x.name },
    { name: "state" as const, text: i18n.t("State"), sortable: true, getValue: x => x.state },
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

const actions: TableAction<D2Container>[] = [
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
        name: "delete",
        text: i18n.t("Delete"),
        multiple: true,
        onClick: console.log,
        icon: <DeleteIcon />,
    },
];

const createInstance = undefined;
