// dateUtils.js
import { parseISO, isValid, format } from "date-fns";

export function formatDate(date) {
    if (!date) return "-";
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return isValid(d) ? format(d, "dd MMM yyyy") : "-";
}
