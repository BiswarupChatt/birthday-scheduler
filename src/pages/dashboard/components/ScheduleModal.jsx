import { Modal, Button, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BirthdayEditor from "@/components/birthdayEditor/BirthdayEditor";

export default function ScheduleModal({ open, onClose, onScheduled, employee }) {
    if (!employee) return null;

    console.log("employee", employee)

    return (
        <Modal open={open} onClose={onClose}>

            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    height: "95vh",
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 3,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "rgba(0,0,0,0.05)",
                        "&:hover": {
                            bgcolor: "rgba(0,0,0,0.1)"
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" fontWeight={600} mb={2}>
                    Schedule Birthday Wish
                </Typography>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        pr: 1,
                    }}
                >
                    <BirthdayEditor employee={employee} closeModal={onClose} onScheduled={onScheduled} />
                </Box>

                {/* <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            mt: 2
                        }}
                    >
                        <Button onClick={onClose}>Close</Button>
                        <Button variant="contained">Schedule</Button>
                    </Box> */}
            </Box>
        </Modal>
    );
}
