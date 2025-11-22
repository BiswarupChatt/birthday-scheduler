import { useEffect, useState } from "react";
import { Box, Typography, Grid, Chip, useTheme } from "@mui/material";
import { getAllBirthdaySchedules } from "@/lib/axios/apicalls";
import { format } from "date-fns";
import ScheduleListSkeleton from "./ScheduleListSkeleton";
import ScheduleDetailsModal from "./ScheduleDetailsModal";

export default function ScheduleList() {
    const theme = useTheme();

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [open, setOpen] = useState(false);


    const handleOpen = (item) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const getStatusChipProps = (status, theme) => {
        const colors = {
            pending: {
                bg: "#FFF4CC",
                text: "#B58105",
            },
            sent: {
                bg: "#D8FFE5",
                text: "#0C8A3E",
            },
            failed: {
                bg: "#FFE3E3",
                text: "#C62828",
            },
            cancel: {
                bg: "#E5E7EB",
                text: "#374151",
            },
        };

        const chip = colors[status] || colors.pending;

        return {
            label: status.toUpperCase(),
            sx: {
                backgroundColor: chip.bg,
                color: chip.text,
                fontWeight: 600,
            },
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await getAllBirthdaySchedules();
                setSchedules(response);
            } catch (error) {
                console.error("Failed to fetch schedules:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData()
    }, []);

    // ---------------------- RETURN SECTION ----------------------
    return (
        <>
            {loading ? (
                <ScheduleListSkeleton count={6} />
            ) : schedules.length === 0 ? (
                /* Empty State */
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="300px"
                    width="100%"
                    sx={{ textAlign: "center" }}
                >
                    <Typography fontSize={18} fontWeight={600} color="text.secondary">
                        No upcoming schedules
                    </Typography>
                </Box>
            ) : (
                /* Actual Data List */
                <Grid container spacing={2} padding={2}>
                    {schedules.map((item) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item._id}>
                            <Box
                                onClick={() => handleOpen(item)}
                                sx={{
                                    width: "100%",
                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: theme.palette.background.paper,
                                    boxShadow: theme.shadows[3],
                                    transition: "0.25s",
                                    "&:hover": {
                                        boxShadow: theme.shadows[6],
                                        transform: "scale(1.02)",
                                    },
                                }}
                            >
                                <Typography fontWeight={700} fontSize={18} sx={{ mt: 1.5 }}>
                                    {item.employeeId.firstName} {item.employeeId.lastName}
                                </Typography>

                                <Typography fontSize={13} color="text.secondary">
                                    {item.employeeId.designation} • {item.employeeId.empId}
                                </Typography>

                                <Typography fontSize={14} sx={{ mt: 1 }}>
                                    {item.message.length > 20
                                        ? item.message.substring(0, 20) + "..."
                                        : item.message}
                                </Typography>

                                <Typography fontSize={13} color="primary" sx={{ mt: 1 }}>
                                    Scheduled:{" "}
                                    {format(new Date(item.scheduledDate), "dd MMM yyyy, hh:mm a")}
                                </Typography>

                                <Chip
                                    size="small"
                                    {...getStatusChipProps(item.status, theme)}
                                    sx={{
                                        mt: 1.5,
                                        px: 1.2,
                                        ...getStatusChipProps(item.status, theme).sx,
                                    }}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ScheduleDetailsModal
                open={open}
                handleClose={handleClose}
                item={selectedItem}
                getStatusChipProps={getStatusChipProps}
                theme={theme}
            />
        </>
    );
}
