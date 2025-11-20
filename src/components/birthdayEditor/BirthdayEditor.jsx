import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    Button,
    Tab,
    Tabs,
    Grid,
    TextField
} from "@mui/material";

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
import ImageTab from "./components/ImageTab";
import TextTab from "./components/TextTab";

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

const templates = [
    { id: "blank", name: "Blank", url: null },
    { id: "t1", name: "Template 1", url: temp1 },
    { id: "t2", name: "Template 2", url: temp2 },
    { id: "t3", name: "Template 3", url: temp3 },
];


export default function BirthdayEditor({ employee }) {
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
    const [birthdayWishes, setBirthdayWishes] = useState("")

    const isPhotoSelected = selectedElement === "photo";
    const isTextSelected =
        selectedElement && selectedElement.type === "text";

    const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

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
        console.log(birthdayWishes)
        const link = document.createElement("a");
        link.download = "birthday-card.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

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

    const changeRotation = (value) => {
        if (Array.isArray(value)) return;
        setPhotoSettings((prev) => ({ ...prev, rotation: value }));
        setSelectedElement("photo");
    };

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

    return (
        <Box sx={{ bgcolor: "background.default", p: 2 }}>

            <Box sx={{ m: 2 }}>

                <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                    {/* LEFT: CANVAS AREA */}
                    <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex" }}>
                        <Box
                            ref={canvasWrapperRef}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            sx={{
                                p: 1,
                                borderRadius: 3,
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: DEFAULT_CANVAS_SIZE + 32,
                                position: "relative",
                                bgcolor: "background.paper",
                            }}
                        >

                            <Stage
                                width={canvasSize}
                                height={canvasSize}
                                ref={stageRef}
                                onMouseDown={handleStageMouseDown}
                                onTouchStart={handleStageMouseDown}
                                style={{
                                    border: "1px dashed grey"
                                }}
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
                        </Box>
                    </Grid>

                    {/* RIGHT: CONTROLLER TABS */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex" }} >
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                p: 2,
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "background.paper"
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
                                < ImageTab
                                    openFileSelector={openFileSelector}
                                    photoUrl={photoUrl}
                                    handleChangePhoto={handleChangePhoto}
                                    nudgeZoom={nudgeZoom}
                                    isPhotoSelected={isPhotoSelected}
                                    zoomFactor={zoomFactor}
                                    changeZoom={changeZoom}
                                    changeRotation={changeRotation}
                                    photoSettings={photoSettings}
                                />
                            )}

                            {/* TEXT TAB */}
                            {activeTab === "text" && (
                                < TextTab
                                    addText={addText}
                                    photoUrl={photoUrl}
                                    isTextSelected={isTextSelected}
                                    texts={texts}
                                    activeTextId={activeTextId}
                                    handleActiveTextChange={handleActiveTextChange}
                                    setTexts={setTexts}
                                    fontFamily={fontFamily}
                                    handleFontChange={handleFontChange}
                                    updateTextItem={updateTextItem}
                                    deleteText={deleteText}
                                />
                            )}
                        </Box>
                    </Grid>

                    <Grid size={12}>
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                p: 2,
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "background.paper"
                            }}
                        >
                            <TextField
                                label={`Add Wishes for ${employee.firstName}`}
                                value={birthdayWishes}
                                multiline
                                rows={4}
                                onChange={(e) => {
                                    e.stopPropagation()
                                    setBirthdayWishes(e.target.value)
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleExport}
                                disabled={!photoUrl}
                            >
                                Schedule
                            </Button>
                        </Box>
                    </Grid>

                </Grid>
            </Box>

        </Box>
    );
}




