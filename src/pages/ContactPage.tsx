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

  return (
    <div className="container-shell py-16">
      <Seo title="Contacto" description="Contacta a Marina's Clothes para informacion de productos." />
      <h1 className="text-3xl font-semibold">Contacto</h1>
      <form className="mt-6 max-w-xl space-y-3" onSubmit={onSubmit}>
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="w-full rounded bg-neutral-900 px-3 py-2" />
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefono" className="w-full rounded bg-neutral-900 px-3 py-2" />
        <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensaje" className="h-32 w-full rounded bg-neutral-900 px-3 py-2" />
        <button className="rounded bg-luxury-500 px-5 py-2 font-semibold text-neutral-950">Enviar</button>
      </form>
      <div className="mt-4">
        <Link to="/" className="inline-block rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900">
          Regresar a inicio
        </Link>
      </div>
      {status && <p className="mt-4 text-sm text-neutral-300">{status}</p>}
    </div>
  );
}
