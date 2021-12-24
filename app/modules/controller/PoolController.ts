import { AbstractEntity } from "../abstract/AbstractEntity";
import { SupportedPools } from "../interfaces/Networks";
import TextHelper from "../util/TextHelper";

export class PoolController extends AbstractEntity {
  chainId: 1 | 56 | 137;

  constructor(chainId: 1 | 56 | 137, protocol: keyof SupportedPools) {
    super();
    this.chainId = chainId;
    this.table = TextHelper.titleCase(TextHelper.sanitize(protocol)) as string;
  }

  findLast() {
    return this.findOne({
      chainId: +this.chainId,
    });
  }
}
