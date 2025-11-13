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
    Box
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

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
    const [form, setForm] = useState(defaultForm);
    const isEdit = mode === "edit";

    // ⭐ NEW: modal date picker state
    const [openDatePicker, setOpenDatePicker] = useState(false);

    useEffect(() => {
        const safeValues =
            initialValues && Object.keys(initialValues).length > 0
                ? initialValues
                : defaultForm;

        setForm(safeValues);
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2}>

                        <Grid size={{ xs: 12, md: 6 }}>
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

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Designation"
                                name="designation"
                                value={form?.designation}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
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

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={form?.lastName}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Phone"
                                name="phoneNumber"
                                value={form?.phoneNumber}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        {/* ⭐ NEW: TextField that opens modal date picker */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Date of Birth"
                                value={form?.dateOfBirth || ""}
                                onClick={() => setOpenDatePicker(true)}
                                fullWidth
                                size="small"
                                placeholder="Select date"
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!form?.isActive}
                                            onChange={handleToggle}
                                        />
                                    }
                                    label="Active"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* ⭐ CENTERED DATE PICKER MODAL */}
                    <Dialog
                        open={openDatePicker}
                        onClose={() => setOpenDatePicker(false)}
                    >
                        <DialogContent>
                            <DateCalendar
                                value={
                                    form?.dateOfBirth
                                        ? dayjs(form.dateOfBirth)
                                        : null
                                }
                                onChange={(value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        dateOfBirth: value
                                            ? value.format("YYYY-MM-DD")
                                            : "",
                                    }));
                                    setOpenDatePicker(false); // close modal after select
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </LocalizationProvider>
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
