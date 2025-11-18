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
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import TextFieldsIcon from "@mui/icons-material/TextFields";

import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";
import useImage from "use-image";

import temp1 from "../../../assets/templates/temp1.png";
import temp2 from "../../../assets/templates/temp2.png";
import temp3 from "../../../assets/templates/temp3.png";

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

// ---- Konva helper components ---- //

const EditableImage = ({ imageUrl, settings, isSelected, onSelect, onChange }) => {
    const [image] = useImage(imageUrl);

    if (!image) return null;

    return (
        <>
            <KonvaImage
                image={image}
                draggable
                x={settings.x}
                y={settings.y}
                scaleX={settings.scale}
                scaleY={settings.scale}
                rotation={settings.rotation}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) =>
                    onChange({
                        ...settings,
                        x: e.target.x(),
                        y: e.target.y(),
                    })
                }
            />
            {isSelected && (
                <KonvaText
                    text=""
                    x={settings.x}
                    y={settings.y}
                    listening={false}
                />
            )}
        </>
    );
};

const EditableText = ({ item, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <KonvaText
                ref={shapeRef}
                text={item.text}
                x={item.x}
                y={item.y}
                fontSize={item.fontSize}
                fontFamily={item.fontFamily}
                fill={item.fill}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) =>
                    onChange({
                        ...item,
                        x: e.target.x(),
                        y: e.target.y(),
                    })
                }
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();

                    node.scaleX(1);

                    onChange({
                        ...item,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: item.fontSize * scaleX,
                    });
                }}
            />
            {isSelected && <Transformer ref={trRef} rotateEnabled resizeEnabled />}
        </>
    );
};

const TemplateImage = ({ url, size }) => {
    const [image] = useImage(url);
    if (!image) return null;
    return <KonvaImage image={image} width={size} height={size} listening={false} />;
};

// ---- templates ---- //

const templates = [
    { id: "t1", name: "Template 1", url: temp1 },
    { id: "t2", name: "Template 2", url: temp2 },
    { id: "t3", name: "Template 3", url: temp3 },
];

// ---- main component ---- //

