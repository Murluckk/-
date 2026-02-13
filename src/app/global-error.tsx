"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          background: "#0b0b0f",
          color: "#e0e0e0",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#ef4444", fontSize: "2rem", marginBottom: "1rem" }}>
          Something broke
        </h1>
        <p style={{ color: "#9ca3af", maxWidth: "400px", lineHeight: 1.6 }}>
          {error.message}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 2rem",
            background: "#1a1a2e",
            border: "1px solid #4ade80",
            borderRadius: "0.75rem",
            color: "#4ade80",
            fontFamily: "monospace",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
