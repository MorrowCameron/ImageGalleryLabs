import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameChange: (imageId: string, newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, onNameChange }: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitPressed = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: input })
      });

      if (response.status === 204) {
        // Update local state in App
        onNameChange(imageId, input);
        setIsEditingName(false);
      } else {
        // Parse error message
        const errorData = await response.json();
        setError(`${errorData.error}: ${errorData.message}`);
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
        </label>
        <button disabled={loading || input.length === 0} onClick={handleSubmitPressed}>
          Submit
        </button>
        <button onClick={() => setIsEditingName(false)} disabled={loading}>
          Cancel
        </button>
        {loading && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={() => setIsEditingName(true)}>Edit name</button>
    </div>
  );
}
