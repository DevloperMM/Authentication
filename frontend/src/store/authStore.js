import { create } from "zustand";
import axios from "axios";

const url = "http://localhost:8080/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuth: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  setError: () => {
    set({ error: null });
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${url}/signup`, { name, email, password });
      set({ user: res.data.user, isAuth: true, error: null });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error signing up" });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${url}/login`, { email, password });
      console.log(res);
      set({ isAuth: true, user: res.data.user, error: null });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error logging in" });
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${url}/verify-email`, { code });
      set({ user: res.data.user, isAuth: true, error: null });
    } catch (err) {
      set({ error: err.response?.data?.msg || "Error verifying email" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axios.get(`${url}/check-auth`);
      set({ user: res.data.user, isAuth: true, error: null });
    } catch (err) {
      set({ isAuth: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
