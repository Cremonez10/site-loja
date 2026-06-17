type OrderSummaryProps = {
  itemsCount: number;
  total: string;
};

export default function OrderSummary({ itemsCount, total }: OrderSummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
      <h2 className="text-xl font-semibold">Mini-pedido</h2>
      <p className="mt-3 text-slate-400">Itens: {itemsCount}</p>
      <p className="text-slate-200">Total: {total}</p>
    </section>
  );
}
