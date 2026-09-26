import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { OfflineBanner } from "./offline-banner";

afterEach(() => vi.restoreAllMocks());

it("aparece quando a conexão cai e some quando volta", () => {
  const onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  render(<OfflineBanner />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  onLine.mockReturnValue(false);
  act(() => void window.dispatchEvent(new Event("offline")));
  expect(screen.getByRole("status")).toHaveTextContent("Você está offline");
  onLine.mockReturnValue(true);
  act(() => void window.dispatchEvent(new Event("online")));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
