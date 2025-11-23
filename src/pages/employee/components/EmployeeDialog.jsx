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
    Box,
    Typography,
    InputAdornment,
    IconButton,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

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
    const [errors, setErrors] = useState({});
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const isEdit = mode === "edit";

    useEffect(() => {
        const safeValues =
            initialValues && Object.keys(initialValues).length > 0
                ? initialValues
                : defaultForm;

        setForm({
            ...safeValues,
            dateOfBirth: safeValues.dateOfBirth
                ? dayjs(safeValues.dateOfBirth).format("DD/MM/YYYY")
                : "",
        });

        setErrors({});
    }, [initialValues, open]);

    const handleDOBChange = (e) => {
        let value = e.target.value;

        value = value.replace(/[^\d]/g, ""); // only digits

        if (value.length > 8) value = value.slice(0, 8);

        if (value.length > 4)
            value = value.replace(/^(\d{2})(\d{2})(\d{1,4})$/, "$1/$2/$3");
        else if (value.length > 2)
            value = value.replace(/^(\d{2})(\d{1,2})$/, "$1/$2");

        setForm((prev) => ({ ...prev, dateOfBirth: value }));

        setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
    };

    const validateForm = () => {
        let temp = {};

        if (!form.firstName.trim())
            temp.firstName = "First Name is required";
        else if (!/^[A-Za-z ]+$/.test(form.firstName.trim()))
            temp.firstName = "Only alphabets allowed";
        else temp.firstName = "";

        if (form.empId.trim() && form.empId.trim().length < 2)
            temp.empId = "Min 2 characters required";
        else temp.empId = "";

        if (form.lastName.trim() && !/^[A-Za-z ]+$/.test(form.lastName.trim()))
            temp.lastName = "Only alphabets allowed";
        else temp.lastName = "";

        if (form.phoneNumber.trim()) {
            if (!/^[0-9]{10}$/.test(form.phoneNumber.trim()))
                temp.phoneNumber = "Phone must be exactly 10 digits";
            else temp.phoneNumber = "";
        } else temp.phoneNumber = "";


        if (form.designation.trim() && form.designation.trim().length < 2)
            temp.designation = "Min 2 characters";
        else temp.designation = "";

        if (!form.dateOfBirth) {
            temp.dateOfBirth = "Date of Birth is required";
        } else {
            const parsed = dayjs(form.dateOfBirth, "DD/MM/YYYY", true);
            if (!parsed.isValid()) temp.dateOfBirth = "Invalid date";
            else if (parsed.isAfter(dayjs()))
                temp.dateOfBirth = "Cannot select future date";
            else temp.dateOfBirth = "";
        }

        setErrors(temp);

        return Object.values(temp).every((x) => x === "");
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const [dd, mm, yyyy] = form.dateOfBirth.split("/");
        const formattedDOB = `${yyyy}-${mm}-${dd}`;

        onSubmit?.({
            ...form,
            empId: form.empId.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            designation: form.designation.trim(),
            dateOfBirth: formattedDOB,
        });
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
                                fullWidth
                                size="small"
                                value={form.empId}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, empId: e.target.value }))
                                }
                                error={!!errors.empId}
                                helperText={errors.empId}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Designation"
                                fullWidth
                                size="small"
                                value={form.designation}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, designation: e.target.value }))
                                }
                                error={!!errors.designation}
                                helperText={errors.designation}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="First Name *"
                                fullWidth
                                size="small"
                                value={form.firstName}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, firstName: e.target.value }))
                                }
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Last Name"
                                fullWidth
                                size="small"
                                value={form.lastName}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, lastName: e.target.value }))
                                }
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Phone Number"
                                fullWidth
                                size="small"
                                value={form.phoneNumber}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");
                                    if (value.length > 10) value = value.slice(0, 10);
                                    setForm((p) => ({ ...p, phoneNumber: value }));
                                }}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber}
                            />

                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Date of Birth *"
                                placeholder="DD/MM/YYYY"
                                fullWidth
                                size="small"
                                value={form.dateOfBirth}
                                onChange={handleDOBChange}
                                error={!!errors.dateOfBirth}
                                helperText={errors.dateOfBirth}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setOpenDatePicker(true)}
                                                >
                                                    <CalendarMonthIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Box display="flex" alignItems="center">
                                <Typography>
                                    {form.isActive ? "Deactivate Employee" : "Activate Employee"}
                                </Typography>

                                <Switch
                                    sx={{ ml: "auto" }}
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, isActive: e.target.checked }))
                                    }
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Dialog
                        open={openDatePicker}
                        onClose={() => setOpenDatePicker(false)}
                    >
                        <DialogContent>
                            <DateCalendar
                                value={
                                    form.dateOfBirth && !errors.dateOfBirth
                                        ? dayjs(form.dateOfBirth, "DD/MM/YYYY")
                                        : null
                                }
                                onChange={(value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        dateOfBirth: value.format("DD/MM/YYYY"),
                                    }));
                                    setErrors((p) => ({ ...p, dateOfBirth: "" }));
                                    setOpenDatePicker(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </LocalizationProvider>
            </DialogContent>

            <DialogActions>
                <Button disabled={loading} onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={loading} onClick={handleSubmit}>
                    {isEdit ? "Save Changes" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
