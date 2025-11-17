import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

export default function ScheduleModal({ open, onClose, employee }) {
    if (!employee) return null;

    console.log(employee)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Schedule Birthday Wish</DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography><strong>Name:</strong> {employee.firstName} {employee.lastName}</Typography>
                    <Typography><strong>DOB:</strong> {employee.dateOfBirth}</Typography>
                    <Typography><strong>Designation:</strong> {employee.designation || "N/A"}</Typography>
                    <Typography><strong>Days Left:</strong> {employee.diffInDays}</Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained">Schedule</Button>
            </DialogActions>
        </Dialog>
    );
}
