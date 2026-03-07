import Seo from "@/components/common/Seo";

export default function AboutPage() {
  return (
    <div className="container-shell py-16">
      <Seo title="About Us" description="About Clothes Marina and our clothing philosophy." />
      <h1 className="text-3xl font-semibold">About Us</h1>
      <p className="mt-4 max-w-3xl text-neutral-300">
        Clothes Marina is a modern clothing showroom focused on premium style and in-store experience.
        Our digital catalog helps customers discover products and contact us instantly via WhatsApp.
      </p>
    </div>
  );
}
