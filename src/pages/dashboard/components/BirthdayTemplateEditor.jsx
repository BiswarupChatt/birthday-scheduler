import React, { useRef, useState, useEffect } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Stack,
    TextField,
    Tabs,
    Tab,
    Toolbar,
    Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TextFieldsIcon from "@mui/icons-material/TextFields";

import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";
import useImage from "use-image";

import temp1 from "../../../assets/templates/temp1.png";
import temp2 from "../../../assets/templates/temp2.png";
import temp3 from "../../../assets/templates/temp3.png";

// ---------- helpers ---------- //
const DEFAULT_CANVAS_SIZE = 350;
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const fitImageToCanvas = (imgWidth, imgHeight, boxSize) => {
    const scale = Math.min(boxSize / imgWidth, boxSize / imgHeight);
    const displayWidth = imgWidth * scale;
    const displayHeight = imgHeight * scale;
    const x = (boxSize - displayWidth) / 2;
    const y = (boxSize - displayHeight) / 2;
    return { scale, x, y };
};

// ---------- small Konva wrappers ---------- //
const TemplateImage = ({ url, size, onSelect }) => {
    const [image] = useImage(url);
    if (!image) return null;
    return (
        <KonvaImage
            image={image}
            width={size}
            height={size}
            onClick={onSelect}
            onTap={onSelect}
            listening={false}
        />
    );
};

const EditableImage = ({ imageUrl, settings, isSelected, onSelect, onChange }) => {
    const [image] = useImage(imageUrl);
    if (!image) return null;

    return (
        <KonvaImage
            image={image}
            x={settings.x}
            y={settings.y}
            draggable
            rotation={settings.rotation}
            scaleX={settings.scale}
            scaleY={settings.scale}
            offsetX={image.width / 2}
            offsetY={image.height / 2}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => onChange({ ...settings, x: e.target.x(), y: e.target.y() })}
            onTransformEnd={(e) => {
                const node = e.target;
                const sx = node.scaleX();
                node.scaleX(1);
                node.scaleY(1);
                onChange({ ...settings, x: node.x(), y: node.y(), rotation: node.rotation(), scale: settings.scale * sx });
            }}
        />
    );
};

const EditableText = ({ item, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef(null);
    const trRef = useRef(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, item]);

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
                fontStyle={item.fontStyle || "normal"}
                textDecoration={item.textDecoration || ""}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => onChange({ ...item, x: e.target.x(), y: e.target.y() })}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...item,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: Math.max(8, Math.round(item.fontSize * scaleX)),
                    });
                }}
            />

            {isSelected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled
                    enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                />
            )}
        </>
    );
};

