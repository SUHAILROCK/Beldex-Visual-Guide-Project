export default async function handler(req, res) {
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

      // Block height
      const hm = html.match(/Height\s+([\d,]+)/);
      if (hm) data.blockHeight = parseInt(hm[1].replace(/,/g, ''));

      // Hard fork
      const hfm = html.match(/Hard fork:\s*(v[\d]+)/i);
      if (hfm) data.hardFork = hfm[1];

      // Staking requirement
      const sm = html.match(/Staking requirement:\s*([\d,]+)\s*BDX/i);
      if (sm) data.stakingRequirement = parseInt(sm[1].replace(/,/g, ''));

      // Base fee
      const bfm = html.match(/Base fee:\s*([\d.]+)\s*BDX\/output\s*\+\s*([\d.]+)\s*BDX\/kB/i);
      if (bfm) { data.baseFeeOutput = bfm[1]; data.baseFeeKb = bfm[2]; }

      // Flash fee
      const ffm = html.match(/Flash fee:\s*([\d.]+)\s*BDX\/output\s*\+\s*([\d.]+)\s*BDX\/kB/i);
      if (ffm) { data.flashFeeOutput = ffm[1]; data.flashFeeKb = ffm[2]; }

      // Block size limit
      const blm = html.match(/Block size limit:\s*([\d]+kB)\/([\d]+kB)/i);
      if (blm) { data.blockSizeSoft = blm[1]; data.blockSizeHard = blm[2]; }

      // Blockchain size
      const bcm = html.match(/Blockchain size:\s*([\d.]+\s*\w+)/i);
      if (bcm) data.blockchainSize = bcm[1].trim();

      // Burned BDX
      const burn = html.match(/Burned:+\s*([\d,]+\.[\d]+)\s*BDX/i);
      if (burn) data.burnedBDX = parseFloat(burn[1].replace(/,/g, ''));

      // BNS total
      const bns = html.match(/Total BNS:\s*([\d,]+)/i);
      if (bns) data.totalBNS = parseInt(bns[1].replace(/,/g, ''));

      // TX pool
      const pool = html.match(/(\d+)\s+transactions?,\s*([\d.]+\w*)/i);
      if (pool) { data.txPoolCount = parseInt(pool[1]); data.txPoolSize = pool[2]; }
      else { data.txPoolCount = 0; data.txPoolSize = '0B'; }

      // Block weights line
      const wm = html.match(/Min\.\s*\/\s*Median\s*\/\s*Average\s*\/\s*Max\.\s*weights.*?:\s*([\d.]+\w*)\s*\/\s*([\d.]+\w*)\s*\/\s*([\d.]+\w*)\s*\/\s*([\d.]+\w*)/i);
      if (wm) {
        data.blockWeightMin = wm[1];
        data.blockWeightMedian = wm[2];
        data.blockWeightAvg = wm[3];
        data.blockWeightMax = wm[4];
      }

      // Parse recent blocks from the transactions table
      // Each block row: Height | Age | Size | Type | TX Hash | Fee | Outputs | In/Out | TX Size
      const blockRows = [];
      const seen = new Set();

      // Match block height links
      const blockMatches = [...html.matchAll(/href="\/block\/(\d+)"/g)];
      const txMatches = [...html.matchAll(/href="\/tx\/([a-f0-9]{64})"/g)];

      // Parse table rows for blocks more carefully
      const tableSection = html.match(/Transactions in the Last 20 Blocks[\s\S]*?(<table[\s\S]*?<\/table>)/i);
      if (tableSection) {
        const tableHtml = tableSection[1];
        // Find all <tr> rows
        const rows = [...tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
        let currentBlock = null;

        rows.forEach(row => {
          const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => {
            return c[1].replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();
          });

          if (cells.length >= 4) {
            const heightMatch = cells[0].match(/\d{7}/);
            if (heightMatch && !seen.has(parseInt(heightMatch[0]))) {
              const h = parseInt(heightMatch[0]);
              seen.add(h);
              currentBlock = {
                height: h,
                age: cells[1] || '',
                size: cells[2] || '',
                txs: []
              };
              blockRows.push(currentBlock);
            } else if (currentBlock && cells[3]) {
              // It's a TX row within the current block
              const fee = cells[4] || '0';
              const inOut = cells[7] || '';
              const isBurn = fee.includes('🔥') || cells[4]?.includes('🔥');
              currentBlock.txs.push({
                fee: fee.replace(/[🔥]/g, '').trim(),
                inOut,
                burn: isBurn
              });
            }
          }
        });
      }

      // Fallback: just get block heights from links
      if (blockRows.length === 0) {
        for (const m of blockMatches) {
          const h = parseInt(m[1]);
          if (h > 1000000 && !seen.has(h)) {
            seen.add(h);
            blockRows.push({ height: h, age: '', size: '', txs: [] });
            if (blockRows.length >= 10) break;
          }
        }
      }

      data.recentBlocks = blockRows.slice(0, 10);
      data.recentTxCount = txMatches.length;
    }

    // Master nodes page
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
}