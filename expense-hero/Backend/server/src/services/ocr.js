import Tesseract from 'tesseract.js';

export async function parseReceipt(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  // naive extraction: amount, date, merchant (first non-empty line)
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const merchant = lines[0] || ''
  const amountMatch = text.match(/(?:TOTAL|AMOUNT|SUM)\s*[:\-]?\s*([\$₹€£]?\s*[0-9]+[\.,][0-9]{2})/i) || text.match(/([\$₹€£]?\s*[0-9]+[\.,][0-9]{2})\s*$/m)
  const dateMatch = text.match(/(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/)
  const parsed = {
    text,
    merchant,
    amount: amountMatch ? amountMatch[1].replace(/[^0-9\.,]/g, '') : '',
    date: dateMatch ? dateMatch[1] : '',
    description: lines.slice(1, 4).join(' '),
  }
  return parsed;
}
