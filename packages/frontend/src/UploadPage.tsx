import React, { useState } from "react";

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
    });
}

export function UploadPage({ authToken }: { authToken: string }) {
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [formMessage, setFormMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const dataUrl = await readAsDataURL(file);
            setPreviewSrc(dataUrl);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setFormMessage("");

        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/images", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                setFormMessage("Upload successful!");
                form.reset();
                setPreviewSrc(null);
            } else {
                const error = await response.json();
                setFormMessage(`Upload failed: ${error.message || "Unknown error"}`);
            }
        } catch (e) {
            setFormMessage("Upload failed: Network or server error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} aria-live="polite">
            <div>
                <label htmlFor="image">Choose image to upload: </label>
                <input
                    name="image"
                    id="image"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    required
                    onChange={handleFileChange}
                    disabled={submitting}
                />
            </div>
            <div>
                <label>
                    <span>Image title: </span>
                    <input name="name" required disabled={submitting} />
                </label>
            </div>
            {previewSrc && (
                <div>
                    <img style={{ width: "20em", maxWidth: "100%" }} src={previewSrc} alt="Preview" />
                </div>
            )}
            <input type="submit" value="Confirm upload" disabled={submitting} />
            {formMessage && <p>{formMessage}</p>}
        </form>
    );
}
