export function mapTicketRow(row) {
  const custom = Object.fromEntries((row.custom_fields || []).map(it => Array.isArray(it) ? it : [String(it?.label||''), String(it?.value||'')]));
  return {
    eventName: custom['Event Name'] || custom['Event'] || null,
    ticketType: custom['Ticket Type'] || null,
    attendeeName: custom['Buyer Name'] || `${row.buyer_first || ''} ${row.buyer_last || ''}`.trim() || null,
    ticketCode: row.checksum || null,
    orderFragment: row.transaction_id || null,
    paymentDate: row.payment_date || null,
    raw: row,
  };
}
