import { trust } from "../lib/copy";

export function RoomCard({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
      <div className="mt-4 text-xs text-zinc-400">
        {trust.roomCardPill}
      </div>
    </div>
  );
}




