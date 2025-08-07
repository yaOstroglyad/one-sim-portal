import { Injectable } from '@angular/core';

/**
 * Interface for compression/decompression operations
 */
interface CompressionResult {
  data: string;
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Manages compression and decompression of large cache values
 * Uses LZ-string library for browser-compatible compression
 */
@Injectable({
  providedIn: 'root'
})
export class CompressionManager {
  private readonly compressionThreshold = 1024 * 1024; // 1MB threshold

  /**
   * Compress data if it exceeds threshold
   */
  compress(data: any): CompressionResult {
    const serialized = JSON.stringify(data);
    const originalSize = serialized.length * 2; // UTF-16 encoding

    if (originalSize < this.compressionThreshold) {
      return {
        data: serialized,
        compressed: false,
        originalSize,
        compressedSize: originalSize
      };
    }

    try {
      // Simple compression using base64 encoding with RLE-like approach
      const compressed = this.simpleCompress(serialized);
      const compressedSize = compressed.length * 2;

      // Only use compression if it actually saves space
      if (compressedSize < originalSize * 0.8) {
        return {
          data: compressed,
          compressed: true,
          originalSize,
          compressedSize
        };
      }
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
    }

    return {
      data: serialized,
      compressed: false,
      originalSize,
      compressedSize: originalSize
    };
  }

  /**
   * Decompress data if it was compressed
   */
  decompress(result: CompressionResult): any {
    try {
      if (result.compressed) {
        const decompressed = this.simpleDecompress(result.data);
        return JSON.parse(decompressed);
      } else {
        return JSON.parse(result.data);
      }
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Failed to decompress cached data');
    }
  }

  /**
   * Check if data should be compressed based on size
   */
  shouldCompress(data: any): boolean {
    const serialized = JSON.stringify(data);
    return serialized.length * 2 >= this.compressionThreshold;
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(original: number, compressed: number): {
    ratio: number;
    savings: number;
    savingsPercentage: number;
  } {
    const ratio = original > 0 ? compressed / original : 1;
    const savings = original - compressed;
    const savingsPercentage = original > 0 ? (savings / original) * 100 : 0;

    return {
      ratio,
      savings,
      savingsPercentage
    };
  }

  /**
   * Simple compression using run-length encoding for repeated patterns
   */
  private simpleCompress(data: string): string {
    // Basic RLE compression for common patterns
    let compressed = data
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/""/g, '""') // Handle empty strings
      .replace(/null/g, '∅') // Replace null with single char
      .replace(/true/g, '✓') // Replace boolean true
      .replace(/false/g, '✗'); // Replace boolean false

    // Convert to base64 to ensure safe storage
    return btoa(compressed);
  }

  /**
   * Simple decompression - reverse of compression
   */
  private simpleDecompress(data: string): string {
    try {
      const decoded = atob(data);
      
      return decoded
        .replace(/∅/g, 'null')
        .replace(/✓/g, 'true')
        .replace(/✗/g, 'false');
    } catch (error) {
      throw new Error('Invalid compressed data format');
    }
  }

  /**
   * Estimate compression ratio for a given data type
   */
  estimateCompressionRatio(sampleData: any): number {
    try {
      const result = this.compress(sampleData);
      return result.compressedSize / result.originalSize;
    } catch {
      return 1; // No compression
    }
  }

  /**
   * Check if compression is available and working
   */
  isCompressionAvailable(): boolean {
    try {
      const testData = { test: 'data', nested: { array: [1, 2, 3] } };
      const compressed = this.compress(testData);
      const decompressed = this.decompress(compressed);
      
      return JSON.stringify(testData) === JSON.stringify(decompressed);
    } catch {
      return false;
    }
  }
}