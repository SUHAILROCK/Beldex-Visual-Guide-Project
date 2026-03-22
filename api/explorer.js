module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  try {
    const [mainRes, mnRes] = await Promise.allSettled([
      fetch('https://explorer.beldex.io/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeldexExplorer/1.0)' }
      }),
      fetch('https://explorer.beldex.io/master_nodes', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeldexExplorer/1.0)' }
      })
    ]);

    const data = {};

    if (mainRes.status === 'fulfilled' && mainRes.value.ok) {
      const html = await mainRes.value.text();

      const hm = html.match(/Height\s+([\d,]+)/);
      if (hm) data.blockHeight = parseInt(hm[1].replace(/,/g, ''));

      const hfm = html.match(/Hard fork:\s*(v[\d]+)/i);
      if (hfm) data.hardFork = hfm[1];

      const bfm = html.match(/Base fee:\s*([\d.]+)\s*BDX\/output\s*\+\s*([\d.]+)\s*BDX\/kB/i);
      if (bfm) { data.baseFeeOutput = bfm[1]; data.baseFeeKb = bfm[2]; }

      const ffm = html.match(/Flash fee:\s*([\d.]+)\s*BDX\/output\s*\+\s*([\d.]+)\s*BDX\/kB/i);
      if (ffm) { data.flashFeeOutput = ffm[1]; data.flashFeeKb = ffm[2]; }

      const blm = html.match(/Block size limit:\s*([\d]+kB)\/([\d]+kB)/i);
      if (blm) { data.blockSizeSoft = blm[1]; data.blockSizeHard = blm[2]; }

      const bcm = html.match(/Blockchain size:\s*([\d.]+\s*\w+)/i);
      if (bcm) data.blockchainSize = bcm[1].trim();

      const burn = html.match(/Burned:+\s*([\d,]+\.[\d]+)\s*BDX/i);
      if (burn) data.burnedBDX = parseFloat(burn[1].replace(/,/g, ''));

      const bns = html.match(/Total BNS:\s*([\d,]+)/i);
      if (bns) data.totalBNS = parseInt(bns[1].replace(/,/g, ''));

      const pool = html.match(/(\d+)\s+transactions?,\s*([\d.]+\w*)/i);
      data.txPoolCount = pool ? parseInt(pool[1]) : 0;
      data.txPoolSize = pool ? pool[2] : '0B';

      // Extract recent blocks from /block/ links
      const blockMatches = [...html.matchAll(/\/block\/(\d+)/g)];
      const seen = new Set();
      const blocks = [];
      for (const m of blockMatches) {
        const h = parseInt(m[1]);
        if (h > 1000000 && !seen.has(h)) {
          seen.add(h);
          blocks.push({ height: h, txs: [] });
          if (blocks.length >= 10) break;
        }
      }
      data.recentBlocks = blocks;

      // Count burn txs from 🔥 fire emoji occurrences
      const burnTxCount = (html.match(/🔥/g) || []).length;
      data.burnTxCount = burnTxCount;
    }

    if (mnRes.status === 'fulfilled' && mnRes.value.ok) {
      const html = await mnRes.value.text();
      const active = html.match(/(\d[\d,]+)\s+active\s+master\s*nodes?/i);
      if (active) data.activeNodes = parseInt(active[1].replace(/,/g, ''));
      const decom = html.match(/(\d+)\s+decommissioned\s+master\s*nodes?/i);
      if (decom) data.decomNodes = parseInt(decom[1]);
      const awaiting = html.match(/(\d+)\s+master\s*nodes?\s+awaiting\s+contributions/i);
      if (awaiting) data.awaitingNodes = parseInt(awaiting[1]);
    }

    data.fetchedAt = Date.now();
    res.status(200).json({ ok: true, data });

  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};