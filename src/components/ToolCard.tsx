import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
}

export function ToolCard({ title, description, href }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="block border border-silver rounded-lg p-6 hover:border-steel transition-colors"
    >
      <h3 className="text-lg font-semibold text-crimson">{title}</h3>
      <p className="text-gray-600 mt-1 text-sm">{description}</p>
    </Link>
  );
}
