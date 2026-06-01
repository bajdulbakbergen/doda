/**
 * Сгенерировано Supabase MCP `generate_typescript_types`.
 * Перегенерировать после изменения схемы:
 *   npx supabase gen types typescript --project-id iynohjjeobqgxxklzvnc > src/lib/supabase/types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          target_id: string | null;
          target_type: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bin_blacklist: {
        Row: {
          added_at: string;
          added_by: string | null;
          bin: string;
          reason: string | null;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          bin: string;
          reason?: string | null;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          bin?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      bid_changes: {
        Row: { amount: number; bid_id: string; id: string; recorded_at: string };
        Insert: { amount: number; bid_id: string; id?: string; recorded_at?: string };
        Update: { amount?: number; bid_id?: string; id?: string; recorded_at?: string };
        Relationships: [
          {
            foreignKeyName: "bid_changes_bid_id_fkey";
            columns: ["bid_id"];
            isOneToOne: false;
            referencedRelation: "bids";
            referencedColumns: ["id"];
          },
        ];
      };
      bids: {
        Row: {
          amount: number;
          bidder_id: string;
          change_count: number;
          created_at: string;
          id: string;
          is_active: boolean;
          lot_id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          bidder_id: string;
          change_count?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lot_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          bidder_id?: string;
          change_count?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lot_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bids_bidder_id_fkey";
            columns: ["bidder_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bids_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name_kk: string;
          name_ru: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name_kk: string;
          name_ru: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_kk?: string;
          name_ru?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string;
          last_read_at: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          last_message_at: string;
          lot_id: string | null;
          post_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          last_message_at?: string;
          lot_id?: string | null;
          post_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          last_message_at?: string;
          lot_id?: string | null;
          post_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          amount: number;
          cancelled_by: string | null;
          cancelled_reason: string | null;
          closed_at: string | null;
          contractor_id: string;
          created_at: string;
          currency: string;
          customer_id: string;
          id: string;
          lot_id: string;
          status: Database["public"]["Enums"]["deal_status"];
          updated_at: string;
          winner_bid_id: string;
        };
        Insert: {
          amount: number;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          closed_at?: string | null;
          contractor_id: string;
          created_at?: string;
          currency?: string;
          customer_id: string;
          id?: string;
          lot_id: string;
          status?: Database["public"]["Enums"]["deal_status"];
          updated_at?: string;
          winner_bid_id: string;
        };
        Update: {
          amount?: number;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          closed_at?: string | null;
          contractor_id?: string;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          id?: string;
          lot_id?: string;
          status?: Database["public"]["Enums"]["deal_status"];
          updated_at?: string;
          winner_bid_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_winner_bid_id_fkey";
            columns: ["winner_bid_id"];
            isOneToOne: false;
            referencedRelation: "bids";
            referencedColumns: ["id"];
          },
        ];
      };
      lot_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          declined_at: string | null;
          id: string;
          invitee_id: string;
          inviter_id: string;
          lot_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          declined_at?: string | null;
          id?: string;
          invitee_id: string;
          inviter_id: string;
          lot_id: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          declined_at?: string | null;
          id?: string;
          invitee_id?: string;
          inviter_id?: string;
          lot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lot_invites_invitee_id_fkey";
            columns: ["invitee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lot_invites_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lot_invites_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
        ];
      };
      lots: {
        Row: {
          category_id: string;
          created_at: string;
          currency: string;
          deadline_at: string;
          description: string;
          id: string;
          is_private: boolean;
          max_price: number | null;
          moderation_notes: string | null;
          moderation_status: Database["public"]["Enums"]["moderation_status"];
          owner_id: string;
          region: string;
          starting_price: number | null;
          status: Database["public"]["Enums"]["lot_status"];
          title: string;
          updated_at: string;
          winner_bid_id: string | null;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          currency?: string;
          deadline_at: string;
          description: string;
          id?: string;
          is_private?: boolean;
          max_price?: number | null;
          moderation_notes?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          owner_id: string;
          region: string;
          starting_price?: number | null;
          status?: Database["public"]["Enums"]["lot_status"];
          title: string;
          updated_at?: string;
          winner_bid_id?: string | null;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          currency?: string;
          deadline_at?: string;
          description?: string;
          id?: string;
          is_private?: boolean;
          max_price?: number | null;
          moderation_notes?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          owner_id?: string;
          region?: string;
          starting_price?: number | null;
          status?: Database["public"]["Enums"]["lot_status"];
          title?: string;
          updated_at?: string;
          winner_bid_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lots_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lots_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lots_winner_bid_id_fkey";
            columns: ["winner_bid_id"];
            isOneToOne: false;
            referencedRelation: "bids";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          payload: Json;
          read_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payload?: Json;
          read_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payload?: Json;
          read_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_interactions: {
        Row: {
          created_at: string;
          post_id: string;
          type: Database["public"]["Enums"]["post_interaction_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          type: Database["public"]["Enums"]["post_interaction_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          type?: Database["public"]["Enums"]["post_interaction_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_interactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          body: string | null;
          category_id: string | null;
          created_at: string;
          currency: string;
          id: string;
          images: string[];
          is_published: boolean;
          linked_lot_id: string | null;
          moderation_notes: string | null;
          moderation_status: Database["public"]["Enums"]["moderation_status"];
          price: number | null;
          price_max: number | null;
          region: string | null;
          title: string;
          type: Database["public"]["Enums"]["post_type"];
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body?: string | null;
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          images?: string[];
          is_published?: boolean;
          linked_lot_id?: string | null;
          moderation_notes?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          price?: number | null;
          price_max?: number | null;
          region?: string | null;
          title: string;
          type: Database["public"]["Enums"]["post_type"];
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string | null;
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          images?: string[];
          is_published?: boolean;
          linked_lot_id?: string | null;
          moderation_notes?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          price?: number | null;
          price_max?: number | null;
          region?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["post_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_linked_lot_id_fkey";
            columns: ["linked_lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          created_at: string;
          display_name: string;
          id: string;
          is_admin: boolean;
          is_verified: boolean;
          preferred_locale: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          is_admin?: boolean;
          is_verified?: boolean;
          preferred_locale?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          is_admin?: boolean;
          is_verified?: boolean;
          preferred_locale?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_consents: {
        Row: {
          accepted_at: string;
          document_slug: string;
          document_version: string;
          id: string;
          ip: string | null;
          source: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          document_slug: string;
          document_version: string;
          id?: string;
          ip?: string | null;
          source?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          document_slug?: string;
          document_version?: string;
          id?: string;
          ip?: string | null;
          source?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      account_deletion_requests: {
        Row: {
          cancelled_at: string | null;
          reason: string | null;
          requested_at: string;
          scheduled_for: string;
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          reason?: string | null;
          requested_at?: string;
          scheduled_for?: string;
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          reason?: string | null;
          requested_at?: string;
          scheduled_for?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          deal_id: string;
          id: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          deal_id: string;
          id?: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          deal_id?: string;
          id?: string;
          rating?: number;
          reviewee_id?: string;
          reviewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      verifications: {
        Row: {
          bin: string;
          document_paths: string[];
          entity_type: Database["public"]["Enums"]["verification_entity_type"];
          id: string;
          legal_name: string;
          reviewed_at: string | null;
          reviewer_notes: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          submitted_at: string;
          user_id: string;
        };
        Insert: {
          bin: string;
          document_paths?: string[];
          entity_type: Database["public"]["Enums"]["verification_entity_type"];
          id?: string;
          legal_name: string;
          reviewed_at?: string | null;
          reviewer_notes?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string;
          user_id: string;
        };
        Update: {
          bin?: string;
          document_paths?: string[];
          entity_type?: Database["public"]["Enums"]["verification_entity_type"];
          id?: string;
          legal_name?: string;
          reviewed_at?: string | null;
          reviewer_notes?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      advance_deal_status: {
        Args: { p_deal_id: string; p_new_status: Database["public"]["Enums"]["deal_status"] };
        Returns: Database["public"]["Tables"]["deals"]["Row"];
      };
      cancel_deal: {
        Args: { p_deal_id: string; p_reason: string };
        Returns: Database["public"]["Tables"]["deals"]["Row"];
      };
      close_lot: {
        Args: { p_lot_id: string };
        Returns: Database["public"]["Tables"]["lots"]["Row"];
      };
      current_user_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      mark_conversation_read: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      record_signup_consent: {
        Args: { p_user_id: string; p_document_slug: string; p_document_version: string };
        Returns: undefined;
      };
      mark_notifications_read: {
        Args: { p_ids?: string[] };
        Returns: number;
      };
      select_winner: {
        Args: { p_bid_id: string; p_lot_id: string };
        Returns: Database["public"]["Tables"]["lots"]["Row"];
      };
      start_conversation: {
        Args: { p_lot_id?: string; p_other_user: string; p_post_id?: string };
        Returns: Database["public"]["Tables"]["conversations"]["Row"];
      };
      submit_bid: {
        Args: { p_amount: number; p_lot_id: string };
        Returns: Database["public"]["Tables"]["bids"]["Row"];
      };
    };
    Enums: {
      deal_status: "proposed" | "contracted" | "paid" | "delivered" | "closed" | "cancelled";
      lot_status: "draft" | "open" | "closing" | "closed" | "cancelled";
      moderation_status: "pending" | "approved" | "rejected" | "auto_approved";
      post_interaction_type: "like" | "save";
      post_type: "case" | "product" | "news" | "media";
      verification_entity_type: "IP" | "TOO";
      verification_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
