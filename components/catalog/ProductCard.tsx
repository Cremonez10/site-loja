type ProductCardProps = {
  title: string;
  price: string;
  status: string;
};

export default function ProductCard({ title, price, status }: ProductCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-400">{price}</p>
      <p className="mt-3 text-sm text-slate-500">Status: {status}</p>
    </article>
  );
}
