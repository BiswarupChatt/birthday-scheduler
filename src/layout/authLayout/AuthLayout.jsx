import { Outlet, Navigate } from "react-router-dom";
import { Box, Container, Paper } from "@mui/material";
import { useAtomValue } from "jotai";
import { isAuthenticatedAtom } from "../../lib/state/atoms/authAtoms";

const AuthLayout = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Logo or Brand */}
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              height: 40,
              mb: 4
            }}
          />
          
          {/* Auth Pages (Login/Signup) will be rendered here */}
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;