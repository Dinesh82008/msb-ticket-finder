import { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';

export default function App() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setResult(null);
    if (!orderId.trim()) {
      setErr('Please enter an order ID');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/tickets/${encodeURIComponent(orderId.trim())}`);
      setResult(data);
    } catch (error) {
      const msg = error?.response?.data?.error || error.message;
      setErr(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <main className="container">
      {/* Print styles: print one ticket per page, hide UI controls */}
      <style>{`
        @media print {
          /* hide app chrome */
          .brand, .search, .actions, .muted, .error { display: none !important; }

          /* ensure ticket fills page and each ticket starts on a new page */
          .ticket-list { display: block; }
          .ticket {
            page-break-after: always;
            break-after: page;
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 12mm;
            box-sizing: border-box;
            width: 100%;
          }

          /* avoid cutting barcode or grids */
          .ticket .grid, .ticket .symbols { break-inside: avoid; page-break-inside: avoid; }

          /* optionally remove background/colors for clean prints */
          body { background: #fff; color: #000; }
          img.logo { display: none; } /* hide logo if you want */
        }

        /* screen-friendly spacing (kept unchanged) */
      `}</style>

      <header className="brand">
        <img src="/msb-logo.png" alt="MSB" className="logo" />
        <h5> Ticket Finder & Printer </h5>
      </header>

      <form onSubmit={onSubmit} className="search">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          aria-label="Order ID"
        />
        <button type="submit" disabled={loading}>Search</button>
      </form>

      {loading && <p className="muted">Loading…</p>}
      {err && <p role="alert" className="error">{err}</p>}

      {result?.tickets?.length > 0 && (
        <>
          <div className="ticket-list">
            {result.tickets.map((t, idx) => (
              <article key={idx} className="ticket">
                <header>
                 { /* <h2 className="event">{t.eventName || 'Event'}</h2> */}
                 <h2 className="attendee">{t.attendeeName || '-'}</h2> 
                  <p className="type">{t.ticketType || 'Ticket'}</p>
                </header>

               { /* <section className="grid">
                  <div>
                    <label>Attendee</label>
                    <div>{t.attendeeName || '—'}</div>
                  </div>
                  <div>
                    <label>Ticket Code</label>
                    <div className="code">{t.ticketCode}</div>
                  </div>
                  <div>
                    <label>Order</label>
                    <div>{result.orderId} ({t.orderFragment})</div>
                  </div>
                  <div>
                    <label>Payment Date</label>
                    <div>{t.paymentDate || '—'}</div>
                  </div>
                </section> */}

                <div className="symbols">
                { /* <div className="qr" aria-label="QR Code">
                    <QRCode value={t.ticketCode || ''} size={112} fgColor="#000" bgColor="transparent" />
                  </div>
                 */}
                  <div className="barcode" aria-label="Barcode (Code 128)">
                    <Barcode
                      value={t.ticketCode || ''}
                      format="CODE128"
                      width={2}
                      height={60}
                      displayValue={true}
                      fontSize={12}
                      background="transparent"
                      lineColor="#000000"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="actions">
            <button onClick={handlePrint} className="print"> Ticket Print</button>
          </div>
        </>
      )}
    </main>
  );
}
