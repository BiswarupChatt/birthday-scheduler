import { useState } from "react";

// MUI imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function SimpleForm() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      body: formData.body,
      userId: parseInt(formData.userId, 10),
    };

    try {
      console.log("Created post:", payload);
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error submitting post.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Form
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Customize your application layout and preferences
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
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

                <TextField
                  label="User ID"
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    alignSelf: "flex-start",
                    px: 3,
                    py: 1,
                  }}
                >
                  Submit Post
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
