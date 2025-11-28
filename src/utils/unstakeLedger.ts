import { NIBIRU_EVM_ADDRESSES, STNIBI_DECIMALS } from '../config/nibiruEvm';

import { SafeMultisigTransaction } from './safe-tx-service';

export type MintEvent = {
  id: string | null;
  method: 'liquidStake' | string;
  amountStNibi: number; // human units
  amountNibi?: number; // when available
  timestamp: string;
};

export type UnstakeEntry = {
  id: string | null;
  amountStNibi: number; // human units
  unstakeTimestamp: string;
  unlockTimestamp: string;
  status: 'Pending' | 'Matured' | 'Redeemed';
  redeemedAt?: string | null;
};

export type RedeemEvent = {
  id: string | null;
  redeemedAmountStNibi: number; // human units (estimated if no on-chain balance)
  timestamp: string;
};

export type LedgerResult = {
  mintedEvents: MintEvent[];
  unstakeQueue: UnstakeEntry[];
  redeemedEvents: RedeemEvent[];
  estAvailableStNibi: number; // estimated unlocked stNIBI available (human)
  totalOutstandingUnstake: number; // sum of Pending+Matured not Redeemed
  totalRedeemableNow: number; // matured & not redeemed
  warnings: string[];
};

const UNSTAKE_DELAY_MS = 21 * 24 * 60 * 60 * 1000; // 21 days

function parseParamValue(
  params: Array<{ name: string; value: string }> | undefined,
  name: string
): string | null {
  if (!params) return null;
  const p = params.find((x) => x.name === name);
  return p ? p.value : null;
}

type DataDecoded = {
  method?: string;
  parameters?: Array<{ name: string; type?: string; value: string }>;
} | null;

function getDataDecoded(dataDecoded: unknown): DataDecoded {
  if (!dataDecoded || typeof dataDecoded !== 'object') return null;
  const ddRec = dataDecoded as Record<string, unknown>;
  const method = typeof ddRec['method'] === 'string' ? (ddRec['method'] as string) : undefined;
  let params: Array<{ name: string; type?: string; value: string }> | undefined;
  if (Array.isArray(ddRec['parameters'])) {
    params = ddRec['parameters'] as Array<{ name: string; type?: string; value: string }>;
  }
  return { method, parameters: params };
}

function unitsToHuman(unitsStr: string, decimals: number): number {
  try {
    const v = BigInt(unitsStr);
    if (v === BigInt(0)) return 0;
    let base = BigInt(1);
    for (let i = 0; i < decimals; i++) {
      base *= BigInt(10);
    }
    const whole = v / base;
    const frac = v % base;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    if (fracStr === '') return Number(whole.toString());
    return Number(whole.toString()) + Number('0.' + fracStr);
  } catch {
    return Number(unitsStr || 0);
  }
}

