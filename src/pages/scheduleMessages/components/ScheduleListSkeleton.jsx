import { Box, Grid, Skeleton } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ScheduleListSkeleton({ count = 6 }) {
    const theme = useTheme();

    return (

        <Grid container spacing={2} padding={2}>
            {Array.from({ length: count }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Box
                        sx={{
                            width: "100%",
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.shadows[3],
                        }}
                    >
                        {/* Name */}
                        <Skeleton variant="text" width="60%" height={28} sx={{ mt: 1.5 }} />

                        {/* Designation */}
                        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />

                        {/* Message */}
                        <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />

                        {/* Scheduled */}
                        <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />

                        {/* Chip */}
                        <Skeleton variant="rounded" width={80} height={28} sx={{ mt: 1.5 }} />
                    </Box>
                </Grid>
            ))}
        </Grid>

    );
}
