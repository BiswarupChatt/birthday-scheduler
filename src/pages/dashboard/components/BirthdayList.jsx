import { useEffect, useState } from "react";
import SectionSubHeader from "@/components/SectionSubHeader";
import {
    Paper, Typography, Chip, Button, Box, Grid, IconButton, TextField
} from '@mui/material';
import { CalendarToday, Edit, Check } from '@mui/icons-material';
import { format, differenceInDays, addYears, isBefore } from "date-fns";
import { getUpcomingBirthdays } from "@/lib/axios/apicalls";
import BirthdaySkeleton from "./BirthdaySkeleton";
import ScheduleModal from "./ScheduleModal";

export default function BirthdayList() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);
    const [editMode, setEditMode] = useState(false);
    const [tempDays, setTempDays] = useState(days);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);

    useEffect(() => {
        fetchBirthdays(days);
    }, [days]);

    const fetchBirthdays = async (selectedDays) => {
        try {
            setLoading(true);
            const res = await getUpcomingBirthdays(selectedDays);
            setBirthdays(res?.data || []);
        } catch (err) {
            console.error("Error fetching birthdays:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDOB = (dob) => format(new Date(dob), "dd MMM");

    const calculateDaysLeft = (dob) => {
        const today = new Date();
        let birthday = new Date(dob);

        birthday.setFullYear(today.getFullYear());
        if (isBefore(birthday, today)) birthday = addYears(birthday, 1);

        return differenceInDays(birthday, today);
    };

    const saveDays = () => {
        const num = Number(tempDays);

        if (!isNaN(num) && num > 0) {
            setDays(num);
        }

        setEditMode(false);
    };

    const cancelEdit = () => {
        setTempDays(days);
        setEditMode(false);
    };

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionSubHeader title="Upcoming Birthday" />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {!editMode ? (
                        <>
                            <Typography
                                onClick={() => setEditMode(true)}
                                sx={{ cursor: "pointer" }}
                            >
                                {days} Days
                            </Typography>

                            <IconButton size="small" onClick={() => setEditMode(true)}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <TextField
                                type="string"
                                value={tempDays}
                                autoFocus
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                        setTempDays("");
                                        return;
                                    }
                                    if (/^[0-9]+$/.test(val)) {
                                        setTempDays(val);
                                    }
                                }}
                                onBlur={() => {
                                    if (tempDays === "" || tempDays === "0") {
                                        setDays(7);      // reset to default
                                        setTempDays("7");
                                    } else {
                                        setDays(Number(tempDays));
                                    }
                                    setEditMode(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (tempDays === "" || tempDays === "0") {
                                            setDays(7);
                                            setTempDays("7");
                                        } else {
                                            setDays(Number(tempDays));
                                        }
                                        setEditMode(false);
                                    }
                                    if (e.key === "Escape") {
                                        cancelEdit();
                                    }
                                }}
                                size="small"
                                sx={{ width: 80 }}
                                variant="standard"
                            />

                            <IconButton
                                size="small"
                                onClick={() => {
                                    if (tempDays === "") {
                                        setDays(7);
                                        setTempDays("7");
                                    } else {
                                        setDays(Number(tempDays));
                                    }
                                    setEditMode(false);
                                }}
                            >
                                <Check fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>

            {loading && (
                <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <BirthdaySkeleton />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!loading && birthdays.length === 0 && (
                <Box
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        py: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "text.secondary",
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        No Upcoming Birthdays 🎉
                    </Typography>
                </Box>
            )}

            {!loading && (
                <Grid container spacing={2}>
                    {birthdays.map((emp) => (
                        <Grid key={emp._id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 1,
                                    maxWidth: 300,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    bgcolor: "background.default",
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {emp.firstName} {emp.lastName}
                                    </Typography>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDOB(emp.dateOfBirth)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {
                                                emp.designation ? (emp.designation) : null
                                            }
                                        </Typography>
                                    </Box>
                                </Box>

                                <Chip
                                    label={`Birthday in ${emp.diffInDays} days`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />

                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        setSelectedEmp(emp);
                                        setOpenModal(true);
                                    }}
                                    disabled={emp.isMessageScheduled ?? emp.isMessageScheduled}
                                >
                                    {(emp.isMessageScheduled || false) ? "Scheduled" : "Schedule"}
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid >
            )
            }

            <ScheduleModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                employee={selectedEmp}
            />
        </>
    );
}
