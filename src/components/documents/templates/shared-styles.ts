/**
 * Shared inline styles for document PDF templates.
 * We use inline styles (not Tailwind) because html2canvas
 * needs actual computed styles, not class names.
 */

export function getDocumentStyles(primaryColor = '#0d5c63', secondaryColor = '#e57007') {
  return {
    page: {
      width: '210mm',
      minHeight: '297mm',
      padding: '15mm 15mm 20mm 15mm',
      fontFamily: 'Heebo, system-ui, sans-serif',
      fontSize: '11px',
      lineHeight: '1.6',
      color: '#1a1a1a',
      backgroundColor: '#ffffff',
      direction: 'rtl' as const,
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: `2px solid ${primaryColor}`,
    },
    headerRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      gap: '4px',
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: '2px',
      textAlign: 'left' as const,
    },
    garageName: {
      fontSize: '22px',
      fontWeight: '900',
      color: primaryColor,
      margin: 0,
    },
    garageInfo: {
      fontSize: '10px',
      color: '#666',
      margin: 0,
    },
    logo: {
      width: '80px',
      height: '80px',
      objectFit: 'contain' as const,
      borderRadius: '8px',
    },
    docTitle: {
      fontSize: '18px',
      fontWeight: '900',
      color: primaryColor,
      textAlign: 'center' as const,
      marginBottom: '6px',
    },
    docNumber: {
      fontSize: '13px',
      fontWeight: '700',
      textAlign: 'center' as const,
      color: '#333',
      marginBottom: '16px',
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '800',
      color: primaryColor,
      marginBottom: '8px',
      paddingBottom: '4px',
      borderBottom: `1px solid ${primaryColor}33`,
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6px 20px',
      marginBottom: '16px',
    },
    infoRow: {
      display: 'flex',
      gap: '8px',
      alignItems: 'baseline',
    },
    infoLabel: {
      fontSize: '10px',
      fontWeight: '700',
      color: '#666',
      minWidth: '70px',
    },
    infoValue: {
      fontSize: '11px',
      fontWeight: '500',
      color: '#1a1a1a',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '16px',
    },
    tableHeader: {
      backgroundColor: primaryColor,
      color: '#ffffff',
    },
    th: {
      padding: '8px 10px',
      fontSize: '10px',
      fontWeight: '700',
      textAlign: 'right' as const,
      borderBottom: `2px solid ${primaryColor}`,
    },
    td: {
      padding: '7px 10px',
      fontSize: '11px',
      borderBottom: '1px solid #eee',
      textAlign: 'right' as const,
    },
    tdLeft: {
      padding: '7px 10px',
      fontSize: '11px',
      borderBottom: '1px solid #eee',
      textAlign: 'left' as const,
    },
    tdCenter: {
      padding: '7px 10px',
      fontSize: '11px',
      borderBottom: '1px solid #eee',
      textAlign: 'center' as const,
    },
    rowEven: {
      backgroundColor: '#f8f9fa',
    },
    totalsSection: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
    },
    totalsBox: {
      minWidth: '200px',
      padding: '12px',
      border: `1px solid ${primaryColor}33`,
      borderRadius: '6px',
    },
    totalsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '3px 0',
    },
    totalLabel: {
      fontSize: '11px',
      color: '#666',
    },
    totalValue: {
      fontSize: '11px',
      fontWeight: '600',
      fontVariantNumeric: 'tabular-nums',
    },
    totalsFinalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0 0 0',
      marginTop: '6px',
      borderTop: `2px solid ${primaryColor}`,
    },
    totalFinalLabel: {
      fontSize: '14px',
      fontWeight: '900',
      color: primaryColor,
    },
    totalFinalValue: {
      fontSize: '14px',
      fontWeight: '900',
      color: primaryColor,
      fontVariantNumeric: 'tabular-nums',
    },
    signatureLine: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '30px',
      gap: '40px',
    },
    signatureBlock: {
      flex: 1,
      textAlign: 'center' as const,
    },
    signatureDivider: {
      borderTop: '1px solid #999',
      width: '100%',
      marginTop: '40px',
      marginBottom: '4px',
    },
    signatureLabel: {
      fontSize: '10px',
      color: '#666',
      fontWeight: '600',
    },
    footer: {
      position: 'absolute' as const,
      bottom: '10mm',
      left: '15mm',
      right: '15mm',
      textAlign: 'center' as const,
      fontSize: '9px',
      color: '#999',
      borderTop: '1px solid #eee',
      paddingTop: '8px',
    },
    notesBox: {
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      borderRight: `3px solid ${secondaryColor}`,
      marginBottom: '16px',
    },
    notesText: {
      fontSize: '11px',
      color: '#333',
      margin: 0,
      whiteSpace: 'pre-wrap' as const,
    },
    badge: {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: '700',
      backgroundColor: `${primaryColor}15`,
      color: primaryColor,
      border: `1px solid ${primaryColor}33`,
    },
  }
}

export function formatCurrencyDoc(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateDoc(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
