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
      <header className="brand">
        <img src="/msb-logo.png" alt="MSB" className="logo" />
        <h1> Ticket Finder & Printer </h1>
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
                  <h2 className="event">{t.eventName || 'Event'}</h2>
                  <p className="type">{t.ticketType || 'Ticket'}</p>
                </header>

                <section className="grid">
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
                </section>

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
            <button onClick={handlePrint} className="print">Print</button>
          </div>
        </>
      )}
    </main>
  );
}
