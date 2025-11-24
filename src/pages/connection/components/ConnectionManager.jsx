import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress, Card, CardContent, Avatar, Chip, Divider, Paper } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { resetSession } from "@/lib/axios/apicalls";
import { AccountCircle, Cancel, CheckCircle, WhatsApp } from "@mui/icons-material";

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
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}
        >
            <Card
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: connected ? 'success.main' : 'grey.300',
                                mx: 'auto',
                                mb: 2,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <WhatsApp sx={{ fontSize: 36 }} />
                        </Avatar>

                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            WhatsApp Connection
                        </Typography>

                        <Chip
                            icon={connected ? <CheckCircle /> : <Cancel />}
                            label={connected ? "Connected" : "Not Connected"}
                            color={connected ? "success" : "error"}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Connected State */}
                    {connected ? (
                        <Box>
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'success.50',
                                    border: '1px solid',
                                    borderColor: 'success.200',
                                    borderRadius: 2,
                                    p: 2.5,
                                    mb: 3
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AccountCircle sx={{ color: 'success.main', fontSize: 40 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Logged in as
                                        </Typography>
                                        {user && (
                                            <>
                                                <Typography variant="body1" fontWeight="600">
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.number}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                    <CheckCircle sx={{ color: 'success.main' }} />
                                </Box>
                            </Paper>

                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                size="large"
                                onClick={handleDisconnect}
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Disconnecting...
                                    </>
                                ) : (
                                    "Disconnect WhatsApp"
                                )}
                            </Button>
                        </Box>
                    ) : (
                        /* Disconnected State */
                        <Box>
                            {qrText ? (
                                <Box>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            bgcolor: 'grey.50',
                                            border: '2px dashed',
                                            borderColor: 'grey.300',
                                            borderRadius: 3,
                                            p: 3,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                            fontWeight={500}
                                        >
                                            Scan QR Code with WhatsApp
                                        </Typography>

                                        <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                                            <QRCodeSVG
                                                value={qrText}
                                                size={220}
                                                includeMargin={true}
                                            />
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            Open WhatsApp → Settings → Linked Devices → Link a Device
                                        </Typography>
                                    </Paper>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CircularProgress size={40} sx={{ mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        Generating QR Code...
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 1, display: 'block' }}
                                    >
                                        Please wait a moment
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