// ---------- main component ---------- //
export default function BirthdayTemplateEditor() {
    const stageRef = useRef();
    const canvasWrapperRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);

    const templates = [
        { id: "t1", name: "Template 1", url: temp1 },
        { id: "t2", name: "Template 2", url: temp2 },
        { id: "t3", name: "Template 3", url: temp3 },
    ];

    // Editor state
    const [activeTab, setActiveTab] = useState("template");
    const [selectedTemplateId, setSelectedTemplateId] = useState("t2");

    const [photoUrl, setPhotoUrl] = useState(null);
    const [photoSettings, setPhotoSettings] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
    const [fitScale, setFitScale] = useState(1);
    const [zoomFactor, setZoomFactor] = useState(1);

    const [texts, setTexts] = useState([]);
    const [activeTextId, setActiveTextId] = useState(null);
    const [fontFamily, setFontFamily] = useState("Arial");

    // selectedElement can be: null | "template" | "photo" | { type: "text", id }
    const [selectedElement, setSelectedElement] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            if (!canvasWrapperRef.current) {
                setCanvasSize(DEFAULT_CANVAS_SIZE);
                return;
            }
            const width = canvasWrapperRef.current.offsetWidth || DEFAULT_CANVAS_SIZE;
            const size = Math.min(width - 32, DEFAULT_CANVAS_SIZE);
            setCanvasSize(size);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto switch tab when selection changes
    useEffect(() => {
        if (!selectedElement) {
            setActiveTab("template");
            return;
        }
        if (selectedElement === "photo") setActiveTab("image");
        else if (selectedElement === "template") setActiveTab("template");
        else if (selectedElement.type === "text") setActiveTab("text");
    }, [selectedElement]);

    // file loading & fitting
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
            setZoomFactor(1);
            setPhotoSettings({ x: x + (width * scale) / 2, y: y + (height * scale) / 2, scale, rotation: 0 });
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

    // zoom & rotate
    const applyZoom = (zoom) => {
        setZoomFactor(zoom);
        setPhotoSettings((prev) => ({ ...prev, scale: fitScale * zoom }));
        setSelectedElement("photo");
    };
    const changeZoom = (value) => {
        if (Array.isArray(value)) value = value[0];
        const z = clamp(value ?? zoomFactor, 0.5, 2);
        applyZoom(z);
    };
    const changeRotation = (value) => {
        if (Array.isArray(value)) value = value[0];
        setPhotoSettings((prev) => ({ ...prev, rotation: value ?? prev.rotation }));
        setSelectedElement("photo");
    };

    // text helpers
    const addText = () => {
        if (!photoUrl) return;
        const id = Date.now().toString();
        const newText = {
            id,
            text: "Your text",
            x: canvasSize / 2 - 50,
            y: canvasSize / 2,
            fontSize: 36,
            fontFamily,
            fill: "#000000",
        };
        setTexts((p) => [...p, newText]);
        setActiveTextId(id);
        setSelectedElement({ type: "text", id });
    };
    const updateTextItem = (updated) => setTexts((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    const deleteText = (id) => {
        setTexts((p) => p.filter((t) => t.id !== id));
        setActiveTextId(null);
        setSelectedElement(null);
    };

    const handleActiveTextChange = (value) => {
        setTexts((p) => p.map((t) => (t.id === activeTextId ? { ...t, text: value } : t)));
    };
    const handleFontChange = (e) => {
        const value = e.target.value;
        setFontFamily(value);
        setTexts((p) => p.map((t) => (t.id === activeTextId ? { ...t, fontFamily: value } : t)));
    };

    const changeTemplate = (_, id) => id && setSelectedTemplateId(id);

    const handleStageMouseDown = (e) => {
        const clickedEmpty = e.target === e.target.getStage();
        if (clickedEmpty) {
            setSelectedElement(null);
            setActiveTextId(null);
        }
    };

    const resetPhoto = () => {
        setPhotoUrl(null);
        setTexts([]);
        setActiveTextId(null);
        setSelectedElement(null);
        setFitScale(1);
        setZoomFactor(1);
        setPhotoSettings({ x: 0, y: 0, scale: 1, rotation: 0 });
    };

    const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

    // ---------- UI subcomponents ---------- //
    const TemplateControls = () => (
        <Box>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Templates
            </Typography>
            <Stack spacing={1}>
                {templates.map((t) => (
                    <Button
                        key={t.id}
                        variant={t.id === selectedTemplateId ? "contained" : "outlined"}
                        onClick={() => setSelectedTemplateId(t.id)}
                        startIcon={<img src={t.url} alt={t.name} style={{ width: 28, height: 28, objectFit: "cover" }} />}
                    >
                        {t.name}
                    </Button>
                ))}
            </Stack>
        </Box>
    );

    const ImageControls = () => (
        <Box>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Image
            </Typography>
            <Stack spacing={1}>
                <Button variant="contained" onClick={openFileSelector}>
                    {photoUrl ? "Replace Image" : "Upload Image"}
                </Button>

                {photoUrl && (
                    <>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography>Zoom</Typography>
                            <IconButton size="small" onClick={() => changeZoom(1)}>
                                <RestartAltIcon />
                            </IconButton>
                        </Stack>
                        <Slider
                            size="small"
                            min={0.5}
                            max={2}
                            step={0.01}
                            value={zoomFactor}
                            onChange={(_, v) => changeZoom(v)}
                        />

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography>Rotation</Typography>
                            <IconButton size="small" onClick={() => changeRotation(0)}>
                                <RestartAltIcon />
                            </IconButton>
                        </Stack>
                        <Slider
                            size="small"
                            min={-180}
                            max={180}
                            step={1}
                            value={photoSettings.rotation ?? 0}
                            onChange={(_, v) => changeRotation(v)}
                        />

                        <Button variant="outlined" color="error" onClick={resetPhoto}>
                            Remove Photo
                        </Button>
                    </>
                )}
            </Stack>
        </Box>
    );

    const TextControls = () => {
        const active = texts.find((t) => t.id === activeTextId) || null;
        const toggleStyle = (style) => {
            if (!active) return;
            if (style === "bold") {
                const next = active.fontStyle === "bold" ? "normal" : "bold";
                updateTextItem({ ...active, fontStyle: next });
            }
            if (style === "italic") {
                const next = active.fontStyle === "italic" ? "normal" : "italic";
                updateTextItem({ ...active, fontStyle: next });
            }
            if (style === "underline") {
                const next = active.textDecoration === "underline" ? "" : "underline";
                updateTextItem({ ...active, textDecoration: next });
            }
        };

        return (
            <Box>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button startIcon={<TextFieldsIcon />} variant="contained" onClick={addText}>
                            Add Text
                        </Button>
                        {active && (
                            <Button variant="outlined" color="error" onClick={() => deleteText(active.id)}>
                                Delete
                            </Button>
                        )}
                    </Stack>

                    {active && (
                        <>
                            <TextField label="Edit" size="small" value={active.text} onChange={(e) => handleActiveTextChange(e.target.value)} />

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Stack direction="row" spacing={0.5}>
                                    <Button size="small" onClick={() => toggleStyle("bold")}>
                                        <b>B</b>
                                    </Button>
                                    <Button size="small" onClick={() => toggleStyle("italic")}>
                                        <i>I</i>
                                    </Button>
                                    <Button size="small" onClick={() => toggleStyle("underline")}>
                                        <u>U</u>
                                    </Button>
                                </Stack>

                                <input
                                    type="color"
                                    value={active.fill}
                                    onChange={(e) => updateTextItem({ ...active, fill: e.target.value })}
                                    style={{ width: 36, height: 36, border: "none", padding: 0 }}
                                />

                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Font</InputLabel>
                                    <Select value={active.fontFamily} label="Font" onChange={(e) => updateTextItem({ ...active, fontFamily: e.target.value })}>
                                        <MenuItem value="Arial">Arial</MenuItem>
                                        <MenuItem value="Roboto">Roboto</MenuItem>
                                        <MenuItem value="Georgia">Georgia</MenuItem>
                                        <MenuItem value="Courier New">Courier New</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Box>
                                <Typography variant="body2" mb={1}>
                                    Font Size
                                </Typography>
                                <Slider
                                    size="small"
                                    min={8}
                                    max={120}
                                    step={1}
                                    value={active.fontSize || 36}
                                    onChange={(_, v) => updateTextItem({ ...active, fontSize: Array.isArray(v) ? v[0] : v })}
                                />
                            </Box>
                        </>
                    )}
                </Stack>
            </Box>
        );
    };

    // ---------- render ---------- //
    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0} color="transparent">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight={600}>
                        Birthday Template Editor
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleExport} disabled={!stageRef.current}>
                            Export as PNG
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Grid container spacing={2}>
                    {/* CANVAS - right */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper ref={canvasWrapperRef} sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                            <Stage width={canvasSize} height={canvasSize} ref={stageRef} onMouseDown={handleStageMouseDown} onTouchStart={handleStageMouseDown}>
                                <Layer>
                                    {/* photo (bottom) */}
                                    {photoUrl && (
                                        <EditableImage
                                            imageUrl={photoUrl}
                                            settings={photoSettings}
                                            isSelected={selectedElement === "photo"}
                                            onSelect={() => setSelectedElement("photo")}
                                            onChange={(s) => setPhotoSettings(s)}
                                        />
                                    )}

                                    {/* template sits above photo so transparent areas reveal the photo beneath */}
                                    {currentTemplate && (
                                        <TemplateImage
                                            url={currentTemplate.url}
                                            size={canvasSize}
                                            onSelect={() => {
                                                setSelectedElement("template");
                                            }}
                                        />
                                    )}

                                    {/* texts (top) */}
                                    {texts.map((t) => (
                                        <EditableText
                                            key={t.id}
                                            item={t}
                                            isSelected={selectedElement && selectedElement.type === "text" && selectedElement.id === t.id}
                                            onSelect={() => {
                                                setSelectedElement({ type: "text", id: t.id });
                                                setActiveTextId(t.id);
                                            }}
                                            onChange={updateTextItem}
                                        />
                                    ))}
                                </Layer>
                            </Stage>
                        </Paper>
                    </Grid>

                    {/* CONTROLLER - right */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 1, display: "flex", gap: 1, flexDirection: "column" }}>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                                <Tab label="Template" value="template" />
                                <Tab label="Image" value="image" />
                                <Tab label="Text" value="text" />
                            </Tabs>

                            <Box sx={{ mt: 1 }}>
                                {activeTab === "template" && <TemplateControls />}
                                {activeTab === "image" && <ImageControls />}
                                {activeTab === "text" && <TextControls />}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
