-- Migration: add offer fields to products
-- Run this in Supabase SQL Editor

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_active boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_quantity integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_price numeric(12,2);
