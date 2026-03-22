module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  try {
    // Use JSON API endpoints instead of HTML scraping
    // The explorer is a JS-rendered SPA, so HTML scraping gets empty content
    const [infoRes, emissionRes, mempoolRes, mnRes] = await Promise.allSettled([
      fetch('https://explorer.beldex.io/api/networkinfo'),
      fetch('https://explorer.beldex.io/api/emission'),
      fetch('https://explorer.beldex.io/api/mempool'),
      fetch('https://explorer.beldex.io/api/master_nodes_states')
    ]);

    const data = {};

    // Network info: block height, hard fork, fees, block size, blockchain size
    if (infoRes.status === 'fulfilled' && infoRes.value.ok) {
      try {
        const info = await infoRes.value.json();
        const d = info.data || info;

        if (d.height) data.blockHeight = d.height;
        if (d.current_hf_version) data.hardFork = 'v' + d.current_hf_version;
        else if (d.hard_fork) data.hardFork = 'v' + d.hard_fork;

        // Fees (in atomic units, 1 BDX = 1e9 atomic)
        if (d.fee_per_output) data.baseFeeOutput = (d.fee_per_output / 1e9).toFixed(4);
        if (d.fee_per_kb) data.baseFeeKb = (d.fee_per_kb / 1e9).toFixed(6);
        if (d.flash_fee_per_output) data.flashFeeOutput = (d.flash_fee_per_output / 1e9).toFixed(4);
        if (d.flash_fee_per_kb) data.flashFeeKb = (d.flash_fee_per_kb / 1e9).toFixed(6);

        // Block size
        if (d.block_size_limit) {
          const soft = Math.round(d.block_size_limit / 2 / 1024);
          const hard = Math.round(d.block_size_limit / 1024);
          data.blockSizeSoft = soft + 'kB';
          data.blockSizeHard = hard + 'kB';
        }
        if (d.block_weight_limit) {
          const soft = Math.round(d.block_weight_limit / 2 / 1024);
          const hard = Math.round(d.block_weight_limit / 1024);
          data.blockSizeSoft = soft + 'kB';
          data.blockSizeHard = hard + 'kB';
        }

        // Blockchain size
        if (d.database_size) {
          const gb = (d.database_size / (1024 * 1024 * 1024)).toFixed(1);
          data.blockchainSize = gb + ' GB';
        }

        // Staking requirement
        if (d.staking_requirement) {
          data.stakingRequirement = Math.round(d.staking_requirement / 1e9);
        }
      } catch (e) {
        // networkinfo wasn't JSON, try alternate endpoints
      }
    }

    // Emission data: burned BDX, BNS count
    if (emissionRes.status === 'fulfilled' && emissionRes.value.ok) {
      try {
        const em = await emissionRes.value.json();
        const d = em.data || em;

        if (d.burned || d.burnt) {
          const burned = d.burned || d.burnt;
          // Could be in atomic units or already in BDX
          data.burnedBDX = burned > 1e9 ? burned / 1e9 : burned;
        }
        if (d.total_bns !== undefined) data.totalBNS = d.total_bns;
        if (d.bns_counts !== undefined) data.totalBNS = d.bns_counts;
      } catch (e) {}
    }

    // Mempool
    if (mempoolRes.status === 'fulfilled' && mempoolRes.value.ok) {
      try {
        const mp = await mempoolRes.value.json();
        const d = mp.data || mp;
        if (d.txs) {
          data.txPoolCount = Array.isArray(d.txs) ? d.txs.length : 0;
        } else if (d.tx_count !== undefined) {
          data.txPoolCount = d.tx_count;
        } else {
          data.txPoolCount = 0;
        }
        if (d.txs_size) data.txPoolSize = d.txs_size;
      } catch (e) {
        data.txPoolCount = 0;
      }
    }

    // Master nodes
    if (mnRes.status === 'fulfilled' && mnRes.value.ok) {
      try {
        const mn = await mnRes.value.json();
        const d = mn.data || mn;

        if (d.active) data.activeNodes = d.active;
        else if (d.states && d.states.active) data.activeNodes = d.states.active;

        if (d.decommissioned !== undefined) data.decomNodes = d.decommissioned;
        else if (d.states && d.states.decommissioned) data.decomNodes = d.states.decommissioned;

        if (d.awaiting !== undefined) data.awaitingNodes = d.awaiting;
        else if (d.states && d.states.awaiting) data.awaitingNodes = d.states.awaiting;
      } catch (e) {}
    }

    // If networkinfo didn't work, try alternate endpoint
    if (!data.blockHeight) {
      try {
        const altRes = await fetch('https://explorer.beldex.io/api/transactions', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (altRes.ok) {
          const alt = await altRes.json();
          const d = alt.data || alt;
          if (d.blocks && d.blocks.length > 0) {
            data.blockHeight = d.blocks[0].height || d.blocks[0].block_height;
          }
        }
      } catch (e) {}
    }

    // Get recent blocks from the main page links as fallback
    if (!data.recentBlocks || data.recentBlocks.length === 0) {
      try {
        const txRes = await fetch('https://explorer.beldex.io/api/transactions');
        if (txRes.ok) {
          const txData = await txRes.json();
          const d = txData.data || txData;
          if (d.blocks) {
            data.recentBlocks = d.blocks.slice(0, 10).map(b => ({
              height: b.height || b.block_height,
              age: b.age || '',
              size: b.size ? (b.size > 1024 ? (b.size/1024).toFixed(1)+'kB' : b.size+'B') : '',
              txs: b.txs || []
            }));
          }
        }
      } catch (e) {}
    }

    // Last resort: scrape block links from HTML (this already worked)
    if (!data.recentBlocks || data.recentBlocks.length === 0) {
      try {
        const htmlRes = await fetch('https://explorer.beldex.io/', {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeldexExplorer/1.0)' }
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
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

          // Also derive block height from highest block
          if (!data.blockHeight && blocks.length > 0) {
            data.blockHeight = blocks[0].height;
          }
        }
      } catch (e) {}
    }

    // If we still don't have masternode data, try the HTML page
    if (!data.activeNodes) {
      try {
        const mnHtml = await fetch('https://explorer.beldex.io/api/master_nodes');
        if (mnHtml.ok) {
          const mnData = await mnHtml.json();
          const d = mnData.data || mnData;
          // Count from array if returned as list
          if (Array.isArray(d)) {
            data.activeNodes = d.filter(n => n.active || n.funded).length;
            data.decomNodes = d.filter(n => n.decommissioned).length;
            data.awaitingNodes = d.filter(n => n.awaiting).length;
          } else if (d.master_nodes && Array.isArray(d.master_nodes)) {
            data.activeNodes = d.master_nodes.length;
          }
        }
      } catch (e) {}
    }

    // Debug: include which endpoints responded for troubleshooting
    data._debug = {
      networkinfo: infoRes.status === 'fulfilled' ? infoRes.value.status : 'failed',
      emission: emissionRes.status === 'fulfilled' ? emissionRes.value.status : 'failed',
      mempool: mempoolRes.status === 'fulfilled' ? mempoolRes.value.status : 'failed',
      masternodes: mnRes.status === 'fulfilled' ? mnRes.value.status : 'failed'
    };

    data.fetchedAt = Date.now();
    res.status(200).json({ ok: true, data });

  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
