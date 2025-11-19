import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";

import InsertPhotoIcon from "@mui/icons-material/InsertPhoto"; // <-- add this

export default function TemplateTab({
    selectedTemplateId,
    handleTemplateChange,
    templates
}) {
    return (
        <Box>
            <Typography
                variant="subtitle2"
                fontWeight={600}
                mb={1}
            >
                Choose a Template
            </Typography>

            <ToggleButtonGroup
                orientation="vertical"
                exclusive
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                sx={{ width: "100%" }}
            >
                {templates.map((t) => (
                    <ToggleButton
                        key={t.id}
                        value={t.id}
                        sx={{ justifyContent: "flex-start", gap: 1 }}
                    >
                        {/* --- THUMBNAIL / ICON LOGIC --- */}
                        {t.url ? (
                            <Box
                                component="img"
                                src={t.url}
                                alt={t.name}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px dashed #888",
                                    borderRadius: 1,
                                }}
                            >
                                <InsertPhotoIcon fontSize="small" sx={{ opacity: 0.7 }} />
                            </Box>
                        )}
                        {t.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Typography
                variant="caption"
                sx={{ mt: 2, display: "block", color: "text.secondary" }}
            >
                Templates appear above your uploaded photo. Blank means no overlay.
            </Typography>
        </Box>
    );
}
