import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/suitlabs-logo.png';
import jsPDF from 'jspdf';
import './Invoice.css';

const Invoice = () => {
  const navigate = useNavigate();
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: '',
    dueDate: '',
    billTo: '',
    items: [
      { description: '', quantity: 1, rate: 0 }
    ],
    tax: 0,
    amountPaid: 0,
    terms: ''
  });

  // Add logout handler
  const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('session');
    
    // Force navigation to login page
    navigate('/login', { replace: true });
  };

  // Update the formatNumberInput function to not use separators
  const formatNumberInput = (value) => {
    if (value === 0 || value === '0') return '0';
    if (!value && value !== 0) return '';
    return value.toString();
  };

  // Keep the parseFormattedNumber function
  const parseFormattedNumber = (formattedValue) => {
    // Remove all non-numeric characters except decimal point
    const numericString = formattedValue.toString().replace(/[^\d.]/g, '');
    const numericValue = parseFloat(numericString);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Format currency for display only
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Update the handleItemChange function
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    
    if (field === 'quantity' || field === 'rate') {
      // Extract numeric value
      updatedItems[index][field] = parseFormattedNumber(value);
    } else {
      updatedItems[index][field] = value;
    }
    
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  // Update the handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'tax' || name === 'amountPaid') {
      setInvoiceData({
        ...invoiceData,
        [name]: parseFormattedNumber(value)
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        [name]: value
      });
    }
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;
    
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  // Add calculation functions
  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.tax / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculateBalanceDue = () => {
    return calculateTotal() - invoiceData.amountPaid;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateFileName = () => {
    const date = formatDate(invoiceData.date);
    const invoiceNum = invoiceData.invoiceNumber || 'default';
    return `invoice-${invoiceNum}-${date}.pdf`;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Define maxWidth for text wrapping
    const maxWidth = 180; // Maximum width for text in mm
    
    // Format currency for PDF with thousand separators
    const formatPdfCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount).replace(/\s/g, ' '); // Replace any non-breaking spaces
    };
    
    // Format number with thousand separators (without currency symbol)
    const formatPdfNumber = (number) => {
      return number.toLocaleString('id-ID');
    };
    
    // Set fixed dimensions for logo
    const logoWidthMm = 50;
    const logoHeightMm = 25; // Fixed height
    
    // Add logo with fixed dimensions
    doc.addImage(logo, 'PNG', 15, 15, logoWidthMm, logoHeightMm);
    
    // Initialize starting Y position for content
    let yPos = logoHeightMm + 25;
    
    // Company details
    doc.setFontSize(10);
    doc.text('Suitlabs Bali', 15, yPos);

    // Add a horizontal delimiter
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 5, 195, yPos + 5);

    // Invoice title and number
    doc.setFontSize(24);
    doc.text('INVOICE', 150, 30);
    doc.setFontSize(12);
    doc.text(`#${invoiceData.invoiceNumber}`, 150, 38);

    // Bill To and Dates
    doc.setFontSize(11);
    yPos = logoHeightMm + 40;

    // Bill To with text wrapping
    doc.text('Bill To:', 15, yPos);
    const billToLines = doc.splitTextToSize(invoiceData.billTo || '', 70);
    billToLines.forEach((line, index) => {
      doc.text(line, 15, yPos + 8 + (index * 6));
    });

    // Dates
    doc.text(`Date: ${invoiceData.date}`, 150, yPos);
    doc.text(`Due Date: ${invoiceData.dueDate}`, 150, yPos + 8);

    // Update yPos based on the number of bill to lines
    yPos += Math.max(25, (billToLines.length * 6) + 15);

    // Add a horizontal delimiter before items table
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 5, 195, yPos - 5);

    // Items table
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.text('Item', 15, yPos + 6);
    doc.text('Qty', 95, yPos + 6);
    doc.text('Rate', 115, yPos + 6);
    doc.text('Amount', 155, yPos + 6);

    yPos += 8;

    // Items
    invoiceData.items.forEach((item, index) => {
      const itemDescription = doc.splitTextToSize(item.description || '', 75);
      
      // Draw item details
      itemDescription.forEach((line, lineIndex) => {
        doc.text(line, 15, yPos + 6 + (lineIndex * 6));
      });
      
      doc.text(formatPdfNumber(item.quantity), 95, yPos + 6);
      doc.text(formatPdfCurrency(item.rate), 115, yPos + 6);
      doc.text(formatPdfCurrency(item.quantity * item.rate), 155, yPos + 6);
      
      // Calculate height needed for this item
      const itemHeight = Math.max(10, (itemDescription.length * 6) + 4);
      
      // Add a light delimiter line between items
      if (index < invoiceData.items.length - 1) {
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.3);
        doc.line(15, yPos + itemHeight, 195, yPos + itemHeight);
      }
      
      yPos += itemHeight;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Add a horizontal delimiter before summary
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 5, 195, yPos + 5);
    yPos += 15;

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * (invoiceData.tax / 100);
    const total = subtotal + tax;
    const balanceDue = total - invoiceData.amountPaid;

    // Check if we need a new page for summary
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    // Summary section with right alignment
    doc.text(`Subtotal:`, 130, yPos);
    doc.text(formatPdfCurrency(subtotal), 195, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text(`Tax (${invoiceData.tax}%):`, 130, yPos);
    doc.text(formatPdfCurrency(tax), 195, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text(`Total:`, 130, yPos);
    doc.text(formatPdfCurrency(total), 195, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text(`Amount Paid:`, 130, yPos);
    doc.text(formatPdfCurrency(invoiceData.amountPaid), 195, yPos, { align: 'right' });
    
    yPos += 8;
    // Highlight balance due with a box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.rect(125, yPos - 5, 70, 10, 'F');
    doc.text(`Balance Due:`, 130, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(formatPdfCurrency(balanceDue), 195, yPos, { align: 'right' });

    // Add a horizontal delimiter before terms
    yPos += 15;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 10;

    // Terms with text wrapping
    if (invoiceData.terms) {
      // Check if we need a new page for terms
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text('Terms:', 15, yPos);
      const termsLines = doc.splitTextToSize(invoiceData.terms, maxWidth - 30);
      termsLines.forEach((line, index) => {
        doc.text(line, 15, yPos + 8 + (index * 6));
      });
    }

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }

    // Save the PDF
    doc.save(generateFileName());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  return (
    <div className="invoice-wrapper">
      <div className="header-actions">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="invoice-container">
        <form onSubmit={handleSubmit}>
          <div className="invoice-header">
            <img src={logo} alt="Suitlabs Logo" className="logo" />
            <div>
              <h1>INVOICE</h1>
            </div>
          </div>
          
          <div className="section-divider"></div>
          
          <div className="form-section">
            <div className="form-section-title">Invoice Information</div>
            <div className="invoice-info">
              <div className="info-row">
                <label>Invoice Number:</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="info-row">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="info-row">
                <label>Due Date:</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoiceData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-section-title">Client Information</div>
            <div className="info-row">
              <label>Bill To:</label>
              <textarea
                name="billTo"
                value={invoiceData.billTo}
                onChange={handleInputChange}
                placeholder="Client name and address"
                required
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-section-title">Invoice Items</div>
            <div className="invoice-items">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        ></textarea>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formatNumberInput(item.quantity)}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatNumberInput(item.rate)}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          min="0"
                          required
                        />
                      </td>
                      <td>{formatCurrency(item.quantity * item.rate)}</td>
                      <td>
                        <button type="button" className="remove-item" onClick={() => removeItem(index)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="add-item" onClick={addItem}>+ Add Item</button>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-section-title">Summary</div>
            <div className="invoice-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Tax (%):</span>
                <input
                  type="text"
                  inputMode="decimal"
                  name="tax"
                  value={formatNumberInput(invoiceData.tax)}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="summary-row">
                <span>Tax Amount:</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="summary-row">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Amount Paid:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  name="amountPaid"
                  value={formatNumberInput(invoiceData.amountPaid)}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="summary-row balance-due">
                <span>Balance Due:</span>
                <span>{formatCurrency(calculateBalanceDue())}</span>
              </div>
            </div>
          </div>
          
          <div className="form-section terms-section">
            <div className="form-section-title">Terms and Notes</div>
            <div className="info-row">
              <label>Terms:</label>
              <textarea
                name="terms"
                value={invoiceData.terms}
                onChange={handleInputChange}
                placeholder="Payment terms, notes, or other information"
              ></textarea>
            </div>
          </div>
          
          <button type="submit" className="submit-btn">Generate PDF</button>
        </form>
      </div>
    </div>
  );
};

export default Invoice;
