import { useEffect } from "react";

export function useSeo(title: string, description?: string): void {
  useEffect(() => {
    document.title = `${title} | Marina's clothes`;
    if (!description) return;
    const tag = document.querySelector("meta[name='description']");
    if (tag) tag.setAttribute("content", description);
  }, [title, description]);
}
