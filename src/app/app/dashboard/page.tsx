"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, PaginatedResponse } from "@/lib/api";
import { tableConfigs } from "@/lib/tables";
import { appTheme } from "@/lib/theme-config";

const periodSales = [
  { label: "Jan", value: 12800 },
  { label: "Fev", value: 18400 },
  { label: "Mar", value: 16600 },
  { label: "Abr", value: 22100 },
  { label: "Mai", value: 24800 },
  { label: "Jun", value: 29200 },
];

const categorySales = [
  { label: "Serviços", value: 42 },
  { label: "Produtos", value: 31 },
  { label: "Assinaturas", value: 18 },
  { label: "Outros", value: 9 },
];

const dashboardCardIllustrations = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 190'><g fill='none' stroke='white' stroke-width='10' opacity='.28'><rect x='28' y='28' width='82' height='58' rx='14'/><rect x='150' y='42' width='78' height='52' rx='14'/><rect x='72' y='122' width='118' height='44' rx='14'/><path d='M110 58h40M189 94v28M131 122V86'/></g><circle cx='218' cy='152' r='26' fill='white' opacity='.16'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 190'><g fill='none' stroke='white' stroke-width='9' opacity='.3'><path d='M36 146h186'/><path d='M58 146V84m48 62V48m48 98V70m48 76V32'/><path d='M44 72l58-34 52 28 64-46'/></g><circle cx='74' cy='66' r='18' fill='white' opacity='.16'/><circle cx='202' cy='48' r='28' fill='white' opacity='.12'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 190'><g fill='none' stroke='white' stroke-width='8' opacity='.28'><rect x='42' y='36' width='176' height='118' rx='22'/><path d='M72 74h116M72 104h84M72 132h52'/><path d='M192 70l24-24M202 112l28 18'/></g><circle cx='202' cy='76' r='18' fill='white' opacity='.16'/></svg>",
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 190'><g fill='none' stroke='white' stroke-width='8' opacity='.3'><path d='M54 138c22-48 52-72 88-72 26 0 44 12 64 36'/><path d='M54 138h152'/><circle cx='86' cy='108' r='20'/><circle cx='152' cy='76' r='20'/><circle cx='204' cy='104' r='20'/></g><path d='M208 148c24 0 38-14 38-38' stroke='white' stroke-width='10' opacity='.12' fill='none'/></svg>",
];

function getDashboardCardStyle(index: number): CSSProperties {
  const color = [appTheme.colors.primary, appTheme.colors.secondary, appTheme.colors.tertiary, appTheme.colors.neutral][index % 4];
  return {
    backgroundColor: color,
    backgroundImage:
      "linear-gradient(135deg, rgba(2,6,23,0.08), rgba(2,6,23,0.34)), url(\"data:image/svg+xml," +
      encodeURIComponent(dashboardCardIllustrations[index % dashboardCardIllustrations.length]) +
      "\")",
    backgroundPosition: "center, right -22px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover, 54% auto",
  };
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      setLoading(true);
      try {
        const entries = await Promise.all(
          tableConfigs.map(async (table) => {
            try {
              const result = await apiRequest<PaginatedResponse<Record<string, any>>>(`${table.endpoint}?page=1&limit=1`);
              return [table.name, result.pagination?.total ?? result.data?.length ?? 0] as const;
            } catch {
              return [table.name, 0] as const;
            }
          })
        );
        setCounts(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    }
    loadCounts();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">{appTheme.projectDescription}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tableConfigs.map((table, index) => (
          <article
            key={table.name}
            className="min-h-44 rounded-[var(--radius-app)] border border-white/15 p-5 text-white shadow-sm"
            style={getDashboardCardStyle(index)}
          >
            <p className="text-sm font-semibold text-white/80">{table.label}</p>
            <p className="mt-3 text-3xl font-bold">{loading ? "..." : counts[table.name] ?? 0}</p>
            <Link href={table.route} className="mt-4 inline-flex rounded-xl bg-white/18 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/20 hover:bg-white/25">
              Abrir
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[var(--radius-app)] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-4 font-bold">Vendas do período</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={appTheme.colors.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[var(--radius-app)] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-4 font-bold">Vendas por categoria</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="label" outerRadius={100} label>
                  {categorySales.map((entry, index) => (
                    <Cell key={entry.label} fill={[appTheme.colors.primary, appTheme.colors.secondary, appTheme.colors.tertiary, appTheme.colors.neutral][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
