import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-primary">
            SwarmPoll
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Polls
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
            <Link href="/create-poll">
              <Button variant="ghost" size="sm">
                Create Poll
              </Button>
            </Link>
          </div>
        </div>
        <ConnectButton />
      </div>
    </nav>
  )
}
