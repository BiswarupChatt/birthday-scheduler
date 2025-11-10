import { useState } from "react";

// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    userId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        userId: parseInt(formData.userId, 10),
      };

      console.log("Created post:", response);
      alert("Post submitted successfully!");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit post.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Multi-Step Form
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {step === 1 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Title
                  </Typography>
                  <TextField
                    fullWidth
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter title"
                  />
                </Box>
              )}

              {step === 2 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Body
                  </Typography>
                  <TextField
                    fullWidth
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    multiline
                    minRows={4}
                    required
                    placeholder="Write something..."
                  />
                </Box>
              )}

              {step === 3 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    User ID
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                    placeholder="e.g., 1"
                  />
                </Box>
              )}

              <Stack direction="row" justifyContent="space-between">
                {step > 1 ? (
                  <Button variant="outlined" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <Box /> // spacer to keep layout
                )}

                {step < 3 ? (
                  <Button variant="contained" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="contained" color="success">
                    Submit
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
