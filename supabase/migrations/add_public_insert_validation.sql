-- Server-side length/format guardrails for public write endpoints.

alter table public.contact_requests
  drop constraint if exists contact_requests_name_length_check,
  drop constraint if exists contact_requests_phone_length_check,
  drop constraint if exists contact_requests_message_length_check;

alter table public.contact_requests
  add constraint contact_requests_name_length_check
    check (char_length(name) between 2 and 120),
  add constraint contact_requests_phone_length_check
    check (char_length(phone) between 7 and 30),
  add constraint contact_requests_message_length_check
    check (char_length(message) between 5 and 2000);

alter table public.whatsapp_leads
  drop constraint if exists whatsapp_leads_product_name_length_check;

alter table public.whatsapp_leads
  add constraint whatsapp_leads_product_name_length_check
    check (char_length(product_name) between 1 and 200);
