export type UITag = {
  id: number;
  name: string;
  color: string;
};

export type UISong = {
  id: string;
  title: string;
  artist_name: string;
  artist_id?: string | null;
  song_url: string;
  cover_image_url: string | null;
  duration_seconds: number | null;
  play_count: number;
  like_count: number;
  liked?: boolean;
  tags: UITag[];
};
