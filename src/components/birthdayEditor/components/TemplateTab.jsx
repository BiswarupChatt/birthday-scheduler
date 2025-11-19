import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";


export default function TemplateTab({ selectedTemplateId, handleTemplateChange, templates }) {
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
                orientation="vertical" // <-- MAKE TEMPLATES VERTICAL
                exclusive
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                sx={{ width: "100%" }} // <-- optional for full width
            >
                {templates.map((t) => (
                    <ToggleButton
                        key={t.id}
                        value={t.id}
                        sx={{ justifyContent: "flex-start", gap: 1 }}
                    >
                        <Box
                            component="img"
                            src={t.url}
                            alt={t.name}
                            sx={{
                                width: 24,
                                height: 24,
                                objectFit: "cover",
                                borderRadius: 1,
                            }} />
                        {t.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Typography
                variant="caption"
                sx={{ mt: 2, display: "block", color: "text.secondary" }}
            >
                Templates sit on top of your photo. You can still move
                and resize the image underneath.
            </Typography>
        </Box>
    );
}