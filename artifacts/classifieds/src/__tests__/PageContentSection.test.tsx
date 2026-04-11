import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PageContentSection from "../components/PageContentSection";

const mockContent = {
  content_heading: "Escorts in Peelamedu, Coimbatore",
  content_html: "<p>Find the best escorts in Peelamedu here.</p><h3>Why Choose Us</h3><ul><li>Verified profiles</li></ul>",
  faq_json: [
    { q: "Are profiles verified?", a: "Yes, every profile is manually verified." },
    { q: "Is browsing anonymous?", a: "Yes, no login required to browse." },
    { q: "Can I post a listing?", a: "Yes, register and click Post Ad." },
  ],
};

describe("PageContentSection", () => {
  it("renders nothing when both content_html and faq_json are empty strings / empty array", () => {
    const { container } = render(<PageContentSection content_html="" faq_json={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when both content_html and faq_json are null/undefined", () => {
    const { container } = render(<PageContentSection content_html={null} faq_json={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no props are passed at all", () => {
    const { container } = render(<PageContentSection />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the content heading", () => {
    render(<PageContentSection content_heading={mockContent.content_heading} content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    expect(screen.getByText("Escorts in Peelamedu, Coimbatore")).toBeInTheDocument();
  });

  it("renders HTML content correctly (paragraphs, headings, list items)", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={[]} />);
    expect(screen.getByText("Find the best escorts in Peelamedu here.")).toBeInTheDocument();
    expect(screen.getByText("Why Choose Us")).toBeInTheDocument();
    expect(screen.getByText("Verified profiles")).toBeInTheDocument();
  });

  it("renders FAQ section heading when FAQs exist", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
  });

  it("renders all FAQ question buttons", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    expect(screen.getByText("Are profiles verified?")).toBeInTheDocument();
    expect(screen.getByText("Is browsing anonymous?")).toBeInTheDocument();
    expect(screen.getByText("Can I post a listing?")).toBeInTheDocument();
  });

  it("FAQ answers are hidden by default (accordion closed)", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    expect(screen.queryByText("Yes, every profile is manually verified.")).toBeNull();
  });

  it("FAQ answer is shown after clicking its question button", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    const firstQuestion = screen.getByText("Are profiles verified?");
    fireEvent.click(firstQuestion.closest("button")!);
    expect(screen.getByText("Yes, every profile is manually verified.")).toBeInTheDocument();
  });

  it("only the clicked FAQ answer becomes visible, others remain hidden", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    fireEvent.click(screen.getByText("Are profiles verified?").closest("button")!);
    expect(screen.getByText("Yes, every profile is manually verified.")).toBeInTheDocument();
    expect(screen.queryByText("Yes, no login required to browse.")).toBeNull();
  });

  it("toggling a FAQ closed hides the answer again", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={mockContent.faq_json} />);
    const btn = screen.getByText("Are profiles verified?").closest("button")!;
    fireEvent.click(btn);
    expect(screen.getByText("Yes, every profile is manually verified.")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByText("Yes, every profile is manually verified.")).toBeNull();
  });

  it("does not render FAQ section when faq_json is empty", () => {
    render(<PageContentSection content_html={mockContent.content_html} faq_json={[]} />);
    expect(screen.queryByText(/frequently asked questions/i)).toBeNull();
  });

  it("uses fallback heading when content_heading is not provided", () => {
    render(<PageContentSection content_html="<p>test</p>" faq_json={[]} />);
    expect(screen.getByText(/about this page/i)).toBeInTheDocument();
  });

  it("uses locationName in fallback heading when provided", () => {
    render(<PageContentSection content_html="<p>test</p>" faq_json={[]} locationName="Peelamedu" />);
    expect(screen.getByText(/about escorts in peelamedu/i)).toBeInTheDocument();
  });

  it("appends locationName to FAQ section heading when provided", () => {
    render(<PageContentSection content_html="<p>x</p>" faq_json={[{ q: "Q?", a: "A." }]} locationName="Peelamedu" />);
    expect(screen.getByText(/frequently asked questions.*peelamedu/i)).toBeInTheDocument();
  });

  it("renders content section when only content_html is provided (no FAQs)", () => {
    render(<PageContentSection content_html="<p>Just content</p>" faq_json={[]} />);
    expect(screen.getByText("Just content")).toBeInTheDocument();
  });

  it("renders FAQ section when only faq_json is provided (no HTML)", () => {
    render(<PageContentSection content_html="" faq_json={[{ q: "Q?", a: "A." }]} />);
    expect(screen.getByText("Q?")).toBeInTheDocument();
    expect(screen.queryByText(/about this page/i)).toBeNull();
  });
});
