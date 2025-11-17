import { useEffect, useState } from "react";
import SectionSubHeader from "@/components/SectionSubHeader";
import { Paper, Typography, Chip, Button, Box, Grid } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { format, differenceInDays, addYears, isBefore } from "date-fns";
import { getUpcomingBirthdays } from "@/lib/axios/apicalls";
import BirthdaySkeleton from "./BirthdaySkeleton";

export default function BirthdayBox() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        try {
            setLoading(true);
            const res = await getUpcomingBirthdays(500);
            setBirthdays(res?.data || []);
        } catch (err) {
            console.error("Error fetching birthdays:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDOB = (dob) => {
        return format(new Date(dob), "dd MMM");
    };

    const calculateDaysLeft = (dob) => {
        const today = new Date();
        let birthday = new Date(dob);

        birthday.setFullYear(today.getFullYear());

        if (isBefore(birthday, today)) {
            birthday = addYears(birthday, 1);
        }

        return differenceInDays(birthday, today);
    };

    return (
        <>
            <SectionSubHeader title="Upcoming Birthday" />

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
                <Typography>No upcoming birthdays found 🎉</Typography>
            )}

            {!loading &&
                <Grid container spacing={2}>
                    {
                        birthdays.map((emp) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Paper
                                    key={emp._id}
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 1,
                                        maxWidth: 300,
                                        display: 'flex',
                                        flexDirection: "column",
                                        gap: 2,
                                        bgcolor: "background.default",
                                    }}
                                >
                                    {/* Name + DOB */}
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>
                                            {emp.firstName} {emp.lastName}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDOB(emp.dateOfBirth)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Chip
                                        label={`Birthday in ${calculateDaysLeft(emp.dateOfBirth)} days`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Button variant="contained" size="small">Schedule</Button>
                                </Paper>
                            </Grid>
                        ))
                    }
                </Grid>
            }
        </>
    );
}
