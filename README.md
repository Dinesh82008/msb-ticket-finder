# MSB Ticket Finder & Printer (Zip Bundle)

A full‑stack app for **finding and printing Tickera tickets** by **Order ID**.

- **Backend**: Node.js + Express proxy to Tickera Check‑in API (`/tc-api/{API_KEY}/…`) to keep API key private.
- **Frontend**: React (Vite) with **search**, **loading/error states**, **ticket display**, **print**, **QR + Code128 barcode**.
- **Branding**: MSB logo placeholder included.

> Tickera exposes Check‑in endpoints such as `check_credentials` and `tickets_info/{pageSize}/{page}` returning attendees/tickets with a **ticket code (checksum)**; we filter those by Order ID on the server and render QR + barcode from the code. \[Refs: Tickera API Access & Check‑in API docs\] (see References).

---

## Quick start (no Docker)

### 1) Backend
```bash
cd server
npm install
npm run dev
# API at http://localhost:5050
```

The `.env` is prefilled for MSB:
```ini
WP_URL=https://msbroadcast.events/
TICKERA_API_KEY=90751253
```

### 2) Frontend
```bash
cd ../client
npm install
npm run dev
# App at http://localhost:5173
```
Vite proxies `/api` to `http://localhost:5050` by default.

---

## Using Docker (optional)
```bash
# from project root
docker compose up --build
# Client: http://localhost:5173  |  Server: http://localhost:5050
```

The client container sets `VITE_API_TARGET=http://server:5050` to proxy through Compose networking.

---

## How it works

1. **Search**: User enters Order ID (e.g., `5941`).
2. **Backend** (`GET /api/tickets/:orderId`):
   - Calls Tickera `tickets_info/{pageSize}/{page}` and streams pages.
   - Filters rows whose `transaction_id` equals the Order ID or starts with `OrderID-`.
   - Returns a normalized JSON with `eventName`, `ticketType`, `attendeeName`, `ticketCode` (checksum), etc.
3. **Frontend**: Displays cards and renders **QR** + **Code128 barcode** from the **ticket code**.
4. **Print**: Click **Print** → thermal‑friendly layout.

> **Why Code 128?** It encodes full ASCII (including hyphen) and is widely supported by scanners; keep `CODE128` (auto/B) for mixed alphanumerics. \[Refs: JsBarcode/Code128 docs\].

---

## Configuration

- `server/.env` — **keep private** (contains your Tickera API key).
- `client/vite.config.js` — proxy target via `VITE_API_TARGET` (Docker) or defaults to `http://localhost:5050`.
- `client/src/print.css` — customize MSB colors and print presets (58mm/80mm).
- `client/public/msb-logo.png` — replace with your official logo.

---

## References

- Tickera — **API Access** overview (API keys for Check‑in)  
  https://tickera.com/tickera-documentation/settings/api-access/
- Tickera — **Check‑in API** endpoints, incl. `check_credentials` and `tickets_info`  
  https://tickera.com/tickera-documentation/check-in-api/
- Tickera — **QR & Barcode** on tickets are generated from the ticket code (checksum)  
  https://tickera.com/tickera-documentation/can-include-qr-barcode-ticket/
- JsBarcode / Code128 — Support & options via react-barcode wrapper  
  https://www.npmjs.com/package/react-barcode , https://github.com/lindell/JsBarcode

---

## Security
- The Tickera API key stays **server‑side** only.
- Keep Tickera up to date (older versions had a ticket leakage issue fixed in later releases).

---

## License
This bundle is for internal MSB use. Libraries retain their original licenses.
