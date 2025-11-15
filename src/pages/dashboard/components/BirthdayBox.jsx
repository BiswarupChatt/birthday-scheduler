import SectionSubHeader from "@/components/SectionSubHeader";
import { Paper, Typography, Chip, Button, Box, Avatar, IconButton } from '@mui/material';
import { Cake, CalendarToday, Schedule, MoreVert } from '@mui/icons-material';

export default function BirthdayBox({ name, dob, birthdayIn }) {
    return (
        <>
            <SectionSubHeader title="Upcoming Birthday" />

            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    borderRadius: 1,
                    maxWidth: 350,
                    display: 'flex',
                    flexDirection: "column",
                    gap: 2,
                    bgcolor: "background.default",
                }}
            >
                {/* Name + DOB */}
                <Box>
                    <Typography variant="h6" fontWeight={600}>
                        {name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {dob}
                        </Typography>
                    </Box>
                </Box>

                {/* Chip + Button */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip label={`Birthday in ${birthdayIn} days`} size="small" color="primary" variant="outlined" />
                    <Button variant="contained" size="small">Schedule</Button>
                </Box>
            </Paper>
        </>
    );

}
