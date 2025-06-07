import { Routes, Route, useNavigate } from "react-router-dom";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { ProtectedRoute } from "./ProtectedRoute"; 
import { useEffect, useState, useRef } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import type { IAPIImageData } from "../../backend/src/shared/MockAppData.ts";

function App() {
    const [imageData, setImageData] = useState<IAPIImageData[]>([]);
    const [fetching, setFetching] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [authToken, setAuthToken] = useState("");
    const countRef = useRef(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        if (authToken) {
            fetchImages(searchQuery);
        }
    }, [authToken]);

    const handleNameChange = (imageId: string, newName: string) => {
        setImageData((prevData) =>
            prevData.map((image) =>
                image.id === imageId ? { ...image, name: newName } : image
            )
        );
    };

    console.log(fetching);
    console.log(hasError);

    const fetchImages = (query: string = "") => {
        setFetching(true);
        setHasError(false);
        countRef.current += 1;
        const currentCount = countRef.current;
        fetch(`/api/images?name=${encodeURIComponent(query)}`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
            })
            .then(response => {
                if (!response.ok) {
                    setHasError(true);
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (currentCount === countRef.current) {
                    setImageData(data);
                }
            })
            .catch(error => {
                if (currentCount === countRef.current) {
                    console.log(error);
                    setHasError(true);
                }
            })
            .finally(() => {
                if (currentCount === countRef.current) {
                    setFetching(false);
                }
            });
    };

    const handleImageSearch = () => {
        fetchImages(searchQuery);
    };

    const handleAuthTokenChange = (token: string) => {
        setAuthToken(token);
        navigate(ValidRoutes.HOME);
    };

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages
                                imageData={imageData}
                                searchPanel={
                                    <ImageSearchForm
                                        searchString={searchQuery}
                                        onSearchStringChange={setSearchQuery}
                                        onSearchRequested={handleImageSearch}
                                    />
                                }
                            />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.IMAGE_DETAILS}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails imageData={imageData} onNameChange={handleNameChange} authToken={authToken}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.LOGIN}
                    element={<LoginPage isRegistering={false} setAuthToken={handleAuthTokenChange} />}
                />
                <Route
                    path={ValidRoutes.REGISTER}
                    element={<LoginPage isRegistering={true} setAuthToken={handleAuthTokenChange} />}
                />
            </Route>
        </Routes>
    );
}

export default App;
