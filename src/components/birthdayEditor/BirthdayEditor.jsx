import React, { useRef, useState, useEffect } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Stack,
    Tab,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { RestartAlt } from "@mui/icons-material";
import TextFieldsIcon from "@mui/icons-material/TextFields";

import {
    Stage,
    Layer,
} from "react-konva";

import temp1 from "../../assets/templates/temp1.png";
import temp2 from "../../assets/templates/temp2.png";
import temp3 from "../../assets/templates/temp3.png";

import EditableImage from "./components/EditableImage";
import EditableText from "./components/EditableText";
import TemplateImage from "./components/TemplateImage";
import TemplateTab from "./components/TemplateTab";

// ---- constants & helpers ---- //

const DEFAULT_CANVAS_SIZE = 300;

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const fitImageToCanvas = (imgWidth, imgHeight, boxSize) => {
    const scale = Math.min(boxSize / imgWidth, boxSize / imgHeight);
    const displayWidth = imgWidth * scale;
    const displayHeight = imgHeight * scale;

    const x = (boxSize - displayWidth) / 2;
    const y = (boxSize - displayHeight) / 2;

    return { scale, x, y };
};

// ---- templates ---- //

const templates = [
    { id: "t1", name: "Template 1", url: temp1 },
    { id: "t2", name: "Template 2", url: temp2 },
    { id: "t3", name: "Template 3", url: temp3 },
];
// ---- main component ---- //

