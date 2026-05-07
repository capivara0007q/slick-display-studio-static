export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          ativa: boolean
          created_at: string
          icon: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          ativa?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      cupons: {
        Row: {
          ativo: boolean
          created_at: string
          desconto: string
          desconto_percentual: number | null
          descricao: string | null
          foto_url: string | null
          id: string
          loja_id: string
          preco_original: number | null
          titulo: string
          updated_at: string
          validade: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          desconto: string
          desconto_percentual?: number | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          loja_id: string
          preco_original?: number | null
          titulo: string
          updated_at?: string
          validade?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          desconto?: string
          desconto_percentual?: number | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          loja_id?: string
          preco_original?: number | null
          titulo?: string
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cupons_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          id: string
          loja_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          loja_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          loja_id?: string
          user_id?: string
        }
        Relationships: []
      }
      loja_usuarios: {
        Row: {
          created_at: string
          id: string
          loja_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          loja_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          loja_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_usuarios_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          ativa: boolean
          categoria_id: string | null
          created_at: string
          descricao: string | null
          endereco: string | null
          estrelas: number
          foto_url: string | null
          id: string
          maps_url: string | null
          nome: string
          servicos: string[]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estrelas?: number
          foto_url?: string | null
          id?: string
          maps_url?: string | null
          nome: string
          servicos?: string[]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estrelas?: number
          foto_url?: string | null
          id?: string
          maps_url?: string | null
          nome?: string
          servicos?: string[]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lojas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem: string
          tipo?: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          avatar_url: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          id: string
          nome: string
          rejection_reason: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          id: string
          nome: string
          rejection_reason?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          id?: string
          nome?: string
          rejection_reason?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitacoes: {
        Row: {
          admin_resposta: string | null
          approved_at: string | null
          approved_by: string | null
          codigo: string
          created_at: string
          cupom_id: string
          id: string
          status: Database["public"]["Enums"]["solicitacao_status"]
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          admin_resposta?: string | null
          approved_at?: string | null
          approved_by?: string | null
          codigo?: string
          created_at?: string
          cupom_id: string
          id?: string
          status?: Database["public"]["Enums"]["solicitacao_status"]
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          admin_resposta?: string | null
          approved_at?: string | null
          approved_by?: string | null
          codigo?: string
          created_at?: string
          cupom_id?: string
          id?: string
          status?: Database["public"]["Enums"]["solicitacao_status"]
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_cupom_id_fkey"
            columns: ["cupom_id"]
            isOneToOne: false
            referencedRelation: "cupons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_lojista: {
        Row: {
          avatar_url: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          id: string | null
          nome: string | null
        }
        Insert: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
        }
        Update: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_lojista_of: {
        Args: { _loja_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
      minhas_lojas: { Args: { _user_id: string }; Returns: string[] }
      user_nivel: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user" | "lojista"
      approval_status: "pendente" | "aprovado" | "negado"
      solicitacao_status:
        | "pendente"
        | "aprovada"
        | "negada"
        | "usada"
        | "expirada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "lojista"],
      approval_status: ["pendente", "aprovado", "negado"],
      solicitacao_status: [
        "pendente",
        "aprovada",
        "negada",
        "usada",
        "expirada",
      ],
    },
  },
} as const
