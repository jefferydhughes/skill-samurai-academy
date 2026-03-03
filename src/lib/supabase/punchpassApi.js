/**
 * punchpassApi.js
 *
 * Supabase query helpers for data imported from Punchpass.
 * Covers: contacts, students, instructors, weekly_class_slots, pass_purchases, programs
 */
import { supabase } from '@/lib/supabase/supabaseClient';

// ─── Contacts (parents/guardians) ────────────────────────────────────────────

export const contactsApi = {
  getByLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('location_id', locationId)
      .order('last_name');
    if (error) throw error;
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Get contact with their students. */
  getWithStudents: async (id) => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, students(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  search: async (locationId, query) => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('location_id', locationId)
      .or(`last_name.ilike.%${query}%,first_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('last_name')
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Students ────────────────────────────────────────────────────────────────

export const studentsApi = {
  getByLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('students')
      .select('*, contacts(first_name, last_name, email, phone)')
      .eq('location_id', locationId)
      .order('last_name');
    if (error) throw error;
    return data ?? [];
  },

  getByContact: async (contactId) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('contact_id', contactId)
      .order('first_name');
    if (error) throw error;
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('students')
      .select('*, contacts(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Instructors ─────────────────────────────────────────────────────────────

export const instructorsApi = {
  getByLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('location_id', locationId)
      .order('first_name');
    if (error) throw error;
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('instructors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Weekly Class Slots ──────────────────────────────────────────────────────

export const weeklyClassSlotsApi = {
  getByLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('weekly_class_slots')
      .select('*, programs(name, slug), instructors(first_name, last_name)')
      .eq('location_id', locationId)
      .order('weekday')
      .order('start_time');
    if (error) throw error;
    return data ?? [];
  },

  getActive: async (locationId) => {
    const { data, error } = await supabase
      .from('weekly_class_slots')
      .select('*, programs(name, slug), instructors(first_name, last_name)')
      .eq('location_id', locationId)
      .eq('active', true)
      .order('weekday')
      .order('start_time');
    if (error) throw error;
    return data ?? [];
  },

  create: async (slot) => {
    const { data, error } = await supabase
      .from('weekly_class_slots')
      .insert(slot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('weekly_class_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('weekly_class_slots')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─── Pass Purchases ──────────────────────────────────────────────────────────

export const passPurchasesApi = {
  getByLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('pass_purchases')
      .select('*, contacts(first_name, last_name, email)')
      .eq('location_id', locationId)
      .order('purchased_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  getByContact: async (contactId) => {
    const { data, error } = await supabase
      .from('pass_purchases')
      .select('*')
      .eq('contact_id', contactId)
      .order('purchased_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  getActive: async (locationId) => {
    const { data, error } = await supabase
      .from('pass_purchases')
      .select('*, contacts(first_name, last_name, email)')
      .eq('location_id', locationId)
      .eq('status', 'active')
      .order('expires_date');
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Programs ────────────────────────────────────────────────────────────────

export const programsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};
