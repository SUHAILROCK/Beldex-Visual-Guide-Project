module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  try {
    // Fetch from all known working API endpoints in parallel
    const [infoRes, emissionRes, statsRes, mnStatsRes] = await Promise.allSettled([
      fetch('https://explorer.beldex.io/api/networkinfo'),
      fetch('https://explorer.beldex.io/api/emission'),
      fetch('https://explorer.beldex.io/api/get_stats'),
      fetch('https://explorer.beldex.io/api/master_node_stats')
    ]);

    const data = {};

    // Network info: block height, hard fork, fees, block size, blockchain size, tx pool, BNS
    if (infoRes.status === 'fulfilled' && infoRes.value.ok) {
      try {
        const info = await infoRes.value.json();
        const d = info.data || info;

        if (d.height) data.blockHeight = d.height;
        if (d.current_hf_version) data.hardFork = 'v' + d.current_hf_version;
        else if (d.hard_fork) data.hardFork = 'v' + d.hard_fork;

        // TX pool size from networkinfo
        if (d.tx_pool_size !== undefined) data.txPoolCount = d.tx_pool_size;

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

        // Staking requirement from networkinfo
        if (d.staking_requirement) {
          data.stakingRequirement = Math.round(d.staking_requirement / 1e9);
        }

        // BNS counts from networkinfo
        if (d.bns_counts !== undefined) {
          // Could be a number or an object with sub-counts
          if (typeof d.bns_counts === 'number') {
            data.totalBNS = d.bns_counts;
          } else if (typeof d.bns_counts === 'object') {
            // Sum all BNS type counts
            let total = 0;
            for (const key of Object.keys(d.bns_counts)) {
              total += d.bns_counts[key] || 0;
            }
            data.totalBNS = total;
          }
        }

        // Store raw networkinfo for debug
        data._networkinfoKeys = Object.keys(d);
      } catch (e) {
        data._networkinfoError = e.message;
      }
    }

    // Emission data: burned BDX, circulating supply
    // Fields: burn_amount, emission_amount, fee_amount, circulating_supply
    if (emissionRes.status === 'fulfilled' && emissionRes.value.ok) {
      try {
        const em = await emissionRes.value.json();
        const d = em.data || em;

        // burn_amount is the correct field name (in atomic units)
        if (d.burn_amount) {
          data.burnedBDX = d.burn_amount > 1e12 ? d.burn_amount / 1e9 : d.burn_amount;
        } else if (d.burned || d.burnt) {
          const burned = d.burned || d.burnt;
          data.burnedBDX = burned > 1e12 ? burned / 1e9 : burned;
        }

        if (d.emission_amount) {
          data.totalEmission = d.emission_amount > 1e12 ? d.emission_amount / 1e9 : d.emission_amount;
        }
        if (d.circulating_supply) {
          data.circulatingSupply = d.circulating_supply > 1e12 ? d.circulating_supply / 1e9 : d.circulating_supply;
        }

        // Store raw emission keys for debug
        data._emissionKeys = Object.keys(d);
      } catch (e) {
        data._emissionError = e.message;
      }
    }

    // Get stats: difficulty, height, burn, total_emission, last_timestamp, last_reward
    if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
      try {
        const st = await statsRes.value.json();
        const d = st.data || st;

        // Fallback burn data from get_stats
        if (!data.burnedBDX && d.burn) {
          data.burnedBDX = d.burn > 1e12 ? d.burn / 1e9 : d.burn;
        }
        if (d.difficulty) data.difficulty = d.difficulty;
        if (d.last_reward) {
          data.lastReward = d.last_reward > 1e6 ? (d.last_reward / 1e9).toFixed(2) : d.last_reward;
        }

        data._statsKeys = Object.keys(d);
      } catch (e) {
        data._statsError = e.message;
      }
    }

    // Master node stats: active, funded, awaiting_contribution, decommissioned
    if (mnStatsRes.status === 'fulfilled' && mnStatsRes.value.ok) {
      try {
        const mn = await mnStatsRes.value.json();
        const d = mn.data || mn;

        if (d.active !== undefined) data.activeNodes = d.active;
        else if (d.funded !== undefined) data.activeNodes = d.funded;

        if (d.decommissioned !== undefined) data.decomNodes = d.decommissioned;
        if (d.awaiting_contribution !== undefined) data.awaitingNodes = d.awaiting_contribution;

        // Staking requirement from master node stats (fallback)
        if (!data.stakingRequirement && d.staking_requirement) {
          data.stakingRequirement = d.staking_requirement > 1e6
            ? Math.round(d.staking_requirement / 1e9)
            : d.staking_requirement;
        }

        data._mnStatsKeys = Object.keys(d);
      } catch (e) {
        data._mnStatsError = e.message;
      }
    }

    // Fallback: try /api/master_nodes if stats endpoint failed
    if (data.activeNodes === undefined) {
      try {
        const mnAlt = await fetch('https://explorer.beldex.io/api/master_nodes');
        if (mnAlt.ok) {
          const mnData = await mnAlt.json();
          const d = mnData.data || mnData;
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

    // Get recent blocks
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

    // Last resort: scrape block links from HTML
    if (!data.recentBlocks || data.recentBlocks.length === 0) {
      try {
        const htmlRes = await fetch('https://explorer.beldex.io/', {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeldexStats/1.0)' }
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
          if (!data.blockHeight && blocks.length > 0) {
            data.blockHeight = blocks[0].height;
          }
        }
      } catch (e) {}
    }

    // Debug: include which endpoints responded
    data._debug = {
      networkinfo: infoRes.status === 'fulfilled' ? infoRes.value.status : 'failed',
      emission: emissionRes.status === 'fulfilled' ? emissionRes.value.status : 'failed',
      get_stats: statsRes.status === 'fulfilled' ? statsRes.value.status : 'failed',
      master_node_stats: mnStatsRes.status === 'fulfilled' ? mnStatsRes.value.status : 'failed'
    };

    data.fetchedAt = Date.now();
    res.status(200).json({ ok: true, data });

  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