export default function BirthdayTemplateEditor() {
    const stageRef = useRef();
    const canvasWrapperRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);

    const [selectedTemplateId, setSelectedTemplateId] = useState("t2");
    const [photoUrl, setPhotoUrl] = useState(null);

    // base position/rotation + final scale (fitScale * zoomFactor)
    const [photoSettings, setPhotoSettings] = useState({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
    });

    // fit scale from image -> canvas
    const [fitScale, setFitScale] = useState(1);
    // zoom controlled by slider (starts from center = 1)
    const [zoomFactor, setZoomFactor] = useState(1);

    const [texts, setTexts] = useState([]);
    const [activeTextId, setActiveTextId] = useState(null);
    const [fontFamily, setFontFamily] = useState("Arial");

    const [selectedElement, setSelectedElement] = useState(null); // "photo" | { type:"text", id } | null

    const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

    // ---- responsive canvas size ---- //

    useEffect(() => {
        const handleResize = () => {
            if (!canvasWrapperRef.current) {
                setCanvasSize(DEFAULT_CANVAS_SIZE);
                return;
            }
            const width = canvasWrapperRef.current.offsetWidth || DEFAULT_CANVAS_SIZE;
            const size = Math.min(width - 32, DEFAULT_CANVAS_SIZE); // padding
            setCanvasSize(size);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ---- file loading & auto-fit ---- //

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
            const { scale, x, y } = fitImageToCanvas(width, height, boxSize);

            setFitScale(scale);
            setZoomFactor(1); // center of slider
            setPhotoSettings({
                x,
                y,
                scale: scale * 1, // initial = fitScale * zoomFactor
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

    // ---- handlers ---- //

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

    // Zoom controls (based on zoomFactor, fitScale is constant baseline)
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
        const z = clamp(value, 0.5, 2); // 1 is center
        applyZoom(z);
    };

    const nudgeZoom = (delta) => {
        setZoomFactor((prevZoom) => {
            const nextZoom = clamp(prevZoom + delta, 0.5, 2);
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
        if (!photoUrl) return;
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
            prev.map((t) => (t.id === activeTextId ? { ...t, text: value } : t))
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

    // ---- views ---- //

    // 1) UPLOADER SCREEN
    if (!photoUrl) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e5e7eb",
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={6}
                        sx={{
                            borderRadius: 4,
                            p: 5,
                            textAlign: "center",
                            border: "1px dashed rgba(148, 163, 184, 0.6)",
                            background:
                                "radial-gradient(circle at top, rgba(56,189,248,0.2), transparent 55%), #020617",
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <Typography variant="h5" fontWeight={600} mb={1} color="#f9fafb">
                            Create a Birthday Post
                        </Typography>
                        <Typography variant="body2" color="#94a3b8" mb={4}>
                            Drop a photo here or upload from your device to start editing.
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={openFileSelector}
                            sx={{ borderRadius: 999, px: 4 }}
                        >
                            Upload Photo
                        </Button>

                        <Typography variant="caption" display="block" mt={3} color="#64748b">
                            Supported: JPG, PNG. After upload, you can pick templates, add text, zoom and rotate.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    // 2) EDITOR SCREEN
    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0} color="transparent">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight={600}>
                        Birthday Template Editor
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={handleChangePhoto}>
                            Change Photo
                        </Button>
                        <Button variant="contained" onClick={handleExport}>
                            Export as PNG
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Stack spacing={2} alignItems="center">
                    {/* CANVAS */}
                    <Paper
                        elevation={3}
                        ref={canvasWrapperRef}
                        sx={{
                            borderRadius: 4,
                            p: 2,
                            width: "100%",
                            maxWidth: DEFAULT_CANVAS_SIZE + 32,
                            display: "flex",
                            justifyContent: "center",
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
                                <EditableImage
                                    imageUrl={photoUrl}
                                    settings={photoSettings}
                                    isSelected={selectedElement === "photo"}
                                    onSelect={() => {
                                        setSelectedElement("photo");
                                        setActiveTextId(null);
                                    }}
                                    onChange={(newSettings) => setPhotoSettings(newSettings)}
                                />

                                {/* Template overlay */}
                                {currentTemplate && <TemplateImage url={currentTemplate.url} size={canvasSize} />}

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
                                            setSelectedElement({ type: "text", id: item.id });
                                            setActiveTextId(item.id);
                                        }}
                                        onChange={updateTextItem}
                                    />
                                ))}
                            </Layer>
                        </Stage>
                    </Paper>

                    {/* TEMPLATE ROW */}
                    <Paper
                        elevation={2}
                        sx={{
                            width: "100%",
                            borderRadius: 3,
                            p: 1.5,
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Templates
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            value={selectedTemplateId}
                            onChange={handleTemplateChange}
                        >
                            {templates.map((t) => (
                                <ToggleButton key={t.id} value={t.id}>
                                    <Box
                                        component="img"
                                        src={t.url}
                                        alt={t.name}
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                            mr: 1,
                                        }}
                                    />
                                    {t.name}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Paper>

                    {/* IMAGE CONTROLS */}
                    <Paper
                        elevation={2}
                        sx={{
                            width: "100%",
                            borderRadius: 3,
                            p: 2,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={3}
                            alignItems={{ xs: "stretch", md: "center" }}
                            justifyContent="space-between"
                        >
                            {/* Zoom */}
                            <Box sx={{ flex: 1 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2" fontWeight={500}>
                                        Zoom
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => nudgeZoom(-0.1)}>
                                            <ZoomOutIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => nudgeZoom(0.1)}>
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
                                />
                            </Box>

                            {/* Rotation */}
                            <Box sx={{ flex: 1 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2" fontWeight={500}>
                                        Rotation
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            changeRotation((photoSettings.rotation + 15) % 360)
                                        }
                                    >
                                        <RotateRightIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                                <Slider
                                    size="small"
                                    min={-180}
                                    max={180}
                                    step={1}
                                    value={photoSettings.rotation}
                                    onChange={(_, v) => changeRotation(v)}
                                />
                            </Box>
                        </Stack>
                    </Paper>

                    {/* TEXT CONTROLS */}
                    <Paper
                        elevation={2}
                        sx={{
                            width: "100%",
                            borderRadius: 3,
                            p: 2,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "center" }}
                            justifyContent="space-between"
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconButton color="primary" onClick={addText}>
                                    <TextFieldsIcon />
                                </IconButton>
                                <Typography variant="body2">
                                    Tap to add text. Drag it anywhere on the image.
                                </Typography>
                            </Stack>

                            {activeTextId && (
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    sx={{ mt: { xs: 2, md: 0 } }}
                                >
                                    <TextField
                                        label="Selected Text"
                                        size="small"
                                        value={texts.find((t) => t.id === activeTextId)?.text || ""}
                                        onChange={(e) => handleActiveTextChange(e.target.value)}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel id="font-label">Font</InputLabel>
                                        <Select
                                            labelId="font-label"
                                            label="Font"
                                            value={fontFamily}
                                            onChange={handleFontChange}
                                        >
                                            <MenuItem value="Arial">Arial</MenuItem>
                                            <MenuItem value="Roboto">Roboto</MenuItem>
                                            <MenuItem value="Georgia">Georgia</MenuItem>
                                            <MenuItem value="Courier New">Courier New</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
