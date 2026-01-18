export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          song_id: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          song_id: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          song_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          created_at: string;
          followee_id: string;
          follower_id: string;
        };
        Insert: {
          created_at?: string;
          followee_id: string;
          follower_id: string;
        };
        Update: {
          created_at?: string;
          followee_id?: string;
          follower_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey";
            columns: ["followee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      likes: {
        Row: {
          created_at: string;
          song_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          song_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          song_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: string;
          stripe_customer_id: string | null;
          subscription_status: string | null;
          username: string;
          website_url: string | null;
        };
        Insert: {
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id: string;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          username: string;
          website_url?: string | null;
        };
        Update: {
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          username?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          reason: string;
          reported_id: string;
          reported_type: string;
          reporter_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason: string;
          reported_id: string;
          reported_type: string;
          reporter_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string;
          reported_id?: string;
          reported_type?: string;
          reporter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      song_tags: {
        Row: {
          song_id: string;
          tag_id: number;
        };
        Insert: {
          song_id: string;
          tag_id: number;
        };
        Update: {
          song_id?: string;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "song_tags_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      songs: {
        Row: {
          artist_id: string;
          artwork_url: string | null;
          audio_path: string;
          created_at: string;
          description: string | null;
          duration_seconds: number | null;
          id: string;
          likes: number;
          like_count: number;
          play_count: number;
          title: string;
        };
        Insert: {
          artist_id: string;
          artwork_url?: string | null;
          audio_path: string;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          likes?: number;
          like_count?: number;
          play_count?: number;
          title: string;
        };
        Update: {
          artist_id?: string;
          artwork_url?: string | null;
          audio_path?: string;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          likes?: number;
          like_count?: number;
          play_count?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          color: string;
          id: number;
          name: string;
        };
        Insert: {
          color: string;
          id?: number;
          name: string;
        };
        Update: {
          color?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      uploads: {
        Row: {
          id: string;
          owner_id: string | null;
          filename: string;
          storage_path: string;
          content_type: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id: string;
          owner_id?: string | null;
          filename: string;
          storage_path: string;
          content_type?: string | null;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          filename?: string;
          storage_path?: string;
          content_type?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      random_song: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;


