import { useEffect } from "react";

export function useSeo(title: string, description?: string): void {
  useEffect(() => {
    document.title = `${title} | Clothes Marina`;
    if (!description) return;
    const tag = document.querySelector("meta[name='description']");
    if (tag) tag.setAttribute("content", description);
  }, [title, description]);
}
