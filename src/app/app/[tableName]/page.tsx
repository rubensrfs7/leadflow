"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { apiRequest, buildQuery, PaginatedResponse } from "@/lib/api";
import { tableConfigs, TableConfig } from "@/lib/tables";
import { appTheme } from "@/lib/theme-config";
import { downloadRecordsReport } from "@/components/records-report";

const fieldLabelClass = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";
const fieldControlClass = "mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:translate-y-0 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800";
const iconButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white";
const dangerIconButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300";

export default function CrudPage({ params }: { params: Promise<{ tableName: string }> }) {
  const { tableName } = React.use(params);
  const table = tableConfigs.find((item) => item.route.endsWith(tableName)) || tableConfigs[0];
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>(table.primaryKey);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lookupOptions, setLookupOptions] = useState<Record<string, Record<string, any>[]>>({});
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [deletingRow, setDeletingRow] = useState<Record<string, any> | null>(null);
  const pageSize = 10;

  const visibleColumns = useMemo(() => table.columns.filter((column) => column.visible).slice(0, 6), [table]);

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      const query = buildQuery({ page, limit: pageSize, search, orderBy: sortBy, order });
      const result = await apiRequest<PaginatedResponse<Record<string, any>>>(`${table.endpoint}${query}`);
      setRows(result.data || []);
      setTotal(result.pagination?.total ?? result.data?.length ?? 0);
      setTotalPages(Math.max(1, result.pagination?.totalPages ?? 1));
    } catch (err: any) {
      setError(err.message || "Erro ao carregar registros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, [table.name, page, search, sortBy, order]);

  useEffect(() => {
    async function loadLookups() {
      const entries = await Promise.all(
        table.parentLookups.map(async (lookup) => {
          try {
            const result = await apiRequest<PaginatedResponse<Record<string, any>>>(`${lookup.endpoint}?page=1&limit=100`);
            return [lookup.field, result.data || []] as const;
          } catch {
            return [lookup.field, []] as const;
          }
        })
      );
      setLookupOptions(Object.fromEntries(entries));
    }
    loadLookups();
  }, [table.name]);

  const changeSort = (columnName: string) => {
    if (sortBy === columnName) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnName);
      setOrder("asc");
    }
  };

  const normalizeDatePayload = (data: Record<string, any>) => {
    const normalized = { ...data };
    table.columns.forEach((column) => {
      const type = column.type.toLowerCase();
      const value = normalized[column.name];
      if (!value) return;

      if (type === "date") {
        normalized[column.name] = String(value).slice(0, 10);
        return;
      }

      if (type === "timestamp" || type === "datetime") {
        const raw = String(value);
        const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw.length === 16 ? `${raw}:00` : raw);
        if (!Number.isNaN(date.getTime())) {
          normalized[column.name] = date.toISOString();
        }
      }
    });
    return normalized;
  };

  const isDateColumn = (type: string) => {
    const normalized = type.toLowerCase();
    return normalized === "date" || normalized === "timestamp" || normalized === "datetime";
  };

  const formatDisplayValue = (value: any, type?: string) => {
    if (value === null || value === undefined || value === "") return "-";
    if (type && isDateColumn(type)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("pt-BR");
      }
      const raw = String(value);
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const [year, month, day] = raw.slice(0, 10).split("-");
        return `${day}/${month}/${year}`;
      }
    }
    return String(value);
  };

  const saveRow = async (data: Record<string, any>) => {
    const id = editingRow?.[table.primaryKey];
    const payload = normalizeDatePayload(data);
    try {
      const saved = await apiRequest<Record<string, any>>(id ? `${table.endpoint}/${id}` : table.endpoint, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await loadRows();
      setToast({ message: id ? "Registro salvo com sucesso." : "Registro incluído com sucesso.", type: "success" });
      if (table.childCollections.length > 0) {
        setEditingRow(saved || data);
      } else {
        setEditingRow(null);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar registro.");
      setToast({ message: err.message || "Erro ao salvar registro.", type: "error" });
    }
  };

  const removeRow = async () => {
    if (!deletingRow) return;
    try {
      await apiRequest(`${table.endpoint}/${deletingRow[table.primaryKey]}`, { method: "DELETE" });
      setDeletingRow(null);
      await loadRows();
      setToast({ message: "Registro excluído com sucesso.", type: "success" });
    } catch (err: any) {
      setError(err.message || "Erro ao excluir registro.");
      setToast({ message: err.message || "Erro ao excluir registro.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{table.label}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadRecordsReport(table, rows)} className={secondaryButtonClass}>
            <Printer className="h-4 w-4" /> Imprimir relatório
          </button>
          <button onClick={() => setEditingRow({})} className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60" style={{ backgroundColor: appTheme.colors.primary, boxShadow: `0 16px 32px ${appTheme.colors.primary}33` }}>
            <Plus className="h-4 w-4" /> Novo registro
          </button>
        </div>
      </div>

      <section className="rounded-[var(--radius-app)] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar registros..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold outline-none shadow-sm transition focus:border-transparent focus:ring-2 dark:border-slate-700 dark:bg-slate-950" style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties} />
          </label>
          <div className="flex flex-col gap-2 md:items-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 md:hidden">
              Ordenar por
              <select
                value={sortBy}
                onChange={(event) => { setSortBy(event.target.value); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-transparent focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties}
              >
                {visibleColumns.map((column) => (
                  <option key={column.name} value={column.name}>{column.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { setOrder((current) => (current === "asc" ? "desc" : "asc")); setPage(1); }}
                className={secondaryButtonClass}
              >
                {order === "asc" ? "↑" : "↓"}
              </button>
            </label>
            <span className="text-xs font-semibold text-slate-500">{loading ? "Carregando..." : `${total} registro(s)`}</span>
          </div>
        </div>

        {error && <p className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-200">{error}</p>}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.name} className="px-4 py-3">
                    <button
                      onClick={() => { changeSort(column.name); setPage(1); }}
                      className="inline-flex items-center gap-1 rounded-lg px-1 py-0.5 font-bold transition hover:bg-slate-200 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                      title={`Ordenar por ${column.label}`}
                    >
                      <span>{column.label}</span>
                      <span className={sortBy === column.name ? "text-slate-950 dark:text-white" : "text-slate-300 dark:text-slate-600"}>
                        {sortBy === column.name ? (order === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[table.primaryKey]} className="border-t border-slate-100 dark:border-slate-800">
                  {visibleColumns.map((column) => (
                    <td key={column.name} className="max-w-[240px] truncate px-4 py-3 text-slate-600 dark:text-slate-300" title={formatDisplayValue(row[column.name], column.type)}>{formatDisplayValue(row[column.name], column.type)}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingRow(row)} className={iconButtonClass}><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeletingRow(row)} className={dangerIconButtonClass}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {rows.map((row) => (
            <article key={row[table.primaryKey]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold">#{String(row[table.primaryKey] ?? "-")}</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditingRow(row)} className={iconButtonClass}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeletingRow(row)} className={dangerIconButtonClass}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <dl className="grid gap-2">
                {visibleColumns.map((column) => (
                  <div key={column.name} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 border-t border-slate-200 pt-2 text-sm dark:border-slate-800">
                    <dt className="min-w-0 font-semibold text-slate-500">{column.label}</dt>
                    <dd className="min-w-0 break-words text-right text-slate-700 dark:text-slate-200">{formatDisplayValue(row[column.name], column.type)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm dark:border-slate-800">
          <button disabled={page === 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className={secondaryButtonClass}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button disabled={page === totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className={secondaryButtonClass}>Próxima</button>
        </div>
      </section>

      {editingRow && (
        <RecordModal
          table={table}
          row={editingRow}
          lookupOptions={lookupOptions}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
        />
      )}
      {deletingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[calc(var(--radius-app)+0.5rem)] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-red-100 bg-red-50 px-6 py-5 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-xs font-bold uppercase tracking-wide text-red-500">Acao irreversivel</p>
              <h2 className="mt-1 text-xl font-black tracking-tight">Confirmar exclusao</h2>
            </div>
            <p className="px-6 pt-5 text-sm leading-6 text-slate-500 dark:text-slate-300">Essa acao removera o registro selecionado na API.</p>
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/60">
              <button onClick={() => setDeletingRow(null)} className={secondaryButtonClass}>Cancelar</button>
              <button onClick={removeRow} className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-500">Excluir</button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function RecordModal({
  table,
  row,
  lookupOptions,
  onClose,
  onSave,
}: {
  table: TableConfig;
  row: Record<string, any>;
  lookupOptions: Record<string, Record<string, any>[]>;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
}) {
  const [formData, setFormData] = useState(row);
  const [saving, setSaving] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const isDateColumn = (type: string) => {
    const normalized = type.toLowerCase();
    return normalized === "timestamp" || normalized === "datetime" || normalized === "date";
  };
  const editableColumns = table.columns.filter((column) => column.visible && (column.editable || isDateColumn(column.type)));
  const getLookup = (field: string) => table.parentLookups.find((lookup) => lookup.field === field);
  const getLookupLabel = (lookup: NonNullable<ReturnType<typeof getLookup>>, option: Record<string, any>) => {
    const displayField = lookup.displayField || lookup.parentField || "id";
    return String(option[displayField] ?? option.name ?? option.title ?? option.email ?? option[lookup.parentField || "id"] ?? option.id);
  };

  useEffect(() => {
    setFormData(row);
  }, [row]);

  const formatDateInputValue = (value: any, type: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const pad = (input: number) => String(input).padStart(2, "0");
    const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return datePart;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <form onSubmit={async (event) => { event.preventDefault(); setSaving(true); await onSave(formData); setSaving(false); }} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[calc(var(--radius-app)+0.5rem)] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{table.label}</p>
          <h2 className="mt-1 text-xl font-black tracking-tight">{row?.[table.primaryKey] ? "Editar registro" : "Novo registro"}</h2>
        </div>
        <div className="grid shrink-0 gap-4 p-6 md:grid-cols-2">
          {editableColumns.map((column) => (
            <label key={column.name} className={fieldLabelClass}>
              {column.label}
              {getLookup(column.name) ? (
                <select
                  value={formData[column.name] ?? ""}
                  onChange={(event) => setFormData((current) => ({ ...current, [column.name]: event.target.value }))}
                  className={fieldControlClass}
                  style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties}
                >
                  <option value="">Selecione...</option>
                  {(lookupOptions[column.name] || []).map((option) => (
                    <option key={String(option[getLookup(column.name)?.parentField || "id"] ?? option.id)} value={String(option[getLookup(column.name)?.parentField || "id"] ?? option.id)}>
                      {getLookupLabel(getLookup(column.name)!, option)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={isDateColumn(column.type) ? "date" : "text"}
                  value={isDateColumn(column.type) ? formatDateInputValue(formData[column.name], column.type) : (formData[column.name] ?? "")}
                  onChange={(event) => setFormData((current) => ({ ...current, [column.name]: event.target.value }))}
                  className={fieldControlClass}
                  style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties}
                />
              )}
            </label>
          ))}
        </div>
        {table.childCollections.length > 0 && (
          <div className="shrink-0 px-6">
            <button
              type="button"
              onClick={() => setShowChildren((current) => !current)}
              className={secondaryButtonClass}
            >
              {showChildren ? "Ocultar registros filhos" : "Exibir registros filhos"}
            </button>
            {showChildren && <ChildCollectionsPanel table={table} parentRow={formData} />}
          </div>
        )}
        <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/60">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancelar</button>
          <button disabled={saving} className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60" style={{ backgroundColor: appTheme.colors.primary, boxShadow: `0 16px 32px ${appTheme.colors.primary}33` }}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}

function Toast({ toast, onClose }: { toast: { message: string; type: "success" | "error" } | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[calc(100vw-2rem)] max-w-sm">
      <div className={`rounded-2xl border p-4 text-sm font-semibold shadow-2xl ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"}`}>
        <div className="flex items-start justify-between gap-3">
          <span>{toast.message}</span>
          <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">Fechar</button>
        </div>
      </div>
    </div>
  );
}

function ChildCollectionsPanel({ table, parentRow }: { table: TableConfig; parentRow: Record<string, any> }) {
  const [childRows, setChildRows] = useState<Record<string, Record<string, any>[]>>({});
  const [childForms, setChildForms] = useState<Record<string, Record<string, any>>>({});
  const [loading, setLoading] = useState(false);
  const [savingChild, setSavingChild] = useState<string | null>(null);
  const [childError, setChildError] = useState("");

  const parentId = parentRow?.[table.primaryKey] ? String(parentRow[table.primaryKey]) : "";

  const loadChildren = async () => {
    if (!parentId) return;
    setLoading(true);
    try {
      const entries = await Promise.all(
        table.childCollections.map(async (child) => {
          try {
            const result = await apiRequest<PaginatedResponse<Record<string, any>>>(`${child.endpoint}${buildQuery({ page: 1, limit: 100, orderBy: child.childField, order: "asc" })}`);
            const filtered = (result.data || []).filter((row) => String(row[child.childField]) === parentId);
            return [child.childTable, filtered] as const;
          } catch {
            return [child.childTable, []] as const;
          }
        })
      );
      setChildRows(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [parentId, table.name]);

  const getChildConfig = (childTable: string) => tableConfigs.find((config) => config.name === childTable);
  const isDateColumn = (type: string) => {
    const normalized = type.toLowerCase();
    return normalized === "timestamp" || normalized === "datetime" || normalized === "date";
  };
  const formatDateInputValue = (value: any, type: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const pad = (input: number) => String(input).padStart(2, "0");
    const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return datePart;
  };
  const normalizeChildPayload = (data: Record<string, any>, childTable: string) => {
    const childConfig = getChildConfig(childTable);
    const normalized = { ...data };
    childConfig?.columns.forEach((column) => {
      const type = column.type.toLowerCase();
      const value = normalized[column.name];
      if (!value) return;
      if (type === "date") {
        normalized[column.name] = String(value).slice(0, 10);
        return;
      }
      if (type === "timestamp" || type === "datetime") {
        const raw = String(value);
        const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw.length === 16 ? `${raw}:00` : raw);
        if (!Number.isNaN(date.getTime())) normalized[column.name] = date.toISOString();
      }
    });
    return normalized;
  };
  const formatDisplayValue = (value: any, type?: string) => {
    if (value === null || value === undefined || value === "") return "-";
    if (type && isDateColumn(type)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("pt-BR");
      const raw = String(value);
      if (/^\\d{4}-\\d{2}-\\d{2}/.test(raw)) {
        const [year, month, day] = raw.slice(0, 10).split("-");
        return `${day}/${month}/${year}`;
      }
    }
    return String(value);
  };

  const saveChild = async (child: TableConfig["childCollections"][number]) => {
    const childConfig = getChildConfig(child.childTable);
    if (!childConfig || !parentId) return;
    setSavingChild(child.childTable);
    setChildError("");
    try {
      const payload = normalizeChildPayload({
        ...(childForms[child.childTable] || {}),
        [child.childField]: parentId,
      }, child.childTable);
      const savedChild = await apiRequest<Record<string, any>>(child.endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setChildForms((current) => ({ ...current, [child.childTable]: {} }));
      setChildRows((current) => ({
        ...current,
        [child.childTable]: [savedChild || payload, ...(current[child.childTable] || [])],
      }));
      await loadChildren();
    } catch (err: any) {
      setChildError(err.message || "Erro ao salvar registro filho.");
    } finally {
      setSavingChild(null);
    }
  };

  return (
    <section className="mt-3 max-h-[42vh] overflow-y-auto rounded-[var(--radius-app)] border border-slate-200 bg-slate-50/80 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950/70">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Registros filhos</h2>
          <p className="text-sm text-slate-500">
            {parentId ? "Gerencie itens relacionados a este registro." : "Salve o registro principal antes de incluir registros filhos."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {table.childCollections.map((child) => (
          <article key={child.childTable} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">{child.label}</h3>
            </div>
            {childError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-200">{childError}</p>}
            {parentId && (() => {
              const childConfig = getChildConfig(child.childTable);
              const fields = childConfig?.columns.filter((column) => column.visible && (column.editable || isDateColumn(column.type)) && column.name !== child.childField) || [];
              return (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="grid gap-3 md:grid-cols-2">
                    {fields.map((column) => (
                      <label key={column.name} className={fieldLabelClass}>
                        {column.label}
                        <input
                          type={isDateColumn(column.type) ? "date" : "text"}
                          value={isDateColumn(column.type) ? formatDateInputValue(childForms[child.childTable]?.[column.name], column.type) : (childForms[child.childTable]?.[column.name] ?? "")}
                          onChange={(event) =>
                            setChildForms((current) => ({
                              ...current,
                              [child.childTable]: {
                                ...(current[child.childTable] || {}),
                                [column.name]: event.target.value,
                              },
                            }))
                          }
                          className={fieldControlClass}
                          style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties}
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => saveChild(child)}
                    disabled={savingChild === child.childTable}
                    className="mt-4 inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60"
                    style={{ backgroundColor: appTheme.colors.primary, boxShadow: `0 16px 32px ${appTheme.colors.primary}33` }}
                  >
                    {savingChild === child.childTable ? "Salvando..." : "Adicionar filho"}
                  </button>
                </div>
              );
            })()}
            <div className="mt-3 space-y-2">
              {loading && <p className="text-sm text-slate-500">Carregando...</p>}
              {!loading && (childRows[child.childTable] || []).length === 0 && (
                <p className="text-sm text-slate-500">Nenhum registro filho encontrado.</p>
              )}
              {(childRows[child.childTable] || []).slice(0, 5).map((row, index) => (
                <div key={String(row.id ?? index)} className="rounded-xl bg-white p-3 text-sm shadow-sm dark:bg-slate-950">
                  <dl className="grid gap-1 text-xs">
                    {(getChildConfig(child.childTable)?.columns.filter((column) => column.visible && column.editable && column.name !== child.childField).slice(0, 4) || []).map((column) => (
                      <div key={column.name} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2">
                        <dt className="min-w-0 font-semibold text-slate-500">{column.label}</dt>
                        <dd className="min-w-0 break-words text-right text-slate-700 dark:text-slate-200">{formatDisplayValue(row[column.name], column.type)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
