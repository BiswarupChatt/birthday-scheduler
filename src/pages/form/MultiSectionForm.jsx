import { useState } from "react";

// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

export default function MultiSectionForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    body: "",
    userId: "",
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      title: formData.title,
      body: formData.body,
      userId: parseInt(formData.userId, 10),
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
    };

    try {
      console.log("Submitted:", res);
      alert("Form submitted successfully!");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Submission failed.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Multi-Section Form
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Section 1: User Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  User Info
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Section 2: Post Details */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Post Details
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    minRows={4}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Section 3: Meta Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Meta Info
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    type="number"
                    label="User ID"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., news, product, announcement"
                  />
                </Stack>
              </Box>

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ px: 3, py: 1 }}
                >
                  Submit
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
