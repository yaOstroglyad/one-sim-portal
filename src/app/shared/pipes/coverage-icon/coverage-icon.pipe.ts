import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps coverage type to Material icon name.
 *
 * @example
 * {{ coverage.type | coverageIcon }}  // 'country' → 'location_on'
 */
@Pipe({
  standalone: true,
  name: 'coverageIcon'
})
export class CoverageIconPipe implements PipeTransform {
  private static readonly ICON_MAP: Record<string, string> = {
    country: 'location_on',
    region: 'map',
    global: 'public',
    local: 'place'
  };

  transform(type: string | null | undefined, defaultIcon = 'public'): string {
    if (!type) {
      return defaultIcon;
    }
    return CoverageIconPipe.ICON_MAP[type.toLowerCase()] ?? defaultIcon;
  }
}
