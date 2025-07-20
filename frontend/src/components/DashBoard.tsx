import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { UserCard } from "./Usercard";
import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL; // for Vite

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      message?: string;
      error?: string;
    };
  };
}

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token: string | null = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get(`${baseURL}/api/admin/users`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      let usersData: User[];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.users) {
        usersData = response.data.users;
      } else {
        usersData = response.data.users || [];
      }

      setUsers(usersData);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage: string =
        apiError.response?.data?.message ||
        apiError.response?.data?.error ||
        "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = (): void => {
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onUserCreated={handleUserCreated} />

      <main className="container mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading users
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="bg-red-100 px-2 py-1 rounded-md text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-1">
                Users will appear here once they are created.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {users.map((user: User) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </main>
    </div>
  );
};
