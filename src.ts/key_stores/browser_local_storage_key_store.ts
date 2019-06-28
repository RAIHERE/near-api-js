'use strict';

import { KeyStore } from './keystore';
import { KeyPair } from '../utils/key_pair';

const LOCAL_STORAGE_SECRET_KEY_SUFFIX = '_secretkey';

function storageKeyForSecretKey(networkId: string, accountId: string): string {
    return `${accountId}_${networkId}${LOCAL_STORAGE_SECRET_KEY_SUFFIX}`;
}

export class BrowserLocalStorageKeyStore extends KeyStore {
    private localStorage: any;

    constructor(localStorage: any = window.localStorage) {
        super();
        this.localStorage = localStorage;
    }

    async setKey(networkId: string, accountId: string, keyPair: KeyPair): Promise<void> {
        this.localStorage.setItem(storageKeyForSecretKey(networkId, accountId), keyPair.toString());
    }

    async getKey(networkId: string, accountId: string): Promise<KeyPair> {
        const value = this.localStorage.getItem(storageKeyForSecretKey(networkId, accountId));
        if (!value) {
            return null;
        }
        return KeyPair.fromString(value);
    }

    async removeKey(networkId: string, accountId: string): Promise<void> {
        this.localStorage.removeItem(storageKeyForSecretKey(networkId, accountId));
    }

    async clear(): Promise<void> {
        Object.keys(this.localStorage).forEach((key) => {
            if (key.endsWith(LOCAL_STORAGE_SECRET_KEY_SUFFIX)) {
                this.localStorage.removeItem(key);
            }
        });
    }

    async getNetworks(): Promise<string[]> {
        const result = new Set<string>();
        Object.keys(this.localStorage).forEach((key) => {
            if (key.endsWith(LOCAL_STORAGE_SECRET_KEY_SUFFIX)) {
                const parts = key.split('_');
                result.add(parts[1]);
            }
        });
        return Array.from(result.values());
    }

    async getAccounts(networkId: string): Promise<string[]> {
        const result = new Array<string>();
        Object.keys(this.localStorage).forEach((key) => {
            if (key.endsWith(LOCAL_STORAGE_SECRET_KEY_SUFFIX)) {
                const parts = key.split('_');
                if (parts[1] === networkId) {
                    result.push(parts[0]);
                }
            }
        });
        return result;
    }

    async totalAccounts(): Promise<number> {
        let result = 0;
        Object.keys(this.localStorage).forEach((key) => {
            if (key.endsWith(LOCAL_STORAGE_SECRET_KEY_SUFFIX)) {
                result++;
            }
        });
        return result;
    }
}
