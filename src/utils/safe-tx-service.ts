// Utilities to fetch multisig transactions from a Safe Transaction Service
// Implements paging and a convenience to fetch all pages

export type SafeMultisigConfirmation = {
  owner: string | null;
  submissionDate: string | null;
  transactionHash: string | null;
  signature: string | null;
  signatureType: string | null;
};

export type SafeMultisigTransaction = {
  safe: string;
  to: string | null;
  value: string | null;
  data: string | null;
  operation: number | null;
  gasToken: string | null;
  safeTxGas: string | null;
  baseGas: string | null;
  gasPrice: string | null;
  refundReceiver: string | null;
  nonce: string | null | number;
  executionDate: string | null;
  submissionDate: string | null;
  modified: string | null;
  blockNumber: number | null;
  transactionHash: string | null;
  safeTxHash: string | null;
  proposer: string | null;
  proposedByDelegate: string | null;
  executor: string | null;
  isExecuted: boolean | null;
  isSuccessful: boolean | null;
  ethGasPrice?: string | null;
  maxFeePerGas?: string | null;
  maxPriorityFeePerGas?: string | null;
  gasUsed?: number | null;
  fee?: string | null;
  origin?: string | null;
  dataDecoded?: unknown | null;
  confirmationsRequired?: number | null;
  confirmations?: SafeMultisigConfirmation[] | null;
  trusted?: boolean | null;
  signatures?: string | null;
  [k: string]: unknown;
};

export type SafeMultisigTransactionsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SafeMultisigTransaction[];
  countUniqueNonce?: number;
};

function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // Booleans and numbers are converted to string automatically
    usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

/**
 * Fetches a single page of multisig transactions from the Safe Transaction Service.
 *
 * @param txServiceUrl - Base URL of the tx service (e.g. https://safe-transaction-...)
 * @param safeAddress - Safe address (checksum or lower-case)
 * @param params - Optional query params (limit, offset, ordering, trusted, etc.)
 * @param signal - Optional AbortSignal
 * @returns parsed `SafeMultisigTransactionsResponse`
 */
export async function getMultisigTransactionsPage(
  txServiceUrl: string,
  safeAddress: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal
): Promise<SafeMultisigTransactionsResponse> {
  if (!txServiceUrl) throw new Error('txServiceUrl is required');
  if (!safeAddress) throw new Error('safeAddress is required');

  const base = txServiceUrl.replace(/\/$/, '');
  const endpoint = `${base}/api/v2/safes/${encodeURIComponent(safeAddress)}/multisig-transactions/`;
  const url = `${endpoint}${buildQueryString(params)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Safe tx service returned ${res.status}: ${text}`);
  }

  const json = (await res.json()) as SafeMultisigTransactionsResponse;
  // Basic validation
  if (!Array.isArray(json.results)) throw new Error('Invalid response from tx service');
  return json;
}

/**
 * Fetches all multisig transactions for a Safe by following pagination.
 * Returns combined `results` from all pages.
 *
 * Note: For very large histories this will perform many requests. Provide filters (e.g. `limit`,
 * `ordering`, `modified__gte`) to restrict results if needed.
 */
export async function getAllMultisigTransactions(
  txServiceUrl: string,
  safeAddress: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal
): Promise<SafeMultisigTransaction[]> {
  const first = await getMultisigTransactionsPage(txServiceUrl, safeAddress, params, signal);
  const results: SafeMultisigTransaction[] = [...first.results];

  let next = first.next;
  // Follow `next` links until exhausted
  while (next) {
    if (signal?.aborted) break;
    const res = await fetch(next, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Safe tx service returned ${res.status}: ${text}`);
    }
    const json = (await res.json()) as SafeMultisigTransactionsResponse;
    results.push(...(json.results || []));
    next = json.next;
  }

  return results;
}

const safeTxService = {
  getMultisigTransactionsPage,
  getAllMultisigTransactions,
};

export default safeTxService;
