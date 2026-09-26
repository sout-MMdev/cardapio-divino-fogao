import { ImageResponse } from "next/og";

export const alt = "Cardápio · Divino Fogão São Leopoldo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#f4eee4",
          color: "#6b1d22",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 8, color: "#855a2e" }}>
          COMIDA DA FAZENDA · SÃO LEOPOLDO
        </div>
        <div style={{ fontSize: 120, fontWeight: 700, marginTop: 16 }}>Divino Fogão</div>
        <div style={{ fontSize: 44, marginTop: 12, color: "#2b1b17" }}>Cardápio digital</div>
      </div>
    ),
    size,
  );
}
