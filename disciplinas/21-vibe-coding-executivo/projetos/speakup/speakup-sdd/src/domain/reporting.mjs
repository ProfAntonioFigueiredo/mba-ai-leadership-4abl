export function csvCell(value) {
  const s = String(value ?? "");
  return (
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
  );
}
export function frequency(bookings) {
  const marked = bookings.filter((b) => b.attendance);
  return marked.length
    ? Math.round(
        (100 * marked.filter((b) => b.attendance === "Presente").length) /
          marked.length,
      )
    : null;
}
