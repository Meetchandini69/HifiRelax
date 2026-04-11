import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileCard from "../components/ProfileCard";

vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const baseProfile = {
  id: 1,
  title: "Priya — Independent Escort in Peelamedu",
  name: "Priya",
  description: "Lovely and professional escort in Coimbatore.",
  age: 24,
  phone: "+919876543210",
  whatsapp: "919876543210",
  telegram: "@priya_cbe",
  services: ["GFE", "Dinner Date", "Overnight"],
  photos: [],
  area: "Peelamedu",
  city: "Coimbatore",
  state: "Tamil Nadu",
  area_slug: "peelamedu",
  city_slug: "coimbatore",
  full_url: "escorts/peelamedu/priya-escort",
  slug: "priya-escort",
  status: "approved",
  created_at: new Date().toISOString(),
  active_boost_slug: undefined,
  active_badge_label: undefined,
  active_badge_color: undefined,
};

describe("ProfileCard", () => {
  it("renders the listing title", () => {
    render(<ProfileCard p={baseProfile} />);
    expect(screen.getByText("Priya — Independent Escort in Peelamedu")).toBeInTheDocument();
  });

  it("renders the area and city location", () => {
    render(<ProfileCard p={baseProfile} />);
    const peelameduMatches = screen.getAllByText(/Peelamedu/);
    expect(peelameduMatches.length).toBeGreaterThan(0);
    const locationDiv = peelameduMatches.find(el => el.textContent?.includes("Coimbatore"));
    expect(locationDiv).toBeTruthy();
  });

  it("renders age badge", () => {
    render(<ProfileCard p={baseProfile} />);
    expect(screen.getByText("24 yrs")).toBeInTheDocument();
  });

  it("renders the Call button with correct tel: link", () => {
    render(<ProfileCard p={baseProfile} />);
    const callBtn = screen.getByRole("link", { name: /call/i });
    expect(callBtn).toHaveAttribute("href", "tel:+919876543210");
  });

  it("renders the WhatsApp button with correct wa.me link", () => {
    render(<ProfileCard p={baseProfile} />);
    const waBtn = screen.getByRole("link", { name: /whatsapp/i });
    expect(waBtn.getAttribute("href")).toContain("wa.me/919876543210");
  });

  it("renders first 3 services as tags", () => {
    render(<ProfileCard p={baseProfile} />);
    expect(screen.getByText("GFE")).toBeInTheDocument();
    expect(screen.getByText("Dinner Date")).toBeInTheDocument();
    expect(screen.getByText("Overnight")).toBeInTheDocument();
  });

  it("shows +N overflow label when more than 3 services", () => {
    const p = { ...baseProfile, services: ["GFE", "Dinner Date", "Overnight", "BDSM", "Massage"] };
    render(<ProfileCard p={p} />);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders profile initial when no photos are present", () => {
    render(<ProfileCard p={baseProfile} />);
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("renders photo img when photos exist", () => {
    const p = { ...baseProfile, photos: ["https://example.com/photo.jpg"] };
    render(<ProfileCard p={p} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(img).toHaveAttribute("alt", p.title);
  });

  it("does NOT render Call button when no phone provided", () => {
    const p = { ...baseProfile, phone: "" };
    render(<ProfileCard p={p} />);
    expect(screen.queryByRole("link", { name: /call/i })).toBeNull();
  });

  it("does NOT render WhatsApp button when no whatsapp provided", () => {
    const p = { ...baseProfile, whatsapp: "" };
    render(<ProfileCard p={p} />);
    expect(screen.queryByRole("link", { name: /whatsapp/i })).toBeNull();
  });

  it("renders 'New' badge when profile has no boost", () => {
    render(<ProfileCard p={baseProfile} />);
    expect(screen.getByText(/new/i)).toBeInTheDocument();
  });

  it("renders VIP boost badge when active_boost_slug is 'vip'", () => {
    const p = { ...baseProfile, active_boost_slug: "vip", active_badge_label: "VIP Elite" };
    render(<ProfileCard p={p} />);
    expect(screen.getByText(/vip elite/i)).toBeInTheDocument();
  });

  it("renders Premium boost badge when active_boost_slug is 'premium'", () => {
    const p = { ...baseProfile, active_boost_slug: "premium", active_badge_label: "Premium" };
    render(<ProfileCard p={p} />);
    expect(screen.getByText(/premium/i)).toBeInTheDocument();
  });

  it("renders Featured boost badge when active_boost_slug is 'featured'", () => {
    const p = { ...baseProfile, active_boost_slug: "featured", active_badge_label: "Featured" };
    render(<ProfileCard p={p} />);
    expect(screen.getByText(/featured/i)).toBeInTheDocument();
  });

  it("links to correct SEO URL via href", () => {
    render(<ProfileCard p={baseProfile} />);
    const links = screen.getAllByRole("link");
    const profileLinks = links.filter(l => l.getAttribute("href") === "/escorts/peelamedu/priya-escort");
    expect(profileLinks.length).toBeGreaterThan(0);
  });
});
