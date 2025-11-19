import {
    Text as KonvaText,
    Transformer,
} from "react-konva";

export default function EditableText({ item, isSelected, onSelect, onChange }) {
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
                fontWeight={item.fontWeight || "normal"}
                textDecoration={item.textDecoration || ""}
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
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    onChange({
                        ...item,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: item.fontSize * scaleX,
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