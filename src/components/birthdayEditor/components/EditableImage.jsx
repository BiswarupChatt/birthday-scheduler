import {
    Image as KonvaImage,
    Text as KonvaText,
} from "react-konva";
import useImage from "use-image";


export default function EditableImage({ imageUrl, settings, isSelected, onSelect, onChange }) {
    const [image] = useImage(imageUrl);

    if (!image) return null;

    return (
        <>
            <KonvaImage
                image={image}
                draggable
                x={settings.x}
                y={settings.y}
                offsetX={image.width / 2}
                offsetY={image.height / 2}
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