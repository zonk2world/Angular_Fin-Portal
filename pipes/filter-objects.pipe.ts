import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterObjects',
  pure: false,
})
export class FilterObjectsPipe implements PipeTransform {
  /**
   * Filters an array of objects to those that have a certain key/value pair.
   *
   * Usage:
   * <li *ngFor="let item of items | filterObjects:{foo:'bar'}">
   */
  transform(items: any[], filter: Record<string, any>): any {
    if (!items || !filter) {
      return items;
    }

    const key = Object.keys(filter)[0];
    const value = filter[key];

    return items.filter(e => e[key] && e[key].indexOf(value) !== -1);
  }
}
