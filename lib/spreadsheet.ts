export const items = [
  "Eatables",
  "Cold Drink",
  "Milk",
  "Transport",
  "Stationery",
  "Gift",
  "Others",
];
export const values = [
  [50, 0, 200, 0, 0, 500],
  [40, 40, 120, 0, 40, 80],
  [80, 80, 120, 80, 80, 160],
  [300, 250, 300, 300, 300, 100],
  [5, 0, 0, 25, 0, 0],
  [50, 0, 100, 0, 0, 100],
  [0, 100, 500, 0, 0, 500],
];
export const days = [
  "Items",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Total Expenses",
];
export type Cells = Record<string, string>;
export function initialCells(): Cells {
  const out: Cells = { D1: "WEEKLY EXPENSES" };
  days.forEach((v, i) => (out[String.fromCharCode(65 + i) + "2"] = v));
  items.forEach((v, i) => {
    out["A" + (i + 3)] = v;
    values[i].forEach(
      (n, j) => (out[String.fromCharCode(66 + j) + (i + 3)] = String(n)),
    );
  });
  return out;
}
export function rangeAddresses(a: string, b: string) {
  const parse = (s: string) => {
    const m = /^([A-H])(1[0-2]|[1-9])$/.exec(s);
    if (!m) throw Error("#REF!");
    return [m[1].charCodeAt(0), +m[2]];
  };
  const [ac, ar] = parse(a),
    [bc, br] = parse(b);
  const out: string[] = [];
  for (let r = Math.min(ar, br); r <= Math.max(ar, br); r++)
    for (let c = Math.min(ac, bc); c <= Math.max(ac, bc); c++)
      out.push(String.fromCharCode(c) + r);
  return out;
}
export function evaluateCell(
  address: string,
  cells: Cells,
  seen = new Set<string>(),
): number | string {
  if (!/^[A-H](1[0-2]|[1-9])$/.test(address)) return "#REF!";
  if (seen.has(address)) return "#CYCLE!";
  seen.add(address);
  const raw = (cells[address] || "").trim();
  if (!raw.startsWith("=")) return raw;
  const expr = raw.slice(1).toUpperCase().replace(/\s/g, "");
  const tokens = expr.match(/(?:\d*\.\d+|\d+\.?\d*)|[A-Z]+\d*|[()+*/^,:-]/g);
  if (!tokens || tokens.join("") !== expr) return "#ERROR!";
  let i = 0;
  const ref = (id: string): number | string => {
    const v = evaluateCell(id, cells, new Set(seen));
    if (typeof v === "string" && v.startsWith("#")) throw Error(v);
    return v;
  };
  const numeric = (v: number | string): number => {
    if (v === "") return 0;
    const n = Number(v);
    if (!Number.isFinite(n)) throw Error("#VALUE!");
    return n;
  };
  const factor = (): number => {
    const t = tokens[i++];
    if (t === "-") return -factor();
    if (t === "+") return factor();
    if (t === "(") {
      const v = add();
      if (tokens[i++] !== ")") throw Error("#ERROR!");
      return v;
    }
    if (/^[A-Z]+$/.test(t || "")) {
      if (!["SUM", "AVERAGE", "COUNT", "MAX", "MIN"].includes(t))
        throw Error("#NAME?");
      if (tokens[i++] !== "(") throw Error("#ERROR!");
      const nums: number[] = [];
      while (tokens[i] !== ")") {
        if (i >= tokens.length) throw Error("#ERROR!");
        if (/^[A-Z]+\d+$/.test(tokens[i]) && tokens[i + 1] === ":") {
          const a = tokens[i];
          i += 2;
          const b = tokens[i++];
          for (const id of rangeAddresses(a, b)) {
            const v = ref(id);
            if (v !== "" && Number.isFinite(Number(v))) nums.push(Number(v));
          }
        } else if (
          /^[A-Z]+\d+$/.test(tokens[i]) &&
          [",", ")"].includes(tokens[i + 1])
        ) {
          const v = ref(tokens[i++]);
          if (v !== "" && Number.isFinite(Number(v))) nums.push(Number(v));
        } else nums.push(add());
        if (tokens[i] === ",") {
          i++;
          if (tokens[i] === ")") throw Error("#ERROR!");
        } else if (tokens[i] !== ")") throw Error("#ERROR!");
      }
      i++;
      if (t === "SUM") return nums.reduce((a, b) => a + b, 0);
      if (t === "COUNT") return nums.length;
      if (!nums.length) {
        if (t === "AVERAGE") throw Error("#DIV/0!");
        return 0;
      }
      if (t === "AVERAGE") return nums.reduce((a, b) => a + b, 0) / nums.length;
      return t === "MAX" ? Math.max(...nums) : Math.min(...nums);
    }
    if (/^[A-Z]+\d+$/.test(t || "")) return numeric(ref(t));
    if (!t || !/^\d*\.?\d+$/.test(t)) throw Error("#ERROR!");
    return Number(t);
  };
  const power = (): number => {
    const v = factor();
    return tokens[i] === "^" ? (i++, v ** power()) : v;
  };
  const mul = (): number => {
    let v = power();
    while (["*", "/"].includes(tokens[i])) {
      const op = tokens[i++],
        n = power();
      if (op === "/" && n === 0) throw Error("#DIV/0!");
      v = op === "*" ? v * n : v / n;
    }
    return v;
  };
  const add = (): number => {
    let v = mul();
    while (["+", "-"].includes(tokens[i])) {
      const op = tokens[i++];
      v += (op === "+" ? 1 : -1) * mul();
    }
    return v;
  };
  try {
    const n = add();
    if (i !== tokens.length || !Number.isFinite(n)) return "#ERROR!";
    return Math.round(n * 1e8) / 1e8;
  } catch (e) {
    return e instanceof Error && e.message.startsWith("#")
      ? e.message
      : "#ERROR!";
  }
}
export function rangeValues(
  a: string,
  b: string,
  cells: Cells,
  seen = new Set<string>(),
) {
  return rangeAddresses(a, b)
    .map((id) => evaluateCell(id, cells, new Set(seen)))
    .filter((v) => v !== "" && Number.isFinite(Number(v)))
    .map(Number);
}
