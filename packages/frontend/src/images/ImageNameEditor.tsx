import { useState, useEffect } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameChange: (newName: string, imageId: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(props.initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInput(props.initialValue);
  }, [props.initialValue]);

  async function handleSubmitPressed() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${props.imageId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch image data.");
      }

      props.onNameChange(input, props.imageId);

      setIsEditingName(false);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </label>
        <button
          disabled={input.length === 0 || loading}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button onClick={() => setIsEditingName(false)} disabled={loading}>
          Cancel
        </button>
        {loading && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      </div>
    );
  }
}
