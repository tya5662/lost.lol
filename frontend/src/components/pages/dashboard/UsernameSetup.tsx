import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "../../../hooks/use-toast";
import { API_URL } from '@/services/api';

interface UsernameSetupProps {
  onUsernameSet: (username: string) => void;
}

const UsernameSetup: React.FC<UsernameSetupProps> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      if (!/^[a-z0-9._]{1,20}$/.test(username)) {
        toast({
          title: "Invalid Username",
          description: "Username must be 1-20 characters using lowercase letters, numbers, periods, or underscores.",
          variant: "destructive"
        });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${API_URL}/users/username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (data.exists) {
        toast({
          title: "Username Taken",
          description: "This username is already in use. Please choose another.",
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || 'Failed to set username',
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Username set successfully!",
        variant: "default"
      });

      onUsernameSet(username);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set username",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center">
      <h1 className="mb-8 text-3xl font-bold text-white">Set up your <span className="text-[#c15bd7]">lost.lol</span> page</h1>
      <div className="w-full max-w-md space-y-6 rounded-[28px] border border-white/10 bg-[#111012] p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center">Choose Your Username</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              placeholder="Enter a unique username"
              required
              minLength={1}
              maxLength={20}
              pattern="[a-z0-9._]{1,20}"
              disabled={isChecking}
              className="bg-black"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full border border-[#9650a5] bg-[#572760] text-white transition-colors hover:bg-[#683073]"
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Set Username"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;