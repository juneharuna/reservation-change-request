/**
 * StorageService Interface
 * Defines the contract for storage operations.
 * This sets the stage for Dependency Inversion (DIP).
 */
export class StorageService {
    get(_key) { throw new Error('Method not implemented'); }
    set(_key, _value) { throw new Error('Method not implemented'); }
    remove(_key) { throw new Error('Method not implemented'); }
}
