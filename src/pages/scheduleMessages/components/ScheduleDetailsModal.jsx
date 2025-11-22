import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Chip,
    IconButton,
    TextField,
    MenuItem
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { useState } from "react";
import { format } from "date-fns";
import { updateBirthdaySchedule } from "@/lib/axios/apicalls";

export default function ScheduleDetailsModal({
    open,
    handleClose,
    item,
    getStatusChipProps,
    theme,
    onUpdated
}) {
    if (!item) return null;

    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState(item.message);
    const [status, setStatus] = useState(item.status);
    const [loadingEdit, setLoadingEdit] = useState(false);

    // 🔥 ONE UNIFIED API HANDLER
    const updateSchedule = async (updates) => {
        try {
            const updated = await updateBirthdaySchedule(item._id, {
                message,
                status,
                ...updates,
            });

            // update parent
            onUpdated(updated.data);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    // ✏ SAVE MESSAGE INLINE
    const saveMessage = async () => {
        if (message.trim() === item.message) {
            setEditing(false);
            return;
        }

        setLoadingEdit(true);
        await updateSchedule({ message });
        setEditing(false);
        setLoadingEdit(false);
    };

    // 🔄 SAVE STATUS INLINE
    const saveStatus = async (newStatus) => {
        setStatus(newStatus);
        await updateSchedule({ status: newStatus });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {item.employeeId.firstName} {item.employeeId.lastName}
            </DialogTitle>

            <DialogContent sx={{ pb: 3 }}>
                {/* Image */}
                <Box
                    component="img"
                    src={item.imageUrl}
                    alt="schedule"
                    sx={{
                        mx: "auto",
                        width: "100%",
                        height: 220,
                        borderRadius: 2,
                        objectFit: "cover",
                        mb: 2,
                    }}
                />

                {/* Designation */}
                <Typography fontSize={14} color="text.secondary">
                    {item.employeeId.designation} • {item.employeeId.empId}
                </Typography>

                {/* ======================
                    MESSAGE INLINE EDIT
                   ====================== */}
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography fontSize={15} fontWeight={600}>Message:</Typography>

                        {!editing ? (
                            <IconButton size="small" onClick={() => setEditing(true)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Box>
                                <IconButton
                                    size="small"
                                    color="success"
                                    onClick={saveMessage}
                                    disabled={loadingEdit}
                                >
                                    <CheckIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        setEditing(false);
                                        setMessage(item.message);
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    {!editing ? (
                        <Typography sx={{ mt: 1 }}>{message}</Typography>
                    ) : (
                        <TextField
                            fullWidth
                            multiline
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    )}
                </Box>

                {/* ======================
                   SCHEDULE DATE
                   ====================== */}
                <Typography sx={{ mt: 2 }} fontSize={14} color="primary">
                    <strong>Scheduled:</strong>{" "}
                    {format(new Date(item.scheduledDate), "dd MMM yyyy, hh:mm a")}
                </Typography>

                {/* ======================
                    STATUS UPDATE INLINE
                   ====================== */}
                <Box sx={{ mt: 3 }}>
                    <Typography fontSize={15} fontWeight={600} sx={{ mb: 1 }}>
                        Status:
                    </Typography>

                    <TextField
                        select
                        fullWidth
                        size="small"
                        value={status}
                        onChange={(e) => saveStatus(e.target.value)}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="cancel">Cancel</MenuItem>
                    </TextField>

                    <Box sx={{ mt: 2 }}>
                        <Chip
                            size="small"
                            {...getStatusChipProps(status, theme)}
                            sx={{
                                px: 1.2,
                                ...getStatusChipProps(status, theme).sx,
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
