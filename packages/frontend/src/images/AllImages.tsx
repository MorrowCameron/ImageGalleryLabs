import { ImageGrid } from "./ImageGrid.tsx";
import type { IAPIImageData } from "../../../backend/src/shared/MockAppData.ts";
export function AllImages({ imageData }: { imageData: IAPIImageData[] }) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
