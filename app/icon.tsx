import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 192, height: 192 };

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 800,
        }}
      >
        $
      </div>
    ),
    { ...size }
  );
}
