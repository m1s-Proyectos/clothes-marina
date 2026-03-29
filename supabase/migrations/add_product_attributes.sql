-- Migration: add brand, color, size columns to products
-- Run this in Supabase SQL Editor

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size  text NOT NULL DEFAULT '';
