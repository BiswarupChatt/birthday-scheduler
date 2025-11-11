import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import SectionHeader from "@/components/SectionHeader";
import { resetPassword } from "@/lib/axios/apicalls";

const Account = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Check new password match before sending to backend
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    // ✅ Optional: ensure new password isn’t empty or same as old
    if (!formData.oldPassword || !formData.newPassword) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(formData.oldPassword, formData.newPassword);
      setSuccess(res.message || "Password updated successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setError(msg);
      console.error("Reset Password Error:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Account
      </Typography>

      <SectionHeader title="Reset Password" description="Reset your password" />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 2,
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          label="Old Password"
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Update Password"}
        </Button>
      </Box>
    </>
  );
};

export default Account;
