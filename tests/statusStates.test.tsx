// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LoadingState, ErrorState } from "@/components/StatusStates";

describe("LoadingState", () => {
  it("viser en tilgængelig status-region med aria-live, mens data indlæses", () => {
    render(<LoadingState label="Kører 10.000 simuleringer …" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Kører 10.000 simuleringer …")).toBeInTheDocument();
  });

  it("bruger en standardtekst, hvis intet label er angivet", () => {
    render(<LoadingState />);
    expect(screen.getByText("Indlæser data …")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("viser fejlbesked, hvad der mangler, og datakilde uden hemmeligheder", () => {
    render(<ErrorState message="API_FOOTBALL_KEY mangler." onRetry={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Data kunne ikke indlæses");
    expect(alert).toHaveTextContent("gyldigt liga-datasæt");
    expect(alert).toHaveTextContent("Datakilde: demo");
    expect(alert).toHaveTextContent("API_FOOTBALL_KEY mangler.");
    // Ingen hemmeligheder/nøgleværdier må optræde i selve fejlteksten
    expect(alert.textContent).not.toMatch(/sk-|Bearer |api_key=/i);
  });

  it("kalder onRetry, når knappen 'Prøv igen' trykkes", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Ukendt fejl." onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Prøv igen" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
