import type { MuiProductId } from 'src/modules/utils/getProductInfoFromUrl';

type CodeStyling = 'Tailwind' | 'SUI System';
type CodeVariant = 'TS' | 'JS';
export interface DemoData {
  title: string;
  language: string;
  raw: string;
  codeVariant: CodeVariant;
  githubLocation: string;
  productId?: Exclude<MuiProductId, 'null'>;
  codeStyling: CodeStyling;
}
