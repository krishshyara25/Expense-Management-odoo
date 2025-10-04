// Handles communication with the OCR API/mock
class OCRService {
  constructor() {
    this.apiKey = process.env.OCR_API_KEY;
    this.apiURL = process.env.OCR_API_URL || 'https://api.ocr.space/parse/image';
  }

  async extractReceiptData(imageFile) {
    try {
      // Mock OCR response for development
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        return this.getMockOCRResponse();
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await fetch(this.apiURL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.IsErroredOnProcessing) {
        throw new Error('OCR processing failed');
      }

      return this.parseOCRResponse(result);
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract receipt data');
    }
  }

  parseOCRResponse(ocrResult) {
    const text = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    
    // Basic parsing logic - can be enhanced with better algorithms
    const lines = text.split('\n').filter(line => line.trim());
    
    const extractedData = {
      amount: this.extractAmount(lines),
      date: this.extractDate(lines),
      vendor: this.extractVendor(lines),
      description: this.extractDescription(lines)
    };

    return extractedData;
  }

  extractAmount(lines) {
    const amountRegex = /[\$€£¥]?(\d+[\.,]?\d*)/g;
    const amounts = [];
    
    lines.forEach(line => {
      const matches = line.match(amountRegex);
      if (matches) {
        matches.forEach(match => {
          const num = parseFloat(match.replace(/[^\d\.,]/g, '').replace(',', '.'));
          if (!isNaN(num) && num > 0) {
            amounts.push(num);
          }
        });
      }
    });

    // Return the largest amount found (likely the total)
    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }

  extractDate(lines) {
    const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
    
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (error) {
          // Continue searching
        }
      }
    }
    
    return new Date().toISOString().split('T')[0]; // Default to today
  }

  extractVendor(lines) {
    // Usually the vendor name is in the first few lines
    const vendorCandidates = lines.slice(0, 3);
    
    for (const line of vendorCandidates) {
      const cleaned = line.trim();
      if (cleaned.length > 2 && !this.isAmountLine(cleaned) && !this.isDateLine(cleaned)) {
        return cleaned;
      }
    }
    
    return 'Unknown Vendor';
  }

  extractDescription(lines) {
    // Look for item descriptions
    const items = [];
    
    lines.forEach(line => {
      const cleaned = line.trim();
      if (cleaned.length > 3 && 
          !this.isAmountLine(cleaned) && 
          !this.isDateLine(cleaned) && 
          !this.isVendorLine(cleaned, lines.slice(0, 3))) {
        items.push(cleaned);
      }
    });

    return items.slice(0, 3).join(', ') || 'Expense';
  }

  isAmountLine(line) {
    return /[\$€£¥]?\d+[\.,]?\d*/.test(line);
  }

  isDateLine(line) {
    return /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(line);
  }

  isVendorLine(line, vendorCandidates) {
    return vendorCandidates.includes(line);
  }

  getMockOCRResponse() {
    // Mock response for testing
    return {
      amount: 25.99,
      date: new Date().toISOString().split('T')[0],
      vendor: 'Coffee Shop',
      description: 'Coffee and pastry'
    };
  }
}

export default new OCRService();