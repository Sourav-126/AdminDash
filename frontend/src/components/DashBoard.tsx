import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { UserCard } from "./Usercard";
import axios from "axios";

export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = () =>
    axios
      .get("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  useEffect(() => {
    fetchUsers();
  }, []);
  console.log(users);
  return (
    <div>
      <Navbar onUserCreated={fetchUsers} />
      {users &&
        users.map((user) => {
          return <UserCard user={user} />;
        })}
    </div>
  );
};
