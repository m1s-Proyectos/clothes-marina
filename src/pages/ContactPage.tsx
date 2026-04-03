import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/common/Seo";
import { sendContact } from "@/services/contactService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("Enviando...");
    try {
      await sendContact({ name, phone, message });
      setName("");
      setPhone("");
      setMessage("");
      setStatus("Mensaje enviado.");
    } catch {
      setStatus("No se pudo enviar en este momento.");
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-luxury-500/15 bg-surface-card px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-luxury-400/40 focus:ring-1 focus:ring-luxury-500/20";

  return (
    <div className="container-shell py-16">
      <Seo title="Contacto" description="Contacta a Marina's Clothes para informacion de productos." />
      <h1 className="text-3xl font-semibold text-luxury-50">Contacto</h1>
      <p className="mt-2 text-sm text-neutral-400">Completa el formulario y te responderemos lo antes posible.</p>
      <form className="mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className={fieldClass} />
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefono" className={fieldClass} />
        <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensaje" className={`${fieldClass} h-32 resize-none`} />
        <button className="rounded-xl bg-luxury-400 px-6 py-2.5 text-sm font-semibold text-surface-base transition hover:bg-luxury-300">Enviar</button>
      </form>
      <div className="mt-5">
        <Link to="/" className="inline-block rounded-xl border border-luxury-500/15 bg-surface-card px-4 py-2 text-sm text-neutral-300 transition hover:border-luxury-400/30 hover:text-neutral-100">
          &larr; Regresar a inicio
        </Link>
      </div>
      {status && <p className="mt-4 text-sm text-neutral-400">{status}</p>}
    </div>
  );
}
