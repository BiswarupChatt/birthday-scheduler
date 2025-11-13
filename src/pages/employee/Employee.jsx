// src/features/employee/EmployeePage.jsx
import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import EmployeeToolbar from "./components/EmployeeToolbar";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeDialog from "./components/EmployeeDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/axios/apicalls";
import { stableSort, getComparator } from "../../utils/methods/sortUtils";
import TableSkeleton from "./components/TableSkeleton";

export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("firstName");

    const [openForm, setOpenForm] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [current, setCurrent] = useState(null);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const [statusUpdating, setStatusUpdating] = useState({});

    // debounce
    useEffect(() => {
        const id = setTimeout(() => setDebounced(search.trim()), 400);
        return () => clearTimeout(id);
    }, [search]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getAllEmployees({ search: debounced, page: page + 1, limit, order, orderBy });
            setEmployees(data.data || []);
            setTotal(data.total || 0);
        } catch {
            setToast({ open: true, message: "Failed to load employees", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, page, limit, order, orderBy]);

    const handleCreate = () => {
        setFormMode("create");
        setCurrent(null);
        setOpenForm(true);
    };

    const handleEdit = (emp) => {
        setFormMode("edit");
        setCurrent(emp);
        setOpenForm(true);
    };

    const handleDelete = async () => {
        try {
            await deleteEmployee(deleteId);
            setToast({ open: true, message: "Employee deleted", severity: "success" });
            fetchEmployees();
        } catch {
            setToast({ open: true, message: "Error deleting employee", severity: "error" });
        } finally {
            setOpenConfirm(false);
        }
    };

    const handleSubmit = async (form, error) => {
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
            fetchEmployees();
        } catch (e) {
            setToast({
                open: true,
                message: e?.response?.data?.message || "Something went wrong",
                severity: "error",
            });
        }
    };

    const sortedRows = useMemo(() => stableSort(employees, getComparator(order, orderBy)), [employees, order, orderBy]);

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Employee List
            </Typography>

            <EmployeeToolbar
                search={search}
                setSearch={setSearch}
                onAdd={handleCreate}
                page={page}
                setPage={setPage}
            />
            {
                loading ? (<>
                    <TableSkeleton columnsCount={5} rowsCount={5} />
                </>
                ) : (
                    <EmployeeTable
                        rows={sortedRows}
                        columnsOrder={{ order, orderBy, setOrder, setOrderBy }}
                        loading={loading}
                        total={total}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                        setLimit={setLimit}
                        onEdit={handleEdit}
                        onDelete={(id) => {
                            setDeleteId(id);
                            setOpenConfirm(true);
                        }}
                        statusUpdating={statusUpdating}
                        setStatusUpdating={setStatusUpdating}
                        setEmployees={setEmployees}
                        setToast={setToast}
                    />)
            }


            <EmployeeDialog
                open={openForm}
                mode={formMode}
                initialValues={current}
                onClose={() => setOpenForm(false)}
                onSubmit={handleSubmit}
            />

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
