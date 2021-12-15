/**
 * Default class to process text utilities.
 *
 * @method string highlight(text, search);
 *
 */
class TextHelper {
  /**
   * Highlight a string based on the search string matches.
   *
   * For example, the string `Exodus`:
   *
   * If the `serach` param is equal do `odu`, it will result in an `Ex<mark>odu</mark>s` html string.
   * So it should be placed at an innerHTML attribute to surge effect.
   *
   * @param text the target text to search
   * @param search the search string
   * @returns a highlighted string
   */
  static highlight(text: string, search: string): string {
    const rgx = new RegExp(`(${this.sanitize(search)})`, "gim");
    return text.replace(rgx, `<mark>$1</mark>`);
  }

  /**
   * Sanitizes a string removing trailling whitespaces, non-word characters
   * and special characters `*#%@()`
   * @param str the target string
   * @returns a sanitized string
   */
  static sanitize(str: string): string {
    return str
      .trim()
      .replace(/\W+/gim, "")
      .replace(/[*#%@()-]+/gim, "")
      .replace(/[-_]+/g, " ")
      .replace("  ", " ");
  }

  /**
   * Converts a string ro string array  onto title cased string.
   *
   * _Note that if `text` is an array, it will return a string._
   *
   * ### Usage
   *
   * ```ts
   * import Text from '@/util/Text';
   * console.log(Text.titleCase('spread values'));
   * // will print `Spread Values`
   * console.log(Text.titleCase(['spread', 'values']));
   * // will print `Spread Values`
   * console.log(Text.titleCase(['spread', 'values'], {asArray: true}));
   * // will print ['Spread', 'Values']
   * console.log(Text.titleCase('spread values', {asArray: true}));
   * // will print ['Spread', 'Values']
   * ```
   *
   * @param text The string or string array to be converted.
   * @param opts
   * @returns
   */
  static titleCase(
    text: string | string[],
    opts?: {
      /**
       *  If it should be returned as an array
       */
      asArray?: boolean;
      /**
       * The separator to split the string if not an array
       */
      separator?: string;
      /**
       * The glue to join the string if asArray is false
       */
      glue?: string;
    }
  ): string | string[] {
    const split = Array.isArray(text)
      ? text
      : text.split(opts?.separator ?? " ");
    const result = split.map(
      (item) => item.charAt(0).toUpperCase() + item.substring(1)
    );
    return opts?.asArray ? result : result.join(opts?.glue ?? " ");
  }
}

export default TextHelper;
