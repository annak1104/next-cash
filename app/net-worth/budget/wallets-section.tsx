import getWallets from "@/data/getWallets";
import WalletsList from "./wallets-list";

export default async function WalletsSection() {
  const wallets = await getWallets();

  return (
    <div className="space-y-4">
      <WalletsList wallets={wallets} />
    </div>
  );
}

