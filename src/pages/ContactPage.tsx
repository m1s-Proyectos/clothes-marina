import { useState, type FormEvent } from "react";
import Seo from "@/components/common/Seo";
import { sendContact } from "@/services/contactService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("Sending...");
    try {
      await sendContact({ name, phone, message });
      setStatus("Message sent.");
    } catch {
      setStatus("Unable to send now.");
    }
  }

  return (
    <div className="container-shell py-16">
      <Seo title="Contact" description="Contact Clothes Marina for product information." />
      <h1 className="text-3xl font-semibold">Contact</h1>
      <form className="mt-6 max-w-xl space-y-3" onSubmit={onSubmit}>
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="w-full rounded bg-neutral-900 px-3 py-2" />
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="w-full rounded bg-neutral-900 px-3 py-2" />
        <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" className="h-32 w-full rounded bg-neutral-900 px-3 py-2" />
        <button className="rounded bg-luxury-500 px-5 py-2 font-semibold text-neutral-950">Send</button>
      </form>
      {status && <p className="mt-4 text-sm text-neutral-300">{status}</p>}
    </div>
  );
}
