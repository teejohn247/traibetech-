import { useState, useEffect } from "react";
import type { ReactQuillProps } from "react-quill";

// This component will only render ReactQuill on the client side
export default function ClientOnlyReactQuill(props: ReactQuillProps) {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import ReactQuill only on the client side
    Promise.all([
      import("react-quill"),
      import("react-quill/dist/quill.snow.css")
    ]).then(([mod]) => {
      setReactQuill(() => mod.default);
    });
  }, []);

  if (!isClient || !ReactQuill) {
    // Show a loading placeholder during SSR and while loading
    return (
      <div className="w-full h-64 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return <ReactQuill {...props} />;
}
