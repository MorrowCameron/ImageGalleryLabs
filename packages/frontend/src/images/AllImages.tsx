import { ImageGrid } from "./ImageGrid.tsx";
import type { IAPIImageData } from "../../../backend/src/shared/MockAppData.ts";
export function AllImages({ imageData, searchPanel }: { imageData: IAPIImageData[]; searchPanel: React.ReactNode }) {
    return (
        <>
            <h2>All Images</h2>
            {searchPanel}
            <ImageGrid images={imageData} />
        </>
    );
}
