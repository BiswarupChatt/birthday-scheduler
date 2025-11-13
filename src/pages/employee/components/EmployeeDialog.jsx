// src/features/employee/components/EmployeeDialog.jsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Switch,
    FormControlLabel,
} from "@mui/material";

const defaultForm = {
    empId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    designation: "",
    isActive: true,
};

export default function EmployeeDialog({
    open,
    mode = "create",
    initialValues = defaultForm,
    onClose,
    onSubmit,
    loading = false,
}) {
    const [form, setForm] = useState(initialValues);
    const isEdit = mode === "edit";

    useEffect(() => {
        setForm(initialValues || defaultForm);
    }, [initialValues, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e) => {
        setForm((prev) => ({ ...prev, isActive: e.target.checked }));
    };

    const handleSubmit = () => {
        if (!form.firstName?.trim() || !form.empId?.trim()) {
            onSubmit?.(null, { message: "Emp ID and First Name are required" });
            return;
        }
        onSubmit?.(form);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Emp ID"
                            name="empId"
                            value={form?.empId}
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
                            value={form?.designation}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={form?.firstName}
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
                            value={form?.lastName}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone"
                            name="phoneNumber"
                            value={form?.phoneNumber}
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
                            value={form?.dateOfBirth ? String(form.dateOfBirth).substring(0, 10) : ""}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch checked={!!form?.isActive} onChange={handleToggle} />}
                            label="Active"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {isEdit ? "Save Changes" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
