'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';

interface User {
  id: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const response = await fetch('/api/user');
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setUser(data);
      } catch (error) {
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
