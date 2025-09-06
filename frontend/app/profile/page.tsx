"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/lib/constants";
import { ClaimableReward } from "@/components/claimable-reward";
import { StakeHistoryItem } from "@/components/stake-history-item";
import { UserStats } from "@/components/user-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Trophy, History, TrendingUp, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  type LocalProfile = {
    displayName: string;
    bio: string;
    avatarUrl: string;
  };

  const [profile, setProfile] = useState<LocalProfile>({
    displayName: "",
    bio: "",
    avatarUrl: "/placeholder-user.jpg",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from localStorage when wallet connects/changes
  useEffect(() => {
    if (!address) return;
    try {
      const raw = localStorage.getItem(`sp_profile_${address}`);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalProfile;
        setProfile({
          displayName: parsed.displayName || "",
          bio: parsed.bio || "",
          avatarUrl: parsed.avatarUrl || "/placeholder-user.jpg",
        });
      } else {
        setProfile((prev) => ({ ...prev, displayName: "", bio: "" }));
      }
    } catch {
      // ignore malformed data
    }
  }, [address]);

  const handleSaveProfile = () => {
    if (!address) return;
    setIsSaving(true);
    try {
      localStorage.setItem(`sp_profile_${address}`, JSON.stringify(profile));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProfile((p) => ({ ...p, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const {
    data: pollCount,
    isLoading: countLoading,
    error: countError,
  } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getPollCount",
  });

  const pollReads = useReadContracts({
    contracts:
      pollCount && Number(pollCount) > 0
        ? Array.from({ length: Number(pollCount) }, (_, i) => ({
            address: SWARMPOLL_CONTRACT_ADDRESS,
            abi: SWARMPOLL_ABI,
            functionName: "getPoll",
            args: [BigInt(i)],
          }))
        : [],
  });

  const polls =
    pollReads.data?.map((pollRes, i) => {
      if (!pollRes.result) return null;
      const [
        question,
        options,
        endTime,
        active,
        totalStaked,
        winnerDeclared,
        winningOptionId,
      ] = pollRes.result as any;
      return {
        id: i,
        question,
        options,
        endTime: Number(endTime),
        isEnded: !active,
        totalStaked: Number(totalStaked) / 1e6,
        winnerDeclared,
        winningOptionId: Number(winningOptionId),
      };
    }) || [];

  const stakes: any[] = [];
  const claims: any[] = [];

  // Derived stats
  const userStats = useMemo(() => {
    return {
      totalStaked: 0,
      totalWon: 0,
      totalLost: 0,
      winRate: 0,
      activePolls: 0,
      claimableRewards: 0,
    };
  }, [stakes, claims]);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Connect your wallet to view your SwarmPoll activity
          </p>
        </div>

        <Card className="text-center py-12 bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-400">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground mb-6">
              View your stake history, claimable rewards, and performance
              statistics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = countLoading || pollReads.isLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          Track your SwarmPoll performance and claim your winnings
        </p>
      </div>

      {/* Data load error */}
      {countError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load polls from contract.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-[144px_1fr] items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 ring-2 ring-purple-500/30">
                <AvatarImage src={profile.avatarUrl} alt="avatar" />
                <AvatarFallback className="bg-purple-500/20 text-purple-700 dark:text-purple-400">
                  {address
                    ? `${address.slice(2, 4)}${address.slice(-2)}`.toUpperCase()
                    : "SP"}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Label
                  htmlFor="avatarFile"
                  className="text-purple-700 dark:text-purple-400"
                >
                  Upload Avatar
                </Label>
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs border-purple-500/30 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="displayName"
                  className="text-purple-700 dark:text-purple-400"
                >
                  Display name
                </Label>
                <Input
                  id="displayName"
                  placeholder={address || "Your name"}
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, displayName: e.target.value }))
                  }
                  className="border-purple-500/30 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-purple-700 dark:text-purple-400"
                >
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about you"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  className="border-purple-500/30 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={!address || isSaving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <UserStats {...userStats} />
      )}

      {/* Stake History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-400">
            Your Stakes
          </h2>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {polls.map(
              (poll) =>
                poll && (
                  <StakeHistoryItem
                    key={poll.id}
                    pollId={poll.id.toString()}
                    pollQuestion={poll.question}
                    optionLabel={"TODO: user option"}
                    userStake={"TODO: fetch"}
                    isEnded={poll.isEnded}
                    isWinner={poll.winnerDeclared}
                    totalStaked={poll.totalStaked.toString()}
                    endTime={poll.endTime.toString()}
                  />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
