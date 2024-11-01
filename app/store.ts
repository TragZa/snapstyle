import { create } from "zustand";

type VisualMatch = {
  title: string;
  link: string;
  source: string;
  price: {
    extracted_value: number;
    currency: string;
  };
  thumbnail: string;
};

type Data = {
  [key: string]: {
    visual_matches: VisualMatch[];
  };
};

type VisualMatchesState = {
  visualMatches: VisualMatch[];
  data: Data | null;
  url: string;
  imageFile: string | null;
  setVisualMatches: (matches: VisualMatch[]) => void;
  setData: (data: Data | null) => void;
  setUrl: (url: string) => void;
  setImageFile: (imageFile: string | null) => void;
  reset: () => void;
};

export const useVisualMatchesStore = create<VisualMatchesState>((set) => ({
  visualMatches: [],
  data: null,
  url: "",
  imageFile: null,
  setVisualMatches: (matches) => set({ visualMatches: matches }),
  setData: (data) => set({ data }),
  setUrl: (url) => set({ url }),
  setImageFile: (imageFile) => set({ imageFile }),
  reset: () => set({ visualMatches: [], data: null, url: "", imageFile: null }),
}));
