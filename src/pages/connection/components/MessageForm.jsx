import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack, Divider } from "@mui/material";
import { sendNow } from "../../../lib/axios/apicalls"

const MessageForm = () => {
    const [groupName, setGroupName] = useState("");
    const [message, setMessage] = useState("");
    const [delay, setDelay] = useState("");

    const handleSendNow = async () => {
        try {
            await sendNow({ groupName, message });
            alert("✅ Message sent successfully!");
        } catch (err) {
            alert("❌ Error: " + err.message);
        }
    };

    return (
        <Box
            sx={{
                p: 4,
                maxWidth: 500,
                mx: "auto",
                mt: 8,
                bgcolor: "white",
                borderRadius: 3,
                boxShadow: 4,
            }}
        >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                WhatsApp Message Automation
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Message"
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                />
                <Divider />
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="success" fullWidth onClick={handleSendNow}>
                        Send Now
                    </Button>
                </Stack>
                <TextField
                    label="Delay (minutes)"
                    type="number"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    fullWidth
                />
            </Stack>
        </Box>
    );
};

export default MessageForm;
