import {
    Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";



export default function TemplateImage({ url, size }) {
    if (!url) return null;
    const [image] = useImage(url);
    if (!image) return null;
    return (
        <KonvaImage
            image={image}
            width={size}
            height={size}
            listening={false}
        />
    );
};