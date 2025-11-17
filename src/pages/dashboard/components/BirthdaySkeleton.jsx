import { Paper, Skeleton, Box } from "@mui/material";

export default function BirthdaySkeleton() {
    return (
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
            }}
        >
            <Box>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={18} sx={{ mt: 1 }} />
            </Box>

            <Skeleton variant="rounded" width="50%" height={28} />
            <Skeleton variant="rounded" width="40%" height={32} />
        </Paper>
    );
}
