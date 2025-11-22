import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import { format } from "date-fns";

export default function ScheduleDetailsModal({ open, handleClose, item, getStatusChipProps, theme }) {
    if (!item) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                {item.employeeId.firstName} {item.employeeId.lastName}
            </DialogTitle>

            <DialogContent>
                {/* Image */}
                <Box
                    component="img"
                    src={item.imageUrl}
                    alt="schedule"
                    sx={{
                        mx: 'auto',
                        width: .4,
                        height: .4,
                        borderRadius: 2,
                        objectFit: "cover",
                        mb: 2,
                    }}
                />

                <Typography fontSize={14} color="text.secondary" >
                    {item.employeeId.designation} • {item.employeeId.empId}
                </Typography>

                <Typography sx={{ mt: 2 }} fontSize={15}>
                    <strong>Message:</strong> {item.message}
                </Typography>

                {/* Scheduled */}
                <Typography sx={{ mt: 2 }} fontSize={14} color="primary">
                    <strong>Scheduled:</strong> {format(new Date(item.scheduledDate), "dd MMM yyyy, hh:mm a")}
                </Typography>

                {/* Status */}
                <Box sx={{ mt: 2 }}>
                    <Chip
                        size="small"
                        {...getStatusChipProps(item.status, theme)}
                        sx={{
                            px: 1.2,
                            ...getStatusChipProps(item.status, theme).sx,
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}
