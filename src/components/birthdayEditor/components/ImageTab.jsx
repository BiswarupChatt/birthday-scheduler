import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { RestartAlt } from "@mui/icons-material";
import { Stack, Typography, Button, IconButton, Slider, Box, Paper, Divider } from "@mui/material";

export default function ImageTab({ openFileSelector, photoUrl, handleChangePhoto, nudgeZoom, isPhotoSelected, zoomFactor, changeZoom, changeRotation, photoSettings }) {
    return (
        <Box>
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                }}
            >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 2, textTransform: "uppercase", fontSize: 13 }}
                >
                    Image Controls
                </Typography>

                {/* Upload Controls */}
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                        Manage Photo
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={openFileSelector}
                        >
                            {photoUrl ? "Replace Photo" : "Upload Photo"}
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleChangePhoto}
                            disabled={!photoUrl}
                        >
                            Clear Photo
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Zoom */}
                <Stack spacing={1.3} sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Zoom
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <IconButton
                                size="small"
                                onClick={() => nudgeZoom(-0.1)}
                                disabled={!photoUrl || !isPhotoSelected}
                            >
                                <ZoomOutIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => nudgeZoom(0.1)}
                                disabled={!photoUrl || !isPhotoSelected}
                            >
                                <ZoomInIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Slider
                        size="small"
                        min={0.5}
                        max={2}
                        step={0.05}
                        value={zoomFactor}
                        onChange={(_, v) => changeZoom(v)}
                        disabled={!photoUrl || !isPhotoSelected}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Rotation */}
                <Stack spacing={1.3}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Rotation
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={() => changeRotation(0)}
                            disabled={!photoUrl || !isPhotoSelected}
                        >
                            <RestartAlt fontSize="small" />
                        </IconButton>
                    </Stack>

                    <Slider
                        size="small"
                        min={-180}
                        max={180}
                        step={1}
                        value={photoSettings.rotation}
                        onChange={(_, v) => changeRotation(v)}
                        disabled={!photoUrl || !isPhotoSelected}
                    />
                </Stack>
            </Paper>
        </Box>

    )
}