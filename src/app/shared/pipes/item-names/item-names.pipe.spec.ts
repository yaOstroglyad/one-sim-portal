import { describe, expect, it } from "vitest";
import { ItemNamesPipe } from './item-names.pipe';

describe('ItemNamesPipe', () => {
    it('create an instance', () => {
        const pipe = new ItemNamesPipe();
        expect(pipe).toBeTruthy();
    });
});
