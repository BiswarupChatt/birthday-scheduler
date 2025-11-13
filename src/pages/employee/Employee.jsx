// src/features/employee/EmployeePage.jsx
import { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import EmployeeToolbar from "./components/EmployeeToolbar";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeDialog from "./components/EmployeeDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/axios/apicalls";
import { stableSort, getComparator } from "../../utils/methods/sortUtils";
import TableSkeleton from "./components/TableSkeleton";
import { useToast } from "@/hooks/ToastContext";

export default function EmployeePage() {
    const toast = useToast();

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
            toast.error("Failed to load employees"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
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
            toast.success("Employee deleted");
            fetchEmployees();
        } catch {
            toast.error("Error deleting employee");
        } finally {
            setOpenConfirm(false);
        }
    };

    const handleSubmit = async (form, error) => {
        if (error) {
            toast.warning(error.message);
            return;
        }

        try {
            if (formMode === "create") {
                await createEmployee(form);
                toast.success("Employee created");
            } else {
                await updateEmployee(current._id, form);
                toast.success("Employee updated");
            }

            setOpenForm(false);
            fetchEmployees();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Something went wrong");
        }
    };

    const sortedRows = useMemo(
        () => stableSort(employees, getComparator(order, orderBy)),
        [employees, order, orderBy]
    );

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

            {loading ? (
                <TableSkeleton columnsCount={5} rowsCount={5} />
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
                />
            )}

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
        </Box>
    );
}
