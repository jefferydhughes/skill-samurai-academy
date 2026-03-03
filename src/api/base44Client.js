/**
 * base44Client.js
 *
 * Supabase-backed shim that replaces the former @base44/sdk dependency.
 * Provides the same entity interface so callers don't need to change.
 */
import { supabase } from '@/lib/supabase/supabaseClient';

const makeEntityInterface = (tableName) => ({
  filter: async (query = {}) => {
    let req = supabase.from(tableName).select('*');
    Object.entries(query).forEach(([key, value]) => {
      req = req.eq(key, value);
    });
    const { data, error } = await req;
    if (error) throw error;
    return data ?? [];
  },
  get: async (id) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (payload) => {
    const { data, error } = await supabase.from(tableName).insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },
});

export const base44 = {
  entities: {
    Location: makeEntityInterface('franchise_locations'),
    Program: makeEntityInterface('programs'),
    WeeklyClassSlot: makeEntityInterface('weekly_class_slots'),
    Instructor: makeEntityInterface('instructors'),
    Contact: makeEntityInterface('contacts'),
    Student: makeEntityInterface('students'),
    PassPurchase: makeEntityInterface('pass_purchases'),
  },
};
