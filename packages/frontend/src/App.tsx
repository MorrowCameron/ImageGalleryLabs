import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { useEffect, useState } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import type { IAPIImageData } from "../../backend/src/shared/MockAppData.ts";

function App() {
    const [imageData, setImageData] = useState<IAPIImageData[]>([]);
    const [fetching, setFetching] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        fetch("/api/images")
            .then(response => {
                if (!response.ok) {
                    setHasError(true);
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                setImageData(data);
            })
            .catch(error => {
                console.log(error);
                setHasError(true);
            })
            .finally(() => {
                setFetching(false);
            });
    }, []);

    console.log(fetching);
    console.log(hasError);

    const handleNameChange = (imageId: string, newName: string) => {
        setImageData((prevData) =>
          prevData.map((image) =>
            image.id === imageId ? { ...image, name: newName } : image
          )
        );
      };
    

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData} />} />
                <Route path={ValidRoutes.IMAGE_DETAILS} element={<ImageDetails imageData={imageData} onNameChange={handleNameChange}/>} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;
