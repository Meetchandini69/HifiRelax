export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "Health" | "Lifestyle" | "Relationships";
  cover_image_url: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogSummary = Omit<BlogPost, "content">;
export type BlogInput = Pick<BlogPost, "title" | "slug" | "excerpt" | "content" | "category" | "cover_image_url" | "status">;

export function blogDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Draft";
}
