import Seo from "@/components/common/Seo";

export default function AboutPage() {
  return (
    <div className="container-shell py-16">
      <Seo title="Sobre Nosotros" description="Sobre Marina's Clothes y nuestra filosofia de ropa." />
      <h1 className="text-3xl font-semibold">Sobre Nosotros</h1>
      <p className="mt-4 max-w-3xl text-neutral-300">
        Marina's Clothes es un showroom moderno de ropa enfocado en estilo premium y experiencia en tienda.
        Nuestro catalogo digital ayuda a los clientes a descubrir productos y contactarnos al instante por WhatsApp.
      </p>
    </div>
  );
}
