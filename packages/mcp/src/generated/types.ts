// This file is auto-generated. Do not edit manually.

export interface PrimitiveDefinition {
  name: string;
  entryPoint: string;
  exports: string[];
  hasSecondaryEntryPoint: boolean;
  category: string;
  description: string;
  accessibility: string[];
  examples?: Array<{
    name: string;
    code: string;
    description?: string;
  }>;
  reusableComponent?: {
    code: string;
    hasVariants: boolean;
    hasSizes: boolean;
  };
}

export interface ReusableComponentDefinition {
  name: string;
  code: string;
  primitive: string;
  hasVariants: boolean;
  hasSizes: boolean;
}
