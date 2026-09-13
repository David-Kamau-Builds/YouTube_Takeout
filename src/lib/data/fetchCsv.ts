import Papa from 'papaparse';

export function parseCsvText<T>(text: string): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error),
    });
  });
}

export async function fetchCsv<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV ${url}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return parseCsvText<T>(text);
}
