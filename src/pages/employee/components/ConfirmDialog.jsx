// src/features/employee/components/ConfirmDialog.jsx
import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";

export default function ConfirmDialog({
    open,
    title = "Confirm",
    description = "Are you sure?",
    onCancel,
    onConfirm,
    loading = false,
}) {
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
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
