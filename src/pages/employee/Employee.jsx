import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    TextField,
    IconButton,
    Tooltip,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Switch,
    FormControlLabel,
    Snackbar,
    Alert,
    TableSortLabel,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { format, parseISO, isValid as isValidDate } from "date-fns";
import {
    deleteEmployee,
    getAllEmployees,
    createEmployee,
    updateEmployee,
} from "@/lib/axios/apicalls";

// ------------------------------
// Helpers
// ------------------------------
function formatDate(iso) {
    if (!iso) return "-";
    try {
        const d = typeof iso === "string" ? parseISO(iso) : new Date(iso);
        if (!isValidDate(d)) return "-";
        return format(d, "dd MMM yyyy"); // e.g., 12 Nov 2025
    } catch {
        return "-";
    }
}

function descendingComparator(a, b, orderBy) {
    if (b?.[orderBy] < a?.[orderBy]) return -1;
    if (b?.[orderBy] > a?.[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array = [], comparator) {
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
}

const defaultForm = {
    empId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    designation: "",
    isActive: true,
};

// ------------------------------
// Create/Edit Dialog
// ------------------------------
function EmployeeDialog({ open, mode = "create", initialValues, onClose, onSubmit, loading }) {
    const [form, setForm] = useState(initialValues || defaultForm);
    const isEdit = mode === "edit";

    useEffect(() => {
        setForm(initialValues || defaultForm);
    }, [initialValues, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleToggle = (e) => {
        setForm((f) => ({ ...f, isActive: e.target.checked }));
    };

    const handleSubmit = () => {
        if (!form.firstName?.trim() || !form.empId?.trim())
            return onSubmit?.(null, { message: "Emp ID and First Name are required" });
        onSubmit?.(form);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Emp ID"
                            name="empId"
                            value={form.empId}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Designation"
                            name="designation"
                            value={form.designation}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            value={form.dateOfBirth ? String(form.dateOfBirth).substring(0, 10) : ""}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch checked={!!form.isActive} onChange={handleToggle} />}
                            label="Active"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {isEdit ? "Save Changes" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ------------------------------
// Confirm Delete Dialog
// ------------------------------
function ConfirmDialog({ open, title, description, onCancel, onConfirm, loading }) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2">{description}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ------------------------------
// Main Component
// ------------------------------
export default function Employee() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // sorting
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("firstName");

    // dialogs
    const [openForm, setOpenForm] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [current, setCurrent] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // toast
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // status updating map (for per-row switch spinner/disable)
    const [statusUpdating, setStatusUpdating] = useState({});

    // debounce search input
    useEffect(() => {
        const id = setTimeout(() => setDebounced(search.trim()), 400);
        return () => clearTimeout(id);
    }, [search]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getAllEmployees({
                search: debounced,
                page: page + 1,
                limit,
                order,
                orderBy,
            });
            setEmployees(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("❌ Failed to fetch employees:", error);
            setToast({ open: true, message: "Failed to load employees", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, page, limit, order, orderBy]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleDelete = async () => {
        try {
            if (!deleteId) return;
            await deleteEmployee(deleteId);
            setToast({ open: true, message: "Employee deleted", severity: "success" });
            setOpenConfirm(false);
            setDeleteId(null);
            fetchEmployees();
        } catch (error) {
            setToast({ open: true, message: "Error deleting employee", severity: "error" });
        }
    };

    const openCreate = () => {
        setFormMode("create");
        setCurrent(null);
        setOpenForm(true);
    };

    const openEdit = (emp) => {
        setFormMode("edit");
        setCurrent(emp);
        setOpenForm(true);
    };

    const submitForm = async (form, error) => {
        if (error) {
            setToast({ open: true, message: error.message, severity: "warning" });
            return;
        }
        try {
            if (formMode === "create") {
                await createEmployee(form);
                setToast({ open: true, message: "Employee created", severity: "success" });
            } else {
                await updateEmployee(current._id, form);
                setToast({ open: true, message: "Employee updated", severity: "success" });
            }
            setOpenForm(false);
            setCurrent(null);
            fetchEmployees();
        } catch (e) {
            setToast({
                open: true,
                message: e?.response?.data?.message || "Something went wrong",
                severity: "error",
            });
        }
    };

    const toggleActive = async (emp, nextChecked) => {
        setStatusUpdating((s) => ({ ...s, [emp._id]: true }));
        try {
            await updateEmployee(emp._id, { isActive: nextChecked });
            // optimistic update
            setEmployees((prev) =>
                prev.map((e) => (e._id === emp._id ? { ...e, isActive: nextChecked } : e))
            );
            setToast({
                open: true,
                message: `Employee ${nextChecked ? "activated" : "deactivated"}`,
                severity: "success",
            });
        } catch (e) {
            setToast({
                open: true,
                message: e?.response?.data?.message || "Failed to update status",
                severity: "error",
            });
        } finally {
            setStatusUpdating((s) => {
                const { [emp._id]: _, ...rest } = s;
                return rest;
            });
        }
    };

    const columns = useMemo(
        () => [
            { id: "empId", label: "Emp ID" },
            { id: "firstName", label: "Name" },
            { id: "phoneNumber", label: "Phone" },
            {
                id: "dateOfBirth",
                label: "Date of Birth",
                render: (row) => formatDate(row.dateOfBirth),
            },
            { id: "designation", label: "Designation", render: (row) => row.designation || "-" },
            {
                id: "isActive",
                label: "Active",
                render: (row) => (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Switch
                            size="small"
                            checked={!!row.isActive}
                            onChange={(e) => toggleActive(row, e.target.checked)}
                            disabled={!!statusUpdating[row._id]}
                        />
                        {statusUpdating[row._id] && <CircularProgress size={16} />}
                    </Box>
                ),
            },
        ],
        [statusUpdating]
    );

    const sortedRows = useMemo(() => {
        return stableSort(employees, getComparator(order, orderBy));
    }, [employees, order, orderBy]);

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Employee List
            </Typography>

            <Box display="flex" gap={2} justifyContent="space-between" mb={2} flexWrap="wrap">
                <TextField
                    label="Search Employee"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    sx={{ width: 280 }}
                    placeholder="Search by name, phone, id..."
                />

                <Box display="flex" gap={1}>
                    <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
                        Add Employee
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ position: "relative" }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === col.id}
                                            direction={orderBy === col.id ? order : "asc"}
                                            onClick={() => handleRequestSort(col.id)}
                                        >
                                            {col.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={1} py={3}>
                                            <CircularProgress size={24} />
                                            <Typography variant="body2">Loading employees…</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : sortedRows.length > 0 ? (
                                sortedRows.map((emp) => (
                                    <TableRow key={emp._id} hover>
                                        {/* Emp ID */}
                                        <TableCell>{emp.empId || "-"}</TableCell>

                                        {/* First Name */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: emp.isActive ? "inherit" : "text.disabled",
                                                    textDecoration: emp.isActive ? "none" : "line-through",
                                                }}
                                            >
                                                {`${emp.firstName} ${emp.lastName}` || "-"}
                                            </Typography>
                                        </TableCell>


                                        {/* Phone */}
                                        <TableCell>{emp.phoneNumber || "-"}</TableCell>

                                        {/* Date of Birth */}
                                        <TableCell>{formatDate(emp.dateOfBirth)}</TableCell>

                                        {/* Designation */}
                                        <TableCell>{emp.designation || "-"}</TableCell>

                                        {/* Active Toggle */}
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

                                        {/* Actions */}
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => openEdit(emp)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setDeleteId(emp._id);
                                                        setOpenConfirm(true);
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align="center">
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

            {/* Create/Edit Dialog */}
            <EmployeeDialog
                open={openForm}
                mode={formMode}
                initialValues={current}
                onClose={() => setOpenForm(false)}
                onSubmit={submitForm}
            />

            {/* Delete Confirm */}
            <ConfirmDialog
                open={openConfirm}
                title="Delete Employee"
                description="Are you sure you want to delete this employee? This action cannot be undone."
                onCancel={() => setOpenConfirm(false)}
                onConfirm={handleDelete}
            />

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
