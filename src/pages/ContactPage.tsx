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
    "w-full rounded-xl border border-luxury-200/70 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-luxury-500/50 focus:ring-2 focus:ring-luxury-200/60";

  return (
    <div className="container-shell py-16">
      <Seo title="Contacto" description="Contacta a Marina's Clothes para información de productos." />
      <h1 className="text-3xl font-semibold text-slate-950">Contacto</h1>
      <p className="mt-2 text-sm text-slate-600">Completa el formulario y te responderemos lo antes posible.</p>
      <form className="mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className={fieldClass} />
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefono" className={fieldClass} />
        <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensaje" className={`${fieldClass} h-32 resize-none`} />
        <button className="rounded-xl bg-luxury-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-luxury-700">Enviar</button>
      </form>
      <div className="mt-5">
        <Link to="/" className="inline-block rounded-xl border border-luxury-200/70 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-luxury-500/50 hover:text-slate-950">
          &larr; Regresar a inicio
        </Link>
      </div>
      {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
    </div>
  );
}
