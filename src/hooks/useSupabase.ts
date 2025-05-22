/**
 * Supabase client hook for accessing Supabase functionality throughout the application
 *
 * This hook provides a consistent way to access the Supabase client instance
 * across components and custom hooks, ensuring proper initialization and type safety.
 */
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

/**
 * Type representing the database schema structure
 * This would typically be generated from your database schema
 */
export type Database = {
  public: {
    tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          // Add other user fields as needed
        };
        Insert: {
          id?: string;
          email: string;
          // Add other insertable fields
        };
        Update: {
          id?: string;
          email?: string;
          // Add other updatable fields
        };
      };
      // Add other tables as needed
    };
  };
};

/**
 * Custom hook that provides access to a typed Supabase client instance
 *
 * The client is properly typed with the application's database schema
 * to provide TypeScript inference for database operations.
 *
 * @returns {SupabaseClient<Database>} Typed Supabase client instance
 *
 * @example
 * // In a component:
 * import { useSupabase } from '@/hooks/useSupabase';
 *
 * function UserList() {
 *   const supabase = useSupabase();
 *   const [users, setUsers] = useState([]);
 *
 *   useEffect(() => {
 *     async function fetchUsers() {
 *       const { data, error } = await supabase
 *         .from('users')
 *         .select('id, name, email');
 *
 *       if (data && !error) {
 *         setUsers(data);
 *       }
 *     }
 *
 *     fetchUsers();
 *   }, [supabase]);
 *
 *   return (
 *     <ul>
 *       {users.map(user => (
 *         <li key={user.id}>{user.name} ({user.email})</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
export function useSupabase(): SupabaseClient<Database> {
  // Initialize the Supabase client with environment variables
  // These should be defined in your .env file
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Create and return the client
  return createClient<Database>(supabaseUrl, supabaseKey);
}

export default useSupabase;
