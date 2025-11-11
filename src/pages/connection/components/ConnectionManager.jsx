import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { resetSession } from "@/lib/axios/apicalls";

export default function ConnectionManager() {
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState(null);
    const [qrText, setQrText] = useState(null);
    const [loading, setLoading] = useState(false);

    const socketURL = import.meta.env.VITE_API_SOCKET_URL

    useEffect(() => {
        const ws = new WebSocket(socketURL);

        ws.onmessage = (msg) => {
            const { event, data } = JSON.parse(msg.data);

            if (event === "qr") {
                setQrText(data.qr);
                setConnected(false);
                setUser(null);
            } else if (event === "connected") {
                setConnected(true);
                setQrText(null);
                setUser(data.user);
            } else if (event === "disconnected") {
                setConnected(false);
                setUser(null);
            } else if (event === "status") {
                setConnected(data.connected);
                if (data.user) setUser(data.user);
                if (!data.connected && data.qr) setQrText(data.qr);
            }
        };

        return () => ws.close();
    }, []);

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            const data = await resetSession();
            if (data.success) {
                setConnected(false);
                setUser(null);
                setQrText(null);
            } else {
                alert("Failed to disconnect: " + data.error);
            }
        } catch (err) {
            alert("Error disconnecting: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                mt: 4,
                p: 3,
                textAlign: "center",
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: 400,
                mx: "auto",
            }}
        >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                WhatsApp Connection
            </Typography>

            {connected ? (
                <>
                    <Typography color="green" variant="body1">
                        ✅ Connected to WhatsApp
                    </Typography>

                    {user && (
                        <Typography sx={{ mt: 1 }} color="text.secondary">
                            Logged in as: <strong>{user.name} {user.number}</strong>
                        </Typography>
                    )}

                    {/* 👇 Disconnect button shown only when connected */}
                    <Box mt={3}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDisconnect}
                            disabled={loading}
                        >
                            {loading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    <Typography color="error" variant="body1">
                        ❌ Not Connected
                    </Typography>

                    {qrText ? (
                        <Box mt={2}>
                            <Typography variant="body2">Scan this QR with WhatsApp:</Typography>
                            <QRCodeSVG value={qrText} size={250} includeMargin={true} />
                        </Box>
                    ) : (
                        <Box mt={2}>
                            <CircularProgress size={24} />
                            <Typography color="black" variant="body2" mt={1}>
                                Waiting for QR code...
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
