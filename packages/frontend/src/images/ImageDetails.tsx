import { useParams } from "react-router-dom";
import type { IAPIImageData } from "../../../backend/src/shared/MockAppData.ts";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

export function ImageDetails({ imageData, onNameChange }: { imageData: IAPIImageData[], onNameChange: (imageId: string, newName: string) => void }) {
    const { imageId } = useParams<{ imageId: string }>();
    const image = imageData.find(image => String(image.id) === String(imageId));

    if (!image) {
      return <><h2>Image not found</h2></>;
    }

    console.log("ImageDetails rendering for imageId:", imageId);

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            {imageId && <ImageNameEditor initialValue={image.name} imageId={imageId} onNameChange={onNameChange}/>}
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
