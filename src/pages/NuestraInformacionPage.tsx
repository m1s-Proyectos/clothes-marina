import Seo from "@/components/common/Seo";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function NuestraInformacionPage() {
  return (
    <div className="container-shell py-12">
      <Seo title="Nuestra Informacion" description="Conoce la historia y proposito de Marina's Clothes." />

      <section className="overflow-hidden rounded-2xl border border-luxury-500/10 bg-surface-card">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1920&auto=format&fit=crop"
          alt="Emprendedora de moda atendiendo su tienda con entusiasmo"
          loading="lazy"
          decoding="async"
          className="h-72 w-full object-cover md:h-96"
        />
        <div className="space-y-5 p-6 md:p-10">
          <h1 className="text-3xl font-semibold text-luxury-50 md:text-4xl">Nuestra Informacion</h1>

          <p className="leading-relaxed text-neutral-300">
            <strong className="text-neutral-100">Marina&apos;s Clothes</strong> es una tienda de ropa en linea donde puedes encontrar una gran variedad de
            productos para toda la familia. Ofrecemos ropa nueva para hombres, mujeres de todas las edades, asi como
            prendas para ninos y ninas.
          </p>

          <p className="leading-relaxed text-neutral-300">
            Ademas de ropa, tambien contamos con algunos articulos utiles para el hogar, como manteles, toallas,
            cobijas, sacudidores y otros productos pensados para el uso diario.
          </p>

          <p className="leading-relaxed text-neutral-300">
            La tienda fue fundada por <strong className="text-neutral-100">Marina Quinteros</strong>, una mujer luchadora y madre soltera que cada dia
            trabaja con esfuerzo y dedicacion para salir adelante frente a las adversidades. Con el deseo de crecer y
            mejorar sus ventas, decidio innovar creando esta tienda en linea, con el objetivo de que mas personas
            puedan conocer sus productos y solicitarlos de manera facil.
          </p>

          <p className="leading-relaxed text-neutral-300">
            En <strong className="text-neutral-100">Marina&apos;s Clothes</strong> buscamos ofrecer productos nuevos, utiles y a buen precio, pensando
            siempre en las necesidades de nuestros clientes.
          </p>
        </div>
      </section>
    </div>
  );
}
