import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Menu,
    MenuItem, Paper, Switch, Tooltip, IconButton, CircularProgress, TableSortLabel, Typography, Box
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { formatDate } from "../../../utils/methods/dateUtils";
import { updateEmployee } from "@/lib/axios/apicalls";
import { useToast } from "@/hooks/ToastContext";
import { useState } from "react";

export default function EmployeeTable({
    rows, columnsOrder, loading, total, page, setPage, limit, setLimit,
    onEdit, onDelete, statusUpdating, setStatusUpdating, setEmployees,
}) {
    const { order, orderBy, setOrder, setOrderBy } = columnsOrder;

    const toast = useToast()

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const openMenu = Boolean(menuAnchor);

    const handleMenuOpen = (event, emp) => {
        setMenuAnchor(event.currentTarget);
        setSelectedRow(emp);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedRow(null);
    };


    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const toggleActive = async (emp, nextChecked) => {
        setStatusUpdating((s) => ({ ...s, [emp._id]: true }));
        try {
            await updateEmployee(emp._id, { isActive: nextChecked });
            setEmployees((prev) => prev.map((e) => (e._id === emp._id ? { ...e, isActive: nextChecked } : e)));
            toast.success(`Employee ${nextChecked ? "activated" : "deactivated"}`)
        } catch {
            toast.error("Failed to update status")
        } finally {
            setStatusUpdating((s) => {
                const { [emp._id]: _, ...rest } = s;
                return rest;
            });
        }
    };

    return (
        <>

            <Paper elevation={2}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {["empId", "firstName", "phoneNumber", "dateOfBirth", "designation", "isActive"].map((col) => (
                                    <TableCell key={col}>
                                        <TableSortLabel
                                            active={orderBy === col}
                                            direction={orderBy === col ? order : "asc"}
                                            onClick={() => handleRequestSort(col)}
                                        >
                                            {col === "empId" ? "Emp ID" :
                                                col === "firstName" ? "Name" :
                                                    col === "isActive" ? "Active" :
                                                        col === "dateOfBirth" ? "DOB" :
                                                            col === "phoneNumber" ? "Phone" : "Designation"}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((emp) => (
                                    <TableRow
                                        key={emp._id}
                                        hover
                                        className={!emp.isActive ? "inactive-row" : ""}
                                    >
                                        <TableCell sx={!emp.isActive ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                                            {emp.empId || "-"}
                                        </TableCell>

                                        <TableCell sx={!emp.isActive ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                                            {`${emp.firstName} ${emp.lastName}`}
                                        </TableCell>

                                        <TableCell sx={!emp.isActive ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                                            {emp.phoneNumber || "-"}
                                        </TableCell>

                                        <TableCell sx={!emp.isActive ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                                            {formatDate(emp.dateOfBirth)}
                                        </TableCell>

                                        <TableCell sx={!emp.isActive ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                                            {emp.designation || "-"}
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Switch
                                                    size="small"
                                                    checked={!!emp.isActive}
                                                    onChange={(e) => toggleActive(emp, e.target.checked)}
                                                    disabled={!!statusUpdating[emp._id]}
                                                />
                                                {statusUpdating[emp._id] && <CircularProgress size={16} />}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuOpen(e, emp)}>
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No employees found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={limit}
                    onRowsPerPageChange={(e) => {
                        setLimit(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                />
            </Paper>

            <Menu
                anchorEl={menuAnchor}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem
                    onClick={() => {
                        onEdit(selectedRow);
                        handleMenuClose();
                    }}
                >
                    Edit
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onDelete(selectedRow?._id);
                        handleMenuClose();
                    }}
                    sx={{ color: "error.main" }}
                >
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
}
