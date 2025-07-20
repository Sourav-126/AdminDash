import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRef } from "react";
const baseURL = import.meta.env.VITE_API_URL; // for Vite

interface NavbarProps {
  onUserCreated: () => void;
}

export const Navbar = ({ onUserCreated }: NavbarProps) => {
  const [name, setName] = useState("");
  const ref = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");

  const handleCreate = async () => {
    const response = await axios.post(
      `${baseURL}/api/admin/create-user`,
      {
        name: name,
        email: email,
      },
      {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      toast.success("User Created Successfully");
      onUserCreated();
      setName("");
      setEmail("");
      ref.current?.click();
    } else {
      toast.error("Error Creating User");
    }
  };

  return (
    <div className="border-b flex justify-between px-10 py-4">
      <Link
        to={"/dashboard"}
        className=" text-2xl flex flex-col justify-center cursor-pointer font-bold"
      >
        Admin DashBoard
      </Link>
      <div>
        <Dialog>
          <DialogTrigger className="flex cursor-pointer items-center text-white bg-black mr-4 focus:outline-none focus:ring-4  font-medium rounded-md text- px-5 py-2.5 text-center me-2 mb-2 ">
            <Plus /> &nbsp; Create User
          </DialogTrigger>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-semibold leading-6 text-gray-900 ">
                Name
              </label>
              <Input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Sourav Arora"
              ></Input>
              <label className="text-sm font-semibold leading-6 text-gray-900">
                Email
              </label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Sourav@example.com"
                type="text"
              ></Input>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={ref} className="cursor-pointer" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleCreate}
                className="cursor-pointer"
                type="submit"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
