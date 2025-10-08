import fetch from 'node-fetch';

export class TickeraClient {
  constructor({ wpUrl, apiKey, pageSize = 100 }) {
    this.base = String(wpUrl || '').replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.pageSize = pageSize;
  }

  async checkCredentials() {
    const url = `${this.base}/tc-api/${this.apiKey}/check_credentials`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Tickera check failed: HTTP ${res.status}`);
    try {
      const data = await res.json();
      return Boolean(data?.pass === true);
    } catch (e) {
      return false;
    }
  }

  async *iterateTickets() {
    let page = 1;
    let total = null;
    while (true) {
      const url = `${this.base}/tc-api/${this.apiKey}/tickets_info/${this.pageSize}/${page}/`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`Tickera tickets_info HTTP ${res.status}`);
      let arr;
      try { arr = await res.json(); } catch (e) { arr = []; }
      if (!Array.isArray(arr)) break;

      const additional = arr.find(x => x && x.additional)?.additional;
      if (additional?.results_count != null && total == null) {
        total = Number(additional.results_count);
      }

      // yield rows
      for (const row of arr) {
        if (row && row.data) yield row.data;
      }

      const yielded = arr.filter(x => x && x.data).length;
      if (yielded === 0) break;
      if (total != null && page * this.pageSize >= total) break;
      page += 1;
    }
  }
}
