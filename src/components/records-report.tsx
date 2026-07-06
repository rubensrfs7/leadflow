import { TableConfig } from "@/lib/tables";

export function downloadRecordsReport(table: TableConfig, rows: Record<string, any>[]) {
  const columns = table.columns.filter((column) => column.visible).slice(0, 6);
  const printedAt = new Date().toLocaleString("pt-BR");
  const escapePdf = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  const isDateColumn = (type?: string) => {
    const normalized = String(type || "").toLowerCase();
    return normalized === "timestamp" || normalized === "datetime" || normalized === "date";
  };
  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined || value === "") return "-";
    if (isDateColumn(type)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("pt-BR");
      const raw = String(value);
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const [year, month, day] = raw.slice(0, 10).split("-");
        return `${day}/${month}/${year}`;
      }
    }
    return String(value);
  };
  const text = (value: string, x: number, y: number, size = 9) =>
    `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`;

  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 36;
  const tableWidth = pageWidth - margin * 2;
  const colWidth = tableWidth / Math.max(columns.length, 1);
  const rowHeight = 24;
  const headerY = 472;
  const maxRows = 15;
  const pages = rows.length > 0
    ? Array.from({ length: Math.ceil(rows.length / maxRows) }, (_, index) => rows.slice(index * maxRows, (index + 1) * maxRows))
    : [[]];

  const pageContents = pages.map((pageRows, pageIndex) => {
    const commands = [
      "0.96 0.98 1 rg",
      `0 0 ${pageWidth} ${pageHeight} re f`,
      "0.08 0.11 0.18 rg",
      `0 ${pageHeight - 74} ${pageWidth} 74 re f`,
      "1 1 1 rg",
      text(`Relatorio - ${table.label}`, margin, 548, 18),
      text(`Gerado automaticamente em ${printedAt}`, margin, 528, 9),
      "0.93 0.95 0.98 RG",
      "0.93 0.95 0.98 rg",
      `${margin} ${headerY} ${tableWidth} 26 re f`,
      "0.08 0.11 0.18 rg",
      ...columns.map((column, columnIndex) =>
        text(column.label.slice(0, 22), Math.round(margin + columnIndex * colWidth + 8), headerY + 9, 9)
      ),
    ];

    if (pageRows.length === 0) {
      commands.push("0.2 0.25 0.33 rg", text("Nenhum registro encontrado.", margin, headerY - 36, 11));
    }

    pageRows.forEach((row, rowIndex) => {
      const y = headerY - (rowIndex + 1) * rowHeight;
      const fill = rowIndex % 2 === 0 ? "1 1 1 rg" : "0.97 0.98 0.99 rg";
      commands.push(fill, `${margin} ${y} ${tableWidth} ${rowHeight} re f`, "0.82 0.86 0.92 RG", `${margin} ${y} ${tableWidth} ${rowHeight} re S`);
      columns.forEach((column, columnIndex) => {
        const x = Math.round(margin + columnIndex * colWidth);
        commands.push("0.82 0.86 0.92 RG", `${x} ${y} m ${x} ${y + rowHeight} l S`, "0.15 0.18 0.24 rg");
        commands.push(text(formatValue(row[column.name], column.type).slice(0, 28), x + 8, y + 8, 8));
      });
    });

    commands.push(
      "0.35 0.4 0.48 rg",
      text(`Pagina ${pageIndex + 1} de ${pages.length}`, margin, 26, 8),
      text("ProtoSoft", pageWidth - 94, 26, 8)
    );
    return commands.join("\n");
  });

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageContents.map((_, index) => `${4 + index * 2} 0 R`).join(" ")}] /Count ${pageContents.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...pageContents.flatMap((content, index) => [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + index * 2} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ]),
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${table.name}-relatorio.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
