"use client";

import { useAccount, useReadContract } from "wagmi";
import { SWARMPOLL_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ContractDebug() {
  const { address, isConnected } = useAccount();

  // Test if contracts are accessible
  const { data: ownerAddress, error: ownerError } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: "owner",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "owner",
  });

  const { data: usdcName, error: usdcError } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });

  const { data: usdcBalance, error: balanceError } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span>Wallet Connected: {isConnected ? "Yes" : "No"}</span>
        </div>

        {address && (
          <div>
            <p className="text-sm text-muted-foreground">Your Address:</p>
            <p className="font-mono text-sm">{address}</p>
          </div>
        )}

        {/* Contract Addresses */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">SwarmPoll Contract:</p>
            <p className="font-mono text-sm">{SWARMPOLL_CONTRACT_ADDRESS}</p>
            {ownerError ? (
              <Badge variant="destructive" className="mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error: {ownerError.message}
              </Badge>
            ) : ownerAddress ? (
              <Badge variant="default" className="mt-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Owner: {ownerAddress.toString()}
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-1">
                Loading...
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">USDC Contract:</p>
            <p className="font-mono text-sm">{USDC_CONTRACT_ADDRESS}</p>
            {usdcError ? (
              <Badge variant="destructive" className="mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error: {usdcError.message}
              </Badge>
            ) : usdcName ? (
              <Badge variant="default" className="mt-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Name: {usdcName.toString()}
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-1">
                Loading...
              </Badge>
            )}
          </div>
        </div>

        {/* USDC Balance */}
        {address && (
          <div>
            <p className="text-sm text-muted-foreground">Your USDC Balance:</p>
            {balanceError ? (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error: {balanceError.message}
              </Badge>
            ) : usdcBalance ? (
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                {(Number(usdcBalance) / 1e6).toFixed(2)} USDC
              </Badge>
            ) : (
              <Badge variant="outline">Loading...</Badge>
            )}
          </div>
        )}

        {/* Environment Check */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Environment Variables</h4>
          <div className="space-y-1 text-sm">
            <p>• NEXT_PUBLIC_SWARM_POLL_ADDRESS: {SWARMPOLL_CONTRACT_ADDRESS ? "Set" : "Not Set"}</p>
            <p>• NEXT_PUBLIC_MOCK_USDC_ADDRESS: {USDC_CONTRACT_ADDRESS ? "Set" : "Not Set"}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">Troubleshooting Tips</h4>
          <div className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
            <p>• Make sure you're on Arbitrum Sepolia network</p>
            <p>• Check if contract addresses are correct</p>
            <p>• Ensure you have USDC tokens for staking</p>
            <p>• Verify contracts are deployed and accessible</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
