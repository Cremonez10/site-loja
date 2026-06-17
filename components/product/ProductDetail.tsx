type ProductDetailProps = {
  title: string;
  description: string;
  price: string;
  status: string;
};

export default function ProductDetail({ title, description, price, status }: ProductDetailProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/40">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-4 text-slate-300">{description}</p>
      <div className="mt-6 flex flex-col gap-2 text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg">{price}</span>
        <span className="text-sm text-slate-400">Status: {status}</span>
      </div>
    </section>
  );
}
