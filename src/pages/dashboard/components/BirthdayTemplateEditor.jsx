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
    const shapeRef = useRef(null);
    const trRef = useRef(null);

    // Attach the transformer to the selected text
    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, item]); // <= important fix: listen to item updates

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
                onDragEnd={(e) =>
                    onChange({
                        ...item,
                        x: e.target.x(),
                        y: e.target.y()
                    })
                }
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    onChange({
                        ...item,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: item.fontSize * scaleX, // uniform scale
                    });
                }}
            />

            {isSelected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled
                    enabledAnchors={[
                        "top-left",
                        "top-right",
                        "bottom-left",
                        "bottom-right",
                    ]}
                />
            )}
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

    const [selectedElement, setSelectedElement] = useState(null);

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

    const deleteText = (id) => {
        setTexts((prev) => prev.filter((t) => t.id !== id));
        setActiveTextId(null);
        setSelectedElement(null);
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



    // 2) EDITOR SCREEN
    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0} color="transparent">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight={600}>
                        Birthday Template Editor
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleExport}>
                            Export as PNG
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* ---------- MAIN 3 COLUMN GRID ---------- */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",       // mobile
                            md: "180px 1fr 280px", // desktop 3 column
                        },
                        gap: 2,
                    }}
                >

                    {/* -------- LEFT SIDEBAR: TEMPLATE PICKER -------- */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            height: "fit-content",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            position: { md: "sticky" },
                            top: { md: 90 },
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Templates
                        </Typography>

                        <ToggleButtonGroup
                            orientation="vertical"
                            exclusive
                            value={selectedTemplateId}
                            onChange={handleTemplateChange}
                            sx={{ width: "100%" }}
                        >
                            {templates.map((t) => (
                                <ToggleButton key={t.id} value={t.id} sx={{ justifyContent: "flex-start" }}>
                                    <Box
                                        component="img"
                                        src={t.url}
                                        alt={t.name}
                                        sx={{
                                            width: 30,
                                            height: 30,
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

                    {/* -------- CENTER COLUMN: CANVAS -------- */}
                    <Paper
                        elevation={3}
                        ref={canvasWrapperRef}
                        sx={{
                            borderRadius: 4,
                            p: 2,
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

                                {currentTemplate && (
                                    <TemplateImage url={currentTemplate.url} size={canvasSize} />
                                )}

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

                    {/* -------- RIGHT SIDEBAR: EDITING CONTROLLER -------- */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            height: "fit-content",
                            position: { md: "sticky" },
                            top: { md: 90 },
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >

                        {/* ----------------------- */}

                        <Stack spacing={2}>
                            {/* Upload / Update Photo */}
                            <Button
                                variant="contained"
                                onClick={openFileSelector}
                            >
                                {photoUrl ? "Update Photo" : "Upload Photo"}
                            </Button>

                            {/* Add Text */}
                            {photoUrl && (
                                <Button
                                    variant="outlined"
                                    onClick={addText}
                                    startIcon={<TextFieldsIcon />}
                                >
                                    Add Text
                                </Button>
                            )}
                        </Stack>


                        {isPhotoSelected && (
                            <>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Image Controls
                                </Typography>

                                <Box>
                                    <Typography variant="body2" mb={1}>Zoom</Typography>
                                    <Slider
                                        size="small"
                                        min={0.5}
                                        max={2}
                                        step={0.05}
                                        value={zoomFactor}
                                        onChange={(_, v) => changeZoom(v)}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" mb={1}>Rotation</Typography>
                                    <Slider
                                        size="small"
                                        min={-180}
                                        max={180}
                                        step={1}
                                        value={photoSettings.rotation}
                                        onChange={(_, v) => changeRotation(v)}
                                    />
                                </Box>
                            </>
                        )}

                        {isTextSelected && (

                            <>
                                <Button
                                    color="error"
                                    variant="outlined"
                                    onClick={() => deleteText(activeTextId)}
                                >
                                    Delete Text
                                </Button>
                                <Typography variant="subtitle2" fontWeight={600}>Text Controls</Typography>

                                <TextField
                                    label="Edit Text"
                                    size="small"
                                    value={texts.find((t) => t.id === activeTextId)?.text || ""}
                                    onChange={(e) => handleActiveTextChange(e.target.value)}
                                />

                                <Stack direction="row" spacing={1}>
                                    <ToggleButtonGroup size="small">
                                        <ToggleButton
                                            value="bold"
                                            onClick={() =>
                                                updateTextItem({
                                                    ...texts.find((t) => t.id === activeTextId),
                                                    fontStyle: "bold",
                                                })
                                            }
                                        >
                                            <b>B</b>
                                        </ToggleButton>
                                        <ToggleButton
                                            value="italic"
                                            onClick={() =>
                                                updateTextItem({
                                                    ...texts.find((t) => t.id === activeTextId),
                                                    fontStyle: "italic",
                                                })
                                            }
                                        >
                                            <i>I</i>
                                        </ToggleButton>
                                        <ToggleButton
                                            value="underline"
                                            onClick={() =>
                                                updateTextItem({
                                                    ...texts.find((t) => t.id === activeTextId),
                                                    textDecoration: "underline",
                                                })
                                            }
                                        >
                                            <u>U</u>
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    <input
                                        type="color"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            border: "none",
                                            background: "transparent",
                                            padding: 0,
                                        }}
                                        value={texts.find((t) => t.id === activeTextId)?.fill || "#000"}
                                        onChange={(e) =>
                                            updateTextItem({
                                                ...texts.find((t) => t.id === activeTextId),
                                                fill: e.target.value,
                                            })
                                        }
                                    />
                                </Stack>

                                <FormControl size="small">
                                    <InputLabel>Font</InputLabel>
                                    <Select value={fontFamily} label="Font" onChange={handleFontChange}>
                                        <MenuItem value="Arial">Arial</MenuItem>
                                        <MenuItem value="Roboto">Roboto</MenuItem>
                                        <MenuItem value="Georgia">Georgia</MenuItem>
                                        <MenuItem value="Courier New">Courier New</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box>
                                    <Typography variant="body2" mb={1}>Font Size</Typography>
                                    <Slider
                                        size="small"
                                        min={10}
                                        max={100}
                                        step={1}
                                        value={texts.find((t) => t.id === activeTextId)?.fontSize || 32}
                                        onChange={(_, v) =>
                                            updateTextItem({
                                                ...texts.find((t) => t.id === activeTextId),
                                                fontSize: v,
                                            })
                                        }
                                    />
                                </Box>


                            </>
                        )}
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
    ;
}
