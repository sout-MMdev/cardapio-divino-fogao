import { expect, it } from "vitest";
import manifest from "./manifest";

it("manifest do PWA com as cores do tema A e ícones", () => {
  const m = manifest();
  expect(m).toMatchObject({
    name: "Divino Fogão · Cardápio",
    short_name: "Divino Fogão",
    start_url: "/",
    display: "standalone",
    theme_color: "#6b1d22",
    background_color: "#f4eee4",
    lang: "pt-BR",
  });
  expect(m.icons?.map((i) => i.sizes)).toEqual(["192x192", "512x512", "512x512"]);
});