export function computeUnstakeLedger(
  transactions: SafeMultisigTransaction[],
  opts?: { chainId?: number; now?: Date }
): LedgerResult {
  const warnings: string[] = [];
  const chainId = opts?.chainId ?? 6911; // default to testnet address in repo
  const canonicalAddr = NIBIRU_EVM_ADDRESSES[chainId as keyof typeof NIBIRU_EVM_ADDRESSES];

  // Filter transactions targeted to the staking contract when possible
  const filtered = transactions.filter((tx) => {
    if (canonicalAddr && tx.to) return tx.to.toLowerCase() === canonicalAddr.toLowerCase();
    return true;
  });

  // Sort by executionDate (fallback to submissionDate)
  filtered.sort((a, b) => {
    const ta = new Date(a.executionDate || a.submissionDate || 0).getTime();
    const tb = new Date(b.executionDate || b.submissionDate || 0).getTime();
    return ta - tb;
  });

  const mintedEvents: MintEvent[] = [];
  const unstakeQueue: UnstakeEntry[] = [];
  const redeemedEvents: RedeemEvent[] = [];

  let estAvailableStNibi = 0;

  for (const tx of filtered) {
    if (tx.isExecuted === false || tx.isSuccessful === false) {
      // skip failed transactions
      continue;
    }

    const ts = tx.executionDate || tx.submissionDate || new Date().toISOString();
    const dd = getDataDecoded(tx.dataDecoded);
    const method = dd?.method;

    if (method === 'liquidStake' || method === 'stake') {
      // amount param usually named 'amount' and is NIBI (18 decimals)
      const amountUnits = parseParamValue(dd?.parameters, 'amount');
      const amountNibi = amountUnits ? unitsToHuman(amountUnits, 18) : 0;
      // Conversion to stNIBI is not determinable from history reliably; assume 1:1 estimate
      const amountSt = amountNibi; // estimated
      mintedEvents.push({
        id: tx.transactionHash || null,
        method: 'liquidStake',
        amountStNibi: amountSt,
        amountNibi,
        timestamp: ts,
      });
      estAvailableStNibi += amountSt;
      continue;
    }

    if (method === 'unstake') {
      // stAmount param expected (stNIBI units, 6 decimals per repo)
      const stUnits = parseParamValue(dd?.parameters, 'stAmount');
      const amountSt = stUnits ? unitsToHuman(stUnits, STNIBI_DECIMALS) : 0;
      const unstakeTimestamp = ts;
      const unlockTimestamp = new Date(
        new Date(unstakeTimestamp).getTime() + UNSTAKE_DELAY_MS
      ).toISOString();
      unstakeQueue.push({
        id: tx.transactionHash || null,
        amountStNibi: amountSt,
        unstakeTimestamp,
        unlockTimestamp,
        status: 'Pending',
        redeemedAt: null,
      });
      estAvailableStNibi -= amountSt;
      continue;
    }

    if (method === 'redeem' || method === 'claim' || method === 'withdraw') {
      // Redeem typically has no params and consumes matured entries
      // Find matured entries by timestamp
      const nowTs = new Date(ts).getTime();
      const matured = unstakeQueue.filter(
        (e) => new Date(e.unlockTimestamp).getTime() <= nowTs && e.status !== 'Redeemed'
      );
      const maturedSum = matured.reduce((s, e) => s + e.amountStNibi, 0);
      if (maturedSum > 0) {
        // mark them redeemed (assume redeem consumes them all — partial redeems unknown without on-chain)
        for (const e of matured) {
          e.status = 'Redeemed';
          e.redeemedAt = ts;
        }
        redeemedEvents.push({
          id: tx.transactionHash || null,
          redeemedAmountStNibi: maturedSum,
          timestamp: ts,
        });
      } else {
        warnings.push(
          `Redeem tx ${tx.transactionHash || '<no-hash>'} executed but no matured entries found to redeem`
        );
      }
      continue;
    }

    // If we reach here, method is unknown / not explicitly handled
    if (!method && tx.data) {
      // Best-effort: skip undecoded raw data (app may implement selector decode elsewhere)
      warnings.push(
        `Encountered tx ${tx.transactionHash || '<no-hash>'} without decoded data; skipped`
      );
    }
  }

  // Post-process statuses given current time
  const now = opts?.now ?? new Date();
  for (const e of unstakeQueue) {
    if (e.status === 'Redeemed') continue;
    if (new Date(e.unlockTimestamp).getTime() <= now.getTime()) {
      e.status = 'Matured';
    } else {
      e.status = 'Pending';
    }
  }

  const totalOutstandingUnstake = unstakeQueue
    .filter((e) => e.status !== 'Redeemed')
    .reduce((s, e) => s + e.amountStNibi, 0);
  const totalRedeemableNow = unstakeQueue
    .filter((e) => e.status === 'Matured')
    .reduce((s, e) => s + e.amountStNibi, 0);

  return {
    mintedEvents,
    unstakeQueue,
    redeemedEvents,
    estAvailableStNibi,
    totalOutstandingUnstake,
    totalRedeemableNow,
    warnings,
  };
}

export default computeUnstakeLedger;
