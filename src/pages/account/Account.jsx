import { Typography, Box, Divider } from "@mui/material";
import SectionHeader from "@/components/SectionHeader";
import ResetPasswordForm from "./components/ResetPasswordForm";

const Account = () => {
  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        Account
      </Typography>

      <Divider sx={{ my: 3 }} />

      <SectionHeader
        title="Security"
        description="Manage your password and account security"
      />

      <Box sx={{ mt: 2 }}>
        <ResetPasswordForm />
      </Box>
    </>
  );
};

export default Account;