export default function BirthdayEditor() {
    const stageRef = useRef();
    const canvasWrapperRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);

    const [selectedTemplateId, setSelectedTemplateId] = useState("t2");
    const [photoUrl, setPhotoUrl] = useState(null);

    const [photoSettings, setPhotoSettings] = useState({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
    });

    const [fitScale, setFitScale] = useState(1);
    const [zoomFactor, setZoomFactor] = useState(1);

    const [texts, setTexts] = useState([]);
    const [activeTextId, setActiveTextId] = useState(null);
    const [fontFamily, setFontFamily] = useState("Arial");

    const [selectedElement, setSelectedElement] = useState(null);
    const [activeTab, setActiveTab] = useState("templates");

    const isPhotoSelected = selectedElement === "photo";
    const isTextSelected =
        selectedElement && selectedElement.type === "text";

    const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

    // ---- responsive canvas size ---- //

    useEffect(() => {
        const handleResize = () => {
            if (!canvasWrapperRef.current) {
                setCanvasSize(DEFAULT_CANVAS_SIZE);
                return;
            }
            const width =
                canvasWrapperRef.current.offsetWidth || DEFAULT_CANVAS_SIZE;
            const size = Math.min(width - 32, DEFAULT_CANVAS_SIZE);
            setCanvasSize(size);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ---- helpers inside component ---- //

    const loadImageFromFile = (file) => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPhotoUrl(url);
        setSelectedElement("photo");

        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            const { width, height } = img;
            const boxSize = canvasSize || DEFAULT_CANVAS_SIZE;
            const { scale } = fitImageToCanvas(width, height, boxSize);

            setFitScale(scale);
            setZoomFactor(1);

            // Use center coordinates so offset (image.width/2,image.height/2) rotates around center
            setPhotoSettings({
                x: boxSize / 2,          // center x of canvas
                y: boxSize / 2,          // center y of canvas
                scale: scale * 1,
                rotation: 0,
            });
        };
    };

    const openFileSelector = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            loadImageFromFile(file);
        };
        input.click();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        loadImageFromFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleTemplateChange = (_, id) => {
        if (id) setSelectedTemplateId(id);
    };

    const handleStageMouseDown = (e) => {
        const clickedEmpty = e.target === e.target.getStage();
        if (clickedEmpty) {
            setSelectedElement(null);
            setActiveTextId(null);
        }
    };

    const handleExport = () => {
        if (!stageRef.current) return;
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });

        const link = document.createElement("a");
        link.download = "birthday-card.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // Zoom controls
    const applyZoom = (zoom) => {
        setZoomFactor(zoom);
        setPhotoSettings((prev) => ({
            ...prev,
            scale: fitScale * zoom,
        }));
        setSelectedElement("photo");
    };

    const changeZoom = (value) => {
        if (Array.isArray(value)) return;
        const z = clamp(value, 0.5, 2);
        applyZoom(z);
    };

    const nudgeZoom = (delta) => {
        setZoomFactor((prevZoom) => {
            const nextZoom = clamp(prevZoom + delta, 0.1, 3);
            setPhotoSettings((prev) => ({
                ...prev,
                scale: fitScale * nextZoom,
            }));
            return nextZoom;
        });
        setSelectedElement("photo");
    };

    // Rotation controls
    const changeRotation = (value) => {
        if (Array.isArray(value)) return;
        setPhotoSettings((prev) => ({ ...prev, rotation: value }));
        setSelectedElement("photo");
    };

    // Text actions
    const addText = () => {
        if (!photoUrl) return; // keep same feature behaviour
        const id = Date.now().toString();
        const newText = {
            id,
            text: "Your text",
            x: canvasSize / 2 - 100,
            y: canvasSize / 2,
            fontSize: 36,
            fontFamily,
            fill: "#000000",
        };
        setTexts((prev) => [...prev, newText]);
        setActiveTextId(id);
        setSelectedElement({ type: "text", id });
    };

    const updateTextItem = (updated) => {
        setTexts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    const handleActiveTextChange = (value) => {
        setTexts((prev) =>
            prev.map((t) =>
                t.id === activeTextId ? { ...t, text: value } : t
            )
        );
    };

    const handleFontChange = (e) => {
        const value = e.target.value;
        setFontFamily(value);
        setTexts((prev) =>
            prev.map((t) =>
                t.id === activeTextId ? { ...t, fontFamily: value } : t
            )
        );
    };

    const deleteText = (id) => {
        setTexts((prev) => prev.filter((t) => t.id !== id));
        setActiveTextId(null);
        setSelectedElement(null);
    };

    const handleChangePhoto = () => {
        setPhotoUrl(null);
        setTexts([]);
        setActiveTextId(null);
        setSelectedElement(null);
        setFitScale(1);
        setZoomFactor(1);
        setPhotoSettings({
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
        });
    };

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
    };

    // ---- layout ---- //

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0} color="transparent">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight={600}>
                        Birthday Template Editor
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={handleChangePhoto}
                            disabled={!photoUrl}
                        >
                            Change Photo
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleExport}
                            disabled={!photoUrl}
                        >
                            Export as PNG
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    alignItems="flex-start"
                >
                    {/* LEFT: CANVAS AREA */}
                    <Paper
                        elevation={3}
                        ref={canvasWrapperRef}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        sx={{
                            p: 1,
                            flex: { xs: "0 0 auto", md: "0 0 360px" },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: DEFAULT_CANVAS_SIZE + 32,
                            position: "relative",
                        }}
                    >

                        <Stage
                            width={canvasSize}
                            height={canvasSize}
                            ref={stageRef}
                            onMouseDown={handleStageMouseDown}
                            onTouchStart={handleStageMouseDown}
                        >
                            <Layer>
                                {/* Base photo */}
                                {photoUrl && (
                                    <EditableImage
                                        imageUrl={photoUrl}
                                        settings={photoSettings}
                                        isSelected={selectedElement === "photo"}
                                        onSelect={() => {
                                            setSelectedElement("photo");
                                            setActiveTextId(null);
                                        }}
                                        onChange={(newSettings) =>
                                            setPhotoSettings(newSettings)
                                        }
                                    />
                                )}

                                {/* Template overlay */}
                                {currentTemplate && (
                                    <TemplateImage
                                        url={currentTemplate.url}
                                        size={canvasSize}
                                    />
                                )}

                                {/* Texts on top */}
                                {texts.map((item) => (
                                    <EditableText
                                        key={item.id}
                                        item={item}
                                        isSelected={
                                            selectedElement &&
                                            selectedElement.type === "text" &&
                                            selectedElement.id === item.id
                                        }
                                        onSelect={() => {
                                            setSelectedElement({
                                                type: "text",
                                                id: item.id,
                                            });
                                            setActiveTextId(item.id);
                                        }}
                                        onChange={updateTextItem}
                                    />
                                ))}
                            </Layer>
                        </Stage>
                    </Paper>

                    {/* RIGHT: CONTROLLER TABS */}
                    <Paper
                        elevation={3}
                        sx={{
                            flex: 1,
                            borderRadius: 3,
                            p: 2,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{ mb: 2 }}
                        >
                            <Tab label="Templates" value="templates" />
                            <Tab label="Image" value="image" />
                            <Tab label="Text" value="text" />
                        </Tabs>

                        {/* TEMPLATES TAB */}
                        {activeTab === "templates" && (
                            <>
                                <TemplateTab
                                    selectedTemplateId={selectedTemplateId}
                                    handleTemplateChange={handleTemplateChange}
                                    templates={templates}
                                />
                            </>
                        )}


                        {/* IMAGE TAB */}
                        {activeTab === "image" && (
                            <Stack spacing={2}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                >
                                    Image Controls
                                </Typography>

                                {/* Upload / change */}
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    alignItems="center"
                                >
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

                                {/* Zoom */}
                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                        >
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
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Select the image on canvas to enable zoom controls.
                                    </Typography>
                                </Box>

                                {/* Rotation */}
                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                        >
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
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Click on the photo inside the canvas to select it,
                                        then rotate as needed.
                                    </Typography>
                                </Box>
                            </Stack>
                        )}

                        {/* TEXT TAB */}
                        {activeTab === "text" && (
                            <Stack spacing={2}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                >
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

                                {isTextSelected && (
                                    <>
                                        {/* Edit Text */}
                                        <TextField
                                            label="Edit Text"
                                            size="small"
                                            value={
                                                texts.find(
                                                    (t) => t.id === activeTextId
                                                )?.text || ""
                                            }
                                            onChange={(e) =>
                                                handleActiveTextChange(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {/* Text styling toolbar */}
                                        <Stack direction="row" spacing={1}>
                                            <ToggleButtonGroup size="small">
                                                <ToggleButton
                                                    value="bold"
                                                    selected={texts.find(t => t.id === activeTextId)?.fontWeight === "bold"}
                                                    onClick={() => {
                                                        setTexts(prev =>
                                                            prev.map(t =>
                                                                t.id === activeTextId
                                                                    ? { ...t, fontWeight: t.fontWeight === "bold" ? "normal" : "bold" }
                                                                    : t
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <b>B</b>
                                                </ToggleButton>

                                                <ToggleButton
                                                    value="italic"
                                                    selected={texts.find(t => t.id === activeTextId)?.fontStyle === "italic"}
                                                    onClick={() => {
                                                        setTexts(prev =>
                                                            prev.map(t =>
                                                                t.id === activeTextId
                                                                    ? { ...t, fontStyle: t.fontStyle === "italic" ? "normal" : "italic" }
                                                                    : t
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <i>I</i>
                                                </ToggleButton>

                                                <ToggleButton
                                                    value="underline"
                                                    selected={texts.find(t => t.id === activeTextId)?.textDecoration === "underline"}
                                                    onClick={() => {
                                                        setTexts(prev =>
                                                            prev.map(t =>
                                                                t.id === activeTextId
                                                                    ? { ...t, textDecoration: t.textDecoration === "underline" ? "none" : "underline" }
                                                                    : t
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <u>U</u>
                                                </ToggleButton>
                                            </ToggleButtonGroup>

                                            <input
                                                type="color"
                                                style={{ width: 40, height: 40, border: "none", background: "transparent", padding: 0 }}
                                                value={texts.find(t => t.id === activeTextId)?.fill || "#000"}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    setTexts(prev => prev.map(t => t.id === activeTextId ? { ...t, fill: color } : t));
                                                }}
                                            />
                                        </Stack>



                                        {/* Font Family */}
                                        <FormControl size="small">
                                            <InputLabel>Font</InputLabel>
                                            <Select
                                                value={fontFamily}
                                                label="Font"
                                                onChange={handleFontChange}
                                            >
                                                <MenuItem value="Arial">
                                                    Arial
                                                </MenuItem>
                                                <MenuItem value="Roboto">
                                                    Roboto
                                                </MenuItem>
                                                <MenuItem value="Georgia">
                                                    Georgia
                                                </MenuItem>
                                                <MenuItem value="Courier New">
                                                    Courier New
                                                </MenuItem>
                                            </Select>
                                        </FormControl>

                                        {/* Font size slider */}
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                                mb={1}
                                            >
                                                Font Size
                                            </Typography>
                                            <Slider
                                                size="small"
                                                min={10}
                                                max={100}
                                                step={1}
                                                value={
                                                    texts.find(
                                                        (t) =>
                                                            t.id ===
                                                            activeTextId
                                                    )?.fontSize || 32
                                                }
                                                onChange={(_, v) =>
                                                    updateTextItem({
                                                        ...texts.find(
                                                            (t) =>
                                                                t.id ===
                                                                activeTextId
                                                        ),
                                                        fontSize: v,
                                                    })
                                                }
                                            />
                                        </Box>

                                        {/* DELETE TEXT */}
                                        <Button
                                            color="error"
                                            variant="outlined"
                                            onClick={() =>
                                                deleteText(activeTextId)
                                            }
                                        >
                                            Delete Text
                                        </Button>
                                    </>
                                )}

                                {!isTextSelected && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Click on any text in the canvas to edit
                                        its content and style.
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}


