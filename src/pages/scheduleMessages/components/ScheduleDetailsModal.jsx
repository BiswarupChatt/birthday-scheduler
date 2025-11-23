import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Chip,
    IconButton,
    TextField,
    Popover,
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
    const [anchorEl, setAnchorEl] = useState(null);

    const openPopover = (event) => setAnchorEl(event.currentTarget);
    const closePopover = () => setAnchorEl(null);

    const updateSchedule = async (updates) => {
        try {
            const updated = await updateBirthdaySchedule(item._id, {
                message,
                status,
                ...updates,
            });

            onUpdated(updated.data);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

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

    const handleStatusChange = async (newStatus) => {
        closePopover();
        setStatus(newStatus);
        await updateSchedule({ status: newStatus });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {item.employeeId.firstName} {item.employeeId.lastName}
            </DialogTitle>

            <DialogContent sx={{ pb: 3 }}>

                <Box
                    component="img"
                    src={item.imageUrl}
                    alt="schedule"
                    sx={{
                        mx: "auto",
                        width: .3,
                        height: .3,
                        borderRadius: 2,
                        objectFit: "cover",
                        mb: 2,
                    }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>

                    <Typography fontSize={14} color="text.secondary">
                        {item.employeeId.designation} • {item.employeeId.empId}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography fontSize={14} fontWeight={600} sx={{ mb: 1 }}>
                            Status:
                        </Typography>
                    
                        <Chip
                            size="small"
                            onClick={item.status === "pending" ? openPopover : undefined}
                            {...getStatusChipProps(status, theme)}
                            sx={{
                                cursor: item.status === "pending" ? "pointer" : "default",
                                px: 1,
                                ...getStatusChipProps(status, theme).sx,
                            }}
                        />

                        {/* Popover Menu */}
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={closePopover}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                        >
                            <MenuItem onClick={() => handleStatusChange("pending")}>
                                Pending
                            </MenuItem>

                            <MenuItem onClick={() => handleStatusChange("cancel")}>
                                Cancel
                            </MenuItem>
                        </Popover>
                    </Box>
                </Box>

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
                            variant="standard"
                            fullWidth
                            multiline
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    )}
                </Box>

                <Typography sx={{ mt: 2 }} fontSize={14} color="primary">
                    <strong>Scheduled:</strong>{" "}
                    {format(new Date(item.scheduledDate), "dd MMM yyyy, hh:mm a")}
                </Typography>


            </DialogContent>
        </Dialog>
    );
}
