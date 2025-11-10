import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

export default function PageWrapper({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default", // Tailwind bg-background
        py: 4, // Tailwind py-8 → 8 * 4 = 32px
      }}
    >
      <Container
        maxWidth="lg" // Tailwind max-w-6xl
        sx={{
          px: { xs: 2, sm: 3, lg: 4 }, // Tailwind px-4 sm:px-6 lg:px-8
        }}
      >
        <Paper
          elevation={1} // Tailwind shadow-sm
          sx={{
            bgcolor: "background.paper", // Tailwind bg-card
            borderRadius: 2, // Tailwind rounded-lg
            px: 3, // Tailwind px-6
            py: 4, // Tailwind py-8
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
