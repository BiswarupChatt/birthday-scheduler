import { Box, Button, FormControl, InputLabel, MenuItem, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';


export default function TextTab({ addText, photoUrl, isTextSelected, texts, activeTextId, handleActiveTextChange, setTexts, fontFamily, handleFontChange, updateTextItem, deleteText }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "#fafafa",
                border: "1px solid #e0e0e0",
            }}
        >
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: "uppercase", fontSize: 13 }}>
                Text Controls
            </Typography>

            {/* Add Text */}
            <Button
                variant="outlined"
                onClick={addText}
                startIcon={<TextFieldsIcon />}
                disabled={!photoUrl}
            >
                Add Text
            </Button>

            {isTextSelected ? (
                <>

                    {/* Edit Text */}
                    <Box>
                        <TextField
                            label="Edit Text"
                            size="small"
                            fullWidth
                            value={texts.find((t) => t.id === activeTextId)?.text || ""}
                            onChange={(e) => handleActiveTextChange(e.target.value)}
                        />
                    </Box>

                    {/* Styling Toolbar */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <ToggleButtonGroup size="small" exclusive={false}>
                            <ToggleButton
                                value="bold"
                                selected={texts.find(t => t.id === activeTextId)?.fontWeight === "bold"}
                                onClick={() =>
                                    setTexts(prev =>
                                        prev.map(t =>
                                            t.id === activeTextId
                                                ? { ...t, fontWeight: t.fontWeight === "bold" ? "normal" : "bold" }
                                                : t
                                        )
                                    )
                                }
                            >
                                <FormatBoldIcon fontSize="small" />
                            </ToggleButton>

                            <ToggleButton
                                value="italic"
                                selected={texts.find(t => t.id === activeTextId)?.fontStyle === "italic"}
                                onClick={() =>
                                    setTexts(prev =>
                                        prev.map(t =>
                                            t.id === activeTextId
                                                ? { ...t, fontStyle: t.fontStyle === "italic" ? "normal" : "italic" }
                                                : t
                                        )
                                    )
                                }
                            >
                                <FormatItalicIcon fontSize="small" />

                            </ToggleButton>

                            <ToggleButton
                                value="underline"
                                selected={texts.find(t => t.id === activeTextId)?.textDecoration === "underline"}
                                onClick={() =>
                                    setTexts(prev =>
                                        prev.map(t =>
                                            t.id === activeTextId
                                                ? { ...t, textDecoration: t.textDecoration === "underline" ? "none" : "underline" }
                                                : t
                                        )
                                    )
                                }
                            >
                                <FormatUnderlinedIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Styled Color Picker Box */}
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                overflow: "hidden",
                                border: "1px solid #ccc",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="color"
                                value={texts.find(t => t.id === activeTextId)?.fill || "#000"}
                                onChange={(e) => {
                                    const color = e.target.value;
                                    setTexts(prev =>
                                        prev.map(t =>
                                            t.id === activeTextId ? { ...t, fill: color } : t
                                        )
                                    );
                                }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                }}
                            />
                        </Box>
                    </Box>


                    {/* Font Family */}
                    <Box>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Font</InputLabel>
                            <Select value={fontFamily} label="Font" onChange={handleFontChange}>
                                <MenuItem value="Arial">Arial</MenuItem>
                                <MenuItem value="Roboto">Roboto</MenuItem>
                                <MenuItem value="Georgia">Georgia</MenuItem>
                                <MenuItem value="Courier New">Courier New</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Font Size */}
                    <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                            Font Size
                        </Typography>

                        <Slider
                            size="small"
                            min={10}
                            max={100}
                            step={1}
                            value={texts.find((t) => t.id === activeTextId)?.fontSize || 32}
                            onChange={(_, v) =>
                                updateTextItem({
                                    ...texts.find(t => t.id === activeTextId),
                                    fontSize: v,
                                })
                            }
                        />
                    </Box>

                    {/* Delete */}
                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() => deleteText(activeTextId)}
                    >
                        Delete Text
                    </Button>
                </>
            ) : (
                <Typography variant="caption" color="text.secondary">
                    Click on any text element in the canvas to edit its content and style.
                </Typography>
            )}
        </Box>

    )
}
