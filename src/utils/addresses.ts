import { getAddress, isAddress } from 'ethers';

export const isChecksummedAddress = (address: string): boolean => {
  if (!isAddress(address)) {
    return false;
  }

  try {
    return getAddress(address) === address;
  } catch {
    return false;
  }
};
